import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calendar, user } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UpgradeButton } from "@/components/upgrade-button";
import { SignOutButton } from "@/components/sign-out-button";
import { WhatsAppSettings } from "@/components/whatsapp-settings";

const MONTH_NAMES = [
  "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

type CalendarRow = {
  id: string;
  businessName: string;
  niche: string;
  month: number;
  year: number;
  content: unknown[];
  createdAt: Date;
};

function groupByBusiness(calendars: CalendarRow[]) {
  const map = new Map<string, CalendarRow[]>();
  for (const cal of calendars) {
    const key = cal.businessName;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(cal);
  }
  return map;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; view?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const params = await searchParams;
  const agencyMode = params.view === "agencia";

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
  const grouped = groupByBusiness(calendars as CalendarRow[]);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-rose-400">RitmoPost</span>
        <div className="flex items-center gap-4">
          {isPro && (
            <span className="text-xs bg-rose-600/30 border border-rose-600/50 text-rose-300 px-2 py-1 rounded-full font-medium">
              Pro
            </span>
          )}
          <span className="text-sm text-neutral-500 hidden sm:block">
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
            <p className="text-neutral-400 text-sm mt-1">
              {isPro
                ? "Gerações ilimitadas no plano Pro"
                : `${generationsUsed}/1 geração usada no plano grátis`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/perfil"
              className="text-xs text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-600 px-3 py-2 rounded-lg transition-colors"
            >
              Perfis do negócio
            </Link>
            {calendars.length > 0 && (
              <Link
                href={agencyMode ? "/dashboard" : "/dashboard?view=agencia"}
                className="text-xs text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-600 px-3 py-2 rounded-lg transition-colors"
              >
                {agencyMode ? "Vista lista" : "Vista agência"}
              </Link>
            )}
            <Link
              href="/gerar"
              className="bg-rose-600 hover:bg-rose-500 transition-colors px-5 py-2.5 rounded-xl font-medium text-sm"
            >
              + Novo calendário
            </Link>
          </div>
        </div>

        {isPro && (
          <WhatsAppSettings
            initialNumber={dbUser?.whatsappNumber ?? ""}
            initialOptIn={dbUser?.whatsappOptIn ?? false}
          />
        )}

        {!isPro && generationsUsed >= 1 && (
          <div className="bg-rose-900/20 border border-rose-700/50 rounded-xl p-5 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-rose-300">Você usou sua geração grátis</p>
              <p className="text-sm text-neutral-400 mt-1">
                Assine o Pro para gerar calendários ilimitados por R$29,90/mês
              </p>
            </div>
            <UpgradeButton />
          </div>
        )}

        {calendars.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-5xl mb-4">📅</p>
            <p className="text-lg mb-2">Nenhum calendário ainda</p>
            <p className="text-sm mb-6">Gere seu primeiro e o mês de conteúdo estará pronto</p>
            <Link href="/gerar" className="text-rose-400 hover:underline text-sm">
              Gerar meu primeiro calendário →
            </Link>
          </div>
        ) : agencyMode ? (
          // Vista agência — agrupado por negócio
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([businessName, cals]) => (
              <div key={businessName} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{businessName}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{cals[0].niche} · {cals.length} calendário{cals.length > 1 ? "s" : ""}</p>
                  </div>
                  <Link
                    href={`/gerar`}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    + Novo mês
                  </Link>
                </div>
                <div className="divide-y divide-neutral-800">
                  {cals.map((cal) => (
                    <Link
                      key={cal.id}
                      href={`/calendario/${cal.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-neutral-800/50 transition-colors"
                    >
                      <p className="text-sm text-neutral-300">
                        {MONTH_NAMES[cal.month]}/{cal.year}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-neutral-500">{(cal.content as unknown[]).length} dias</span>
                        <span className="text-neutral-600 text-sm">Ver →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Vista lista padrão
          <div className="grid gap-4">
            {calendars.map((cal) => (
              <Link
                key={cal.id}
                href={`/calendario/${cal.id}`}
                className="bg-neutral-900 border border-neutral-800 hover:border-rose-700/50 transition-colors rounded-xl p-5 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">{cal.businessName}</p>
                  <p className="text-sm text-neutral-400 mt-0.5">
                    {cal.niche} · {MONTH_NAMES[cal.month]}/{cal.year} ·{" "}
                    {(cal.content as unknown[]).length} dias gerados
                  </p>
                </div>
                <span className="text-neutral-600 text-sm">Ver →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
