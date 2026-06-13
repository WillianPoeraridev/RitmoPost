import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businessProfile } from "@/lib/schema";
import { profileInputSchema } from "@/lib/profile-validation";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

async function ownedProfile(id: string, userId: string) {
  const [profile] = await db
    .select()
    .from(businessProfile)
    .where(and(eq(businessProfile.id, id), eq(businessProfile.userId, userId)))
    .limit(1);
  return profile;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await ownedProfile(id, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = profileInputSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { recurringPromos, instagramHandle, ...rest } = parsed.data;

  await db
    .update(businessProfile)
    .set({
      ...rest,
      recurringPromos: recurringPromos ?? null,
      instagramHandle: instagramHandle ?? null,
      updatedAt: new Date(),
    })
    .where(eq(businessProfile.id, id));

  return NextResponse.json({ id });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!(await ownedProfile(id, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // calendar.profile_id é ON DELETE SET NULL — calendários gerados continuam abrindo.
  await db.delete(businessProfile).where(eq(businessProfile.id, id));

  return NextResponse.json({ ok: true });
}
