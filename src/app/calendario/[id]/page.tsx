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
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-violet-400">
          RitmoPost
        </Link>
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Meus calendários
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto w-full px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">{cal.businessName}</h1>
            <p className="text-slate-400 text-sm mt-1">
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
          <div className="mb-6 rounded-2xl border border-violet-700/50 bg-gradient-to-r from-violet-900/40 to-fuchsia-900/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-violet-600/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">
                  Você está vendo {visibleDays.length} de {allDays.length} dias
                </p>
                <p className="text-sm text-slate-300">
                  Desbloqueie o mês completo + PDF sem marca d&apos;água por R$29,90/mês.
                </p>
              </div>
            </div>
            <UpgradeButton />
          </div>
        )}

        {/* Legenda */}
        <div className="flex flex-wrap gap-3 mb-6">
          {(["Reels", "Carrossel", "Story", "Feed"] as const).map((type) => {
            const colors: Record<string, string> = { Reels: "bg-violet-600", Carrossel: "bg-sky-600", Story: "bg-amber-500", Feed: "bg-emerald-600" };
            return (
              <span key={type} className={`text-xs font-medium px-2 py-1 rounded-full text-white ${colors[type]}`}>
                {type}
              </span>
            );
          })}
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
              className="relative bg-slate-900/60 border border-slate-800 rounded-xl p-3 overflow-hidden select-none"
            >
              <div className="blur-[3px] opacity-60 pointer-events-none">
                <p className="text-xs text-slate-600 font-medium mb-2">Dia {day.day}</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white bg-slate-600">
                  {day.type}
                </span>
                <div className="h-3 bg-slate-700 rounded mt-2 w-full" />
                <div className="h-3 bg-slate-700/70 rounded mt-1.5 w-3/4" />
                <div className="h-2 bg-slate-800 rounded mt-2 w-5/6" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom upgrade CTA for free users */}
        {!isPro && lockedDays.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm mb-3">
              + {lockedDays.length} dias de conteúdo esperando por você
            </p>
            <UpgradeButton />
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/gerar"
            className="text-violet-400 hover:underline text-sm"
          >
            Gerar calendário para outro mês ou negócio →
          </Link>
        </div>
      </div>
    </div>
  );
}

