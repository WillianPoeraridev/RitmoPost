import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calendar, businessProfile } from "@/lib/schema";
import { generateSingleDay, type ProfileContext } from "@/lib/claude";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import type { CalendarDay } from "@/lib/schema";

const bodySchema = z.object({
  calendarId: z.string().uuid(),
  day: z.number().int().min(1).max(31),
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { calendarId, day } = parsed.data;

  const [cal] = await db
    .select()
    .from(calendar)
    .where(and(eq(calendar.id, calendarId), eq(calendar.userId, session.user.id)))
    .limit(1);

  if (!cal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Reaproveita o perfil que gerou o calendário (se ainda existir) para
  // manter o dia regenerado consistente com o resto do mês.
  let profileContext: ProfileContext | undefined;
  if (cal.profileId) {
    const [profile] = await db
      .select()
      .from(businessProfile)
      .where(eq(businessProfile.id, cal.profileId))
      .limit(1);
    if (profile) {
      profileContext = {
        services: profile.services,
        tone: profile.tone,
        differentials: profile.differentials,
        city: profile.city,
        neighborhood: profile.neighborhood,
        recurringPromos: profile.recurringPromos,
      };
    }
  }

  const newDay = await generateSingleDay(
    cal.niche,
    cal.businessName,
    cal.month,
    cal.year,
    day,
    profileContext
  );

  const updatedContent = (cal.content as CalendarDay[]).map((d) =>
    d.day === day ? newDay : d
  );

  await db.update(calendar).set({ content: updatedContent }).where(eq(calendar.id, calendarId));

  return NextResponse.json({ day: newDay });
}
