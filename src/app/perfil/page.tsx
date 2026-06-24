import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businessProfile } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PerfilPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const profiles = await db
    .select()
    .from(businessProfile)
    .where(eq(businessProfile.userId, session.user.id))
    .orderBy(desc(businessProfile.createdAt));

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-semibold tracking-tight">
          Cadência<span className="text-rose-500">.</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto w-full px-6 py-10 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Seus perfis de marca</h1>
            <p className="text-neutral-400 text-sm mt-1">
              Cada perfil captura sua voz, método e ofertas — o calendário sai com a sua cara.
            </p>
          </div>
          <Link
            href="/perfil/novo"
            className="bg-rose-600 hover:bg-rose-500 transition-colors px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap"
          >
            + Novo perfil de marca
          </Link>
        </div>

        {profiles.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-5xl mb-4">✦</p>
            <p className="text-lg mb-2 text-neutral-300">Nenhum perfil ainda</p>
            <p className="text-sm mb-6 max-w-sm mx-auto">
              Crie seu perfil de marca uma vez — voz, método, ofertas. O calendário sai todo mês na sua cara.
            </p>
            <Link href="/perfil/novo" className="text-rose-400 hover:underline text-sm">
              Criar meu perfil de marca →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {profiles.map((p) => {
              return (
                <div
                  key={p.id}
                  className="bg-neutral-900 border border-neutral-800 hover:border-rose-700/50 transition-colors rounded-xl p-5 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{p.businessName}</p>
                    <p className="text-sm text-neutral-400 mt-0.5 truncate">
                      {p.niche}
                      {p.services.length > 0
                        ? ` · ${p.services.length} oferta${p.services.length > 1 ? "s" : ""}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <Link
                      href={`/gerar?perfil=${p.id}`}
                      className="text-sm bg-rose-600 hover:bg-rose-500 transition-colors px-4 py-2 rounded-lg font-medium"
                    >
                      Gerar conteúdo
                    </Link>
                    <Link
                      href={`/perfil/${p.id}`}
                      className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
