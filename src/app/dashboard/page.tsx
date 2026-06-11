import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calendar, user } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UpgradeButton } from "@/components/upgrade-button";
import { SignOutButton } from "@/components/sign-out-button";

const MONTH_NAMES = [
  "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const params = await searchParams;

  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  const calendars = await db
    .select()
    .from(calendar)
    .where(eq(calendar.userId, session.user.id))
    .orderBy(desc(calendar.createdAt));

  const isPro = dbUser?.plan === "pro";
  const generationsUsed = dbUser?.generationsUsed ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-violet-400">PostaJá</span>
        <div className="flex items-center gap-4">
          {isPro && (
            <span className="text-xs bg-violet-600/30 border border-violet-600/50 text-violet-300 px-2 py-1 rounded-full font-medium">
              Pro
            </span>
          )}
          <span className="text-sm text-slate-500 hidden sm:block">
            {session.user.email}
          </span>
          <SignOutButton />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto w-full px-6 py-10 flex-1">
        {params.success && (
          <div className="bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 px-4 py-3 rounded-lg mb-6 text-sm">
            Pagamento confirmado! Bem-vindo ao Pro. Agora você pode gerar calendários ilimitados.
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Meus Calendários</h1>
            <p className="text-slate-400 text-sm mt-1">
              {isPro
                ? "Gerações ilimitadas no plano Pro"
                : `${generationsUsed}/1 geração usada no plano grátis`}
            </p>
          </div>
          <Link
            href="/gerar"
            className="bg-violet-600 hover:bg-violet-500 transition-colors px-5 py-2.5 rounded-xl font-medium text-sm"
          >
            + Novo calendário
          </Link>
        </div>

        {!isPro && generationsUsed >= 1 && (
          <div className="bg-violet-900/20 border border-violet-700/50 rounded-xl p-5 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-violet-300">
                Você usou sua geração grátis
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Assine o Pro para gerar calendários ilimitados por R$29,90/mês
              </p>
            </div>
            <UpgradeButton />
          </div>
        )}

        {calendars.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-5xl mb-4">📅</p>
            <p className="text-lg mb-2">Nenhum calendário ainda</p>
            <p className="text-sm mb-6">Gere seu primeiro e o mês de conteúdo estará pronto</p>
            <Link
              href="/gerar"
              className="text-violet-400 hover:underline text-sm"
            >
              Gerar meu primeiro calendário →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {calendars.map((cal) => (
              <Link
                key={cal.id}
                href={`/calendario/${cal.id}`}
                className="bg-slate-900 border border-slate-800 hover:border-violet-700/50 transition-colors rounded-xl p-5 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">{cal.businessName}</p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {cal.niche} · {MONTH_NAMES[cal.month]}/{cal.year} ·{" "}
                    {(cal.content as unknown[]).length} dias gerados
                  </p>
                </div>
                <span className="text-slate-600 text-sm">Ver →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
