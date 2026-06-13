import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businessProfile } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GerarForm } from "./gerar-form";

export default async function GerarPage({
  searchParams,
}: {
  searchParams: Promise<{ perfil?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const params = await searchParams;

  const profiles = await db
    .select({
      id: businessProfile.id,
      businessName: businessProfile.businessName,
      niche: businessProfile.niche,
      city: businessProfile.city,
      neighborhood: businessProfile.neighborhood,
      servicesCount: businessProfile.services,
    })
    .from(businessProfile)
    .where(eq(businessProfile.userId, session.user.id))
    .orderBy(desc(businessProfile.createdAt));

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-violet-400">RitmoPost</Link>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
          ← Meus calendários
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Gerar Calendário</h1>
            <p className="text-slate-400 text-sm">
              A IA vai criar 30 dias de conteúdo personalizado para o seu negócio
            </p>
          </div>

          <GerarForm
            profiles={profiles.map((p) => ({
              id: p.id,
              businessName: p.businessName,
              niche: p.niche,
              city: p.city,
              neighborhood: p.neighborhood,
              servicesCount: p.servicesCount.length,
            }))}
            initialProfileId={params.perfil}
          />
        </div>
      </div>
    </div>
  );
}
