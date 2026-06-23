import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businessProfile } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { putObject, deleteByPublicUrl, isR2Configured, LOGO_MAX_BYTES, LOGO_TYPES } from "@/lib/r2";

async function ownedProfile(id: string, userId: string) {
  const [profile] = await db
    .select()
    .from(businessProfile)
    .where(and(eq(businessProfile.id, id), eq(businessProfile.userId, userId)))
    .limit(1);
  return profile;
}

// POST multipart/form-data { file } → sobe a logo pro R2 e salva a URL no perfil.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isR2Configured()) {
    return NextResponse.json({ error: "Storage de imagem não configurado" }, { status: 503 });
  }

  const { id } = await params;
  const profile = await ownedProfile(id, session.user.id);
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
  }
  const ext = LOGO_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Formato inválido. Use PNG, JPG ou WEBP." }, { status: 400 });
  }
  if (file.size > LOGO_MAX_BYTES) {
    return NextResponse.json({ error: "Imagem muito grande (máx 2 MB)." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const key = `logos/${id}-${Date.now()}.${ext}`;
  const logoUrl = await putObject(key, bytes, file.type);

  // Remove a logo anterior (best-effort) e grava a nova.
  if (profile.logoUrl) await deleteByPublicUrl(profile.logoUrl);
  await db
    .update(businessProfile)
    .set({ logoUrl, updatedAt: new Date() })
    .where(eq(businessProfile.id, id));

  return NextResponse.json({ logoUrl });
}

// DELETE → remove a logo do R2 e zera no perfil.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const profile = await ownedProfile(id, session.user.id);
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (profile.logoUrl) await deleteByPublicUrl(profile.logoUrl);
  await db
    .update(businessProfile)
    .set({ logoUrl: null, updatedAt: new Date() })
    .where(eq(businessProfile.id, id));

  return NextResponse.json({ ok: true });
}
