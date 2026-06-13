import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businessProfile } from "@/lib/schema";
import { profileInputSchema } from "@/lib/profile-validation";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profiles = await db
    .select()
    .from(businessProfile)
    .where(eq(businessProfile.userId, session.user.id))
    .orderBy(desc(businessProfile.createdAt));

  return NextResponse.json({ profiles });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = profileInputSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const now = new Date();
  const id = crypto.randomUUID();
  const { recurringPromos, instagramHandle, ...rest } = parsed.data;

  await db.insert(businessProfile).values({
    id,
    userId: session.user.id,
    ...rest,
    recurringPromos: recurringPromos ?? null,
    instagramHandle: instagramHandle ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ id });
}
