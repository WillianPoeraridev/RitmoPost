import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { sendEmail, RETENTION_EMAILS } from "@/lib/email";
import { eq } from "drizzle-orm";

export const maxDuration = 60;

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function nextMonthName(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    month: "numeric",
  }).formatToParts(new Date());
  const month = Number(parts.find((p) => p.type === "month")?.value); // 1-12
  return MONTH_NAMES[month % 12]; // mês seguinte (dezembro → Janeiro)
}

const DAY_MS = 86_400_000;

export async function GET(req: NextRequest) {
  const authz = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authz !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ skipped: "resend_not_configured" });
  }

  // dryRun=1 só calcula quem receberia o quê, sem enviar — usado em teste.
  const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";
  const url = process.env.NEXT_PUBLIC_URL ?? "https://ritmopost.com.br";
  const ctx = { url, nextMonthName: nextMonthName() };
  const now = Date.now();

  const users = await db.select().from(user);

  let sent = 0;
  const plan: Record<string, string[]> = {};
  const errors: string[] = [];

  for (const u of users) {
    const daysSince = Math.floor((now - u.createdAt.getTime()) / DAY_MS);
    const already = new Set(u.sentEmails ?? []);
    const toSend = RETENTION_EMAILS.filter(
      (e) =>
        !already.has(e.key) &&
        // Janela [dayOffset, dayOffset+2]: pega o marco quando o usuário cruza,
        // e não dispara retroativo pra quem já passou (ex: cadastros antigos).
        daysSince >= e.dayOffset &&
        daysSince <= e.dayOffset + 2
    );
    if (!toSend.length) continue;

    if (dryRun) {
      plan[u.email] = toSend.map((e) => e.key);
      continue;
    }

    const name = u.name?.split(" ")[0] || "tudo bem";
    const newlySent: string[] = [];
    for (const e of toSend) {
      try {
        await sendEmail(u.email, e.subject, e.body({ name, ...ctx }));
        newlySent.push(e.key);
        sent++;
      } catch (err) {
        console.error(`[retention-emails] falha ${e.key} para ${u.id}:`, err instanceof Error ? err.message : err);
        errors.push(`${u.id}:${e.key}`);
      }
    }
    if (newlySent.length) {
      await db
        .update(user)
        .set({ sentEmails: [...(u.sentEmails ?? []), ...newlySent] })
        .where(eq(user.id, u.id));
    }
  }

  return NextResponse.json(dryRun ? { dryRun: true, plan } : { sent, errors: errors.length });
}
