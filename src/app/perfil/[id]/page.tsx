import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businessProfile } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ProfileForm } from "@/components/profile-form";

export default async function EditarPerfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;

  const [profile] = await db
    .select()
    .from(businessProfile)
    .where(and(eq(businessProfile.id, id), eq(businessProfile.userId, session.user.id)))
    .limit(1);

  if (!profile) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-rose-400">
          RitmoPost
        </Link>
        <Link
          href="/perfil"
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          ← Perfis
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto w-full px-6 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Editar perfil</h1>
          <p className="text-neutral-400 text-sm mt-1">{profile.businessName}</p>
        </div>
        <ProfileForm
          profileId={profile.id}
          initial={{
            businessName: profile.businessName,
            niche: profile.niche,
            services: profile.services,
            tone: profile.tone,
            differentials: profile.differentials,
            city: profile.city,
            neighborhood: profile.neighborhood,
            recurringPromos: profile.recurringPromos,
            instagramHandle: profile.instagramHandle,
          }}
          initialLogoUrl={profile.logoUrl}
        />
      </div>
    </div>
  );
}
