import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calendar } from "@/lib/schema";
import { generateSingleDay } from "@/lib/claude";
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

  const newDay = await generateSingleDay(cal.niche, cal.businessName, cal.month, cal.year, day);

  const updatedContent = (cal.content as CalendarDay[]).map((d) =>
    d.day === day ? newDay : d
  );

  await db.update(calendar).set({ content: updatedContent }).where(eq(calendar.id, calendarId));

  return NextResponse.json({ day: newDay });
}
