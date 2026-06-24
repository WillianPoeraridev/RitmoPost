import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calendar, user, businessProfile } from "@/lib/schema";
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

type ProfileRow = {
  id: string;
  businessName: string;
  niche: string;
  instagramHandle: string | null;
  logoUrl: string | null;
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

  const [calendars, profiles] = await Promise.all([
    db
      .select()
      .from(calendar)
      .where(eq(calendar.userId, session.user.id))
      .orderBy(desc(calendar.createdAt)),
    db
      .select({
        id: businessProfile.id,
        businessName: businessProfile.businessName,
        niche: businessProfile.niche,
        instagramHandle: businessProfile.instagramHandle,
        logoUrl: businessProfile.logoUrl,
      })
      .from(businessProfile)
      .where(eq(businessProfile.userId, session.user.id))
      .orderBy(desc(businessProfile.createdAt)),
  ]);

  const isPro = dbUser?.plan === "pro";
  const generationsUsed = dbUser?.generationsUsed ?? 0;
  const grouped = groupByBusiness(calendars as CalendarRow[]);
  const mainProfile = (profiles as ProfileRow[])[0] ?? null;
  const multiProfile = profiles.length > 1;
  const generateHref = mainProfile
    ? `/gerar?perfil=${mainProfile.id}`
    : "/gerar";

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-semibold tracking-tight">Cadência<span className="text-rose-500">.</span></span>
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

        {/* ── Perfil de marca ── sempre no topo */}
        {profiles.length === 0 ? (
          <div className="mb-8 rounded-2xl border border-rose-700/40 bg-gradient-to-r from-rose-900/20 to-neutral-900 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white text-lg">Crie seu perfil de marca</p>
              <p className="text-sm text-neutral-400 mt-1">
                Sua voz, sua metodologia, suas ofertas — o conteúdo sai na sua cara todo mês.
              </p>
            </div>
            <Link
              href="/perfil/novo"
              className="shrink-0 bg-rose-600 hover:bg-rose-500 transition-colors px-6 py-3 rounded-xl font-semibold text-sm"
            >
              Criar perfil →
            </Link>
          </div>
        ) : (
          <div className="mb-8 bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {mainProfile?.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainProfile.logoUrl}
                  alt=""
                  className="w-12 h-12 object-contain rounded-lg bg-neutral-800 shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="font-semibold truncate">{mainProfile?.businessName}</p>
                <p className="text-sm text-neutral-400 truncate">
                  {mainProfile?.niche}
                  {mainProfile?.instagramHandle ? ` · ${mainProfile.instagramHandle}` : ""}
                  {multiProfile ? ` · ${profiles.length} perfis` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {multiProfile ? (
                <Link href="/perfil" className="text-sm text-neutral-400 hover:text-white transition-colors">
                  Gerenciar →
                </Link>
              ) : (
                <Link href={`/perfil/${mainProfile?.id}`} className="text-sm text-neutral-400 hover:text-white transition-colors">
                  Editar perfil
                </Link>
              )}
              <Link
                href={generateHref}
                className="text-sm bg-rose-600 hover:bg-rose-500 transition-colors px-4 py-2 rounded-lg font-medium"
              >
                + Gerar conteúdo
              </Link>
            </div>
          </div>
        )}

        {isPro && (
          <WhatsAppSettings
            initialNumber={dbUser?.whatsappNumber ?? ""}
            initialOptIn={dbUser?.whatsappOptIn ?? false}
          />
        )}

        {!isPro && generationsUsed >= 1 && (
          <div className="bg-rose-900/20 border border-rose-700/50 rounded-xl p-5 mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-rose-300">Seu mês expirou</p>
              <p className="text-sm text-neutral-400 mt-1">
                Deixa no automático — Cadência Pro por R$297/mês.
              </p>
            </div>
            <UpgradeButton />
          </div>
        )}

        {/* ── Calendários ── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Meus Calendários</h2>
          <div className="flex items-center gap-2">
            {calendars.length > 0 && (
              <Link
                href={agencyMode ? "/dashboard" : "/dashboard?view=agencia"}
                className="text-xs text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-600 px-3 py-2 rounded-lg transition-colors"
              >
                {agencyMode ? "Vista lista" : "Vista agência"}
              </Link>
            )}
          </div>
        </div>

        {calendars.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 border border-neutral-800 rounded-xl">
            <p className="text-4xl mb-4">📅</p>
            <p className="text-base mb-1 text-neutral-400">Nenhum calendário ainda</p>
            <p className="text-sm mb-6">Gere seu primeiro e o mês de conteúdo estará pronto</p>
            {profiles.length > 0 && (
              <Link href={generateHref} className="text-rose-400 hover:underline text-sm">
                Gerar meu primeiro calendário →
              </Link>
            )}
          </div>
        ) : agencyMode ? (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([businessName, cals]) => (
              <div key={businessName} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{businessName}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{cals[0].niche} · {cals.length} calendário{cals.length > 1 ? "s" : ""}</p>
                  </div>
                  <Link href="/gerar" className="text-xs text-rose-400 hover:underline">
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
          <div className="grid gap-4">
            {(calendars as CalendarRow[]).map((cal) => (
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
