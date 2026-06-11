import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, calendar } from "@/lib/schema";
import { generateCalendar } from "@/lib/claude";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

const bodySchema = z.object({
  niche: z.string().min(1).max(100),
  businessName: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { niche, businessName } = parsed.data;

  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (dbUser.plan === "free" && dbUser.generationsUsed >= 1) {
    return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const days = await generateCalendar(niche, businessName, month, year);

  const id = crypto.randomUUID();
  await db.insert(calendar).values({
    id,
    userId: session.user.id,
    niche,
    businessName,
    month,
    year,
    content: days,
    createdAt: now,
  });

  if (dbUser.plan === "free") {
    await db
      .update(user)
      .set({ generationsUsed: dbUser.generationsUsed + 1 })
      .where(eq(user.id, session.user.id));
  }

  return NextResponse.json({ id });
}
