import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calendar } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { CalendarDay } from "@/lib/schema";
import { CopyButton } from "@/components/copy-button";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ShareButton } from "@/components/share-button";
import { DayCard } from "@/components/day-card";

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

  const days = cal.content as CalendarDay[];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-violet-400">
          PostaJá
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
              {cal.niche} · {MONTH_NAMES[cal.month]} {cal.year} · {days.length} dias
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ShareButton id={id} />
            <WhatsAppButton days={days as CalendarDay[]} businessName={cal.businessName} />
            <CopyButton days={days as CalendarDay[]} />
            <a
              href={`/calendario/${id}/pdf`}
              target="_blank"
              className="bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Baixar PDF
            </a>
          </div>
        </div>

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
          {days.map((day) => (
            <DayCard key={day.day} day={day} calendarId={id} />
          ))}
        </div>

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

