import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, calendar, businessProfile } from "@/lib/schema";
import { generateCalendar, type ProfileContext } from "@/lib/claude";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

// Calendar generation can take ~30s; raise the function timeout above the default.
export const maxDuration = 60;

// Ou gera a partir de um perfil salvo (profileId) ou no modo manual
// (niche + businessName) — o manual mantém compatível quem não criou perfil.
const bodySchema = z.object({
  profileId: z.string().uuid().optional(),
  niche: z.string().min(1).max(100).optional(),
  businessName: z.string().min(1).max(100).optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2024).max(2030).optional(),
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

  let { niche, businessName } = parsed.data;
  let profileId: string | null = null;
  let profileContext: ProfileContext | undefined;

  if (parsed.data.profileId) {
    const [profile] = await db
      .select()
      .from(businessProfile)
      .where(
        and(
          eq(businessProfile.id, parsed.data.profileId),
          eq(businessProfile.userId, session.user.id)
        )
      )
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    profileId = profile.id;
    niche = profile.niche;
    businessName = profile.businessName;
    profileContext = {
      services: profile.services,
      tone: profile.tone,
      differentials: profile.differentials,
      city: profile.city,
      neighborhood: profile.neighborhood,
      recurringPromos: profile.recurringPromos,
    };
  }

  if (!niche || !businessName) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const now = new Date();
  const month = parsed.data.month ?? now.getMonth() + 1;
  const year = parsed.data.year ?? now.getFullYear();

  try {
    const days = await generateCalendar(niche, businessName, month, year, profileContext);

    const id = crypto.randomUUID();
    await db.insert(calendar).values({
      id,
      userId: session.user.id,
      profileId,
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
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[generate] failed:", detail);
    return NextResponse.json(
      { error: "generation_failed", detail },
      { status: 500 }
    );
  }
}
