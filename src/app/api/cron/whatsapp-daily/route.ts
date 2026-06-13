import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, calendar } from "@/lib/schema";
import { isProUser } from "@/lib/plan";
import {
  sendWhatsAppText,
  formatDailyPostMessage,
  isEvolutionConfigured,
} from "@/lib/evolution";
import { eq, and, desc } from "drizzle-orm";
import type { CalendarDay } from "@/lib/schema";

// Vercel Cron chama via GET às 8h BRT (11h UTC) — ver vercel.json.
export const maxDuration = 60;

/** Data atual no fuso do Brasil, independente do fuso do servidor. */
function todayInBrazil(): { day: number; month: number; year: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { day: get("day"), month: get("month"), year: get("year") };
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isEvolutionConfigured()) {
    return NextResponse.json({ skipped: "evolution_not_configured" });
  }

  const today = todayInBrazil();

  const recipients = await db
    .select()
    .from(user)
    .where(and(eq(user.whatsappOptIn, true), eq(user.plan, "pro")));

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const u of recipients) {
    if (!u.whatsappNumber || !isProUser(u)) {
      skipped++;
      continue;
    }

    // Calendário mais recente do mês corrente — quem regenerou recebe a versão nova.
    const [cal] = await db
      .select()
      .from(calendar)
      .where(
        and(
          eq(calendar.userId, u.id),
          eq(calendar.month, today.month),
          eq(calendar.year, today.year)
        )
      )
      .orderBy(desc(calendar.createdAt))
      .limit(1);

    const post = (cal?.content as CalendarDay[] | undefined)?.find(
      (d) => d.day === today.day
    );
    if (!cal || !post) {
      skipped++;
      continue;
    }

    try {
      await sendWhatsAppText(
        u.whatsappNumber,
        formatDailyPostMessage(cal.businessName, post)
      );
      sent++;
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error(`[whatsapp-daily] falha para user ${u.id}:`, detail);
      errors.push(u.id);
    }
  }

  return NextResponse.json({ sent, skipped, errors: errors.length });
}
