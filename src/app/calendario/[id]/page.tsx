import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calendar, user } from "@/lib/schema";
import { isProUser, FREE_VISIBLE_DAYS } from "@/lib/plan";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { CalendarDay } from "@/lib/schema";
import { CopyButton } from "@/components/copy-button";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ShareButton } from "@/components/share-button";
import { DayCard } from "@/components/day-card";
import { PdfButton } from "@/components/pdf-button";
import { UpgradeButton } from "@/components/upgrade-button";

const MONTH_NAMES = [
  "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];


export default async function CalendarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;

  const [cal] = await db
    .select()
    .from(calendar)
    .where(and(eq(calendar.id, id), eq(calendar.userId, session.user.id)))
    .limit(1);

  if (!cal) notFound();

  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  const isPro = isProUser(dbUser);
  const allDays = cal.content as CalendarDay[];
  const visibleDays = isPro ? allDays : allDays.slice(0, FREE_VISIBLE_DAYS);
  const lockedDays = isPro ? [] : allDays.slice(FREE_VISIBLE_DAYS);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-rose-400">
          RitmoPost
        </Link>
        <Link
          href="/dashboard"
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          ← Meus calendários
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto w-full px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">{cal.businessName}</h1>
            <p className="text-neutral-400 text-sm mt-1">
              {cal.niche} · {MONTH_NAMES[cal.month]} {cal.year} · {allDays.length} dias
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ShareButton id={id} />
            <WhatsAppButton days={visibleDays} businessName={cal.businessName} />
            <CopyButton days={visibleDays} />
            <PdfButton calendarId={id} isPro={isPro} />
          </div>
        </div>

        {/* Paywall banner — free users see 7 of N days */}
        {!isPro && (
          <div className="mb-6 rounded-2xl border border-rose-700/50 bg-gradient-to-r from-rose-900/40 to-fuchsia-900/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-rose-600/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">
                  Você está vendo {visibleDays.length} de {allDays.length} dias
                </p>
                <p className="text-sm text-neutral-300">
                  Desbloqueie o mês completo + PDF sem marca d&apos;água por R$29,90/mês.
                </p>
              </div>
            </div>
            <UpgradeButton />
          </div>
        )}

        {/* Legenda de formatos */}
        <div className="flex flex-wrap gap-3 mb-4">
          {(["Reels", "Carrossel", "Story", "Feed"] as const).map((type) => {
            const colors: Record<string, string> = { Reels: "bg-violet-600", Carrossel: "bg-sky-600", Story: "bg-amber-500", Feed: "bg-emerald-600" };
            return (
              <span key={type} className={`text-xs font-medium px-2 py-1 rounded-full text-white ${colors[type]}`}>
                {type}
              </span>
            );
          })}
        </div>

        {/* Legenda de estratégia — o método por trás do calendário */}
        <div className="mb-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <p className="text-xs text-neutral-400 mb-3">
            Cada post tem uma <span className="text-neutral-200 font-medium">função estratégica</span> — não é ideia solta, é um plano que constrói sua marca e traz cliente sem você correr atrás:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {([
              { key: "atracao", label: "Atração", color: "bg-rose-600", desc: "para o scroll de quem não te conhece e traz seguidor novo" },
              { key: "conexao", label: "Conexão", color: "bg-cyan-600", desc: "bastidor e histórias que fazem quem te segue confiar" },
              { key: "conversao", label: "Conversão", color: "bg-green-600", desc: "convite leve pra agir, sem desespero" },
            ] as const).map((p) => (
              <div key={p.key} className="flex items-start gap-2 flex-1">
                <span className={`mt-0.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white ${p.color} shrink-0`}>
                  {p.label}
                </span>
                <span className="text-xs text-neutral-500 leading-snug">{p.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {visibleDays.map((day) => (
            <DayCard key={day.day} day={day} calendarId={id} />
          ))}
          {/* Locked teasers — show the day exists, hide the real content */}
          {lockedDays.map((day) => (
            <div
              key={day.day}
              className="relative bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 overflow-hidden select-none"
            >
              <div className="blur-[3px] opacity-60 pointer-events-none">
                <p className="text-xs text-neutral-600 font-medium mb-2">Dia {day.day}</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white bg-neutral-600">
                  {day.type}
                </span>
                <div className="h-3 bg-neutral-700 rounded mt-2 w-full" />
                <div className="h-3 bg-neutral-700/70 rounded mt-1.5 w-3/4" />
                <div className="h-2 bg-neutral-800 rounded mt-2 w-5/6" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom upgrade CTA for free users */}
        {!isPro && lockedDays.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-neutral-400 text-sm mb-3">
              + {lockedDays.length} dias de conteúdo esperando por você
            </p>
            <UpgradeButton />
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/gerar"
            className="text-rose-400 hover:underline text-sm"
          >
            Gerar calendário para outro mês ou negócio →
          </Link>
        </div>
      </div>
    </div>
  );
}

