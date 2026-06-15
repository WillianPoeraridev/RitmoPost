import { db } from "@/lib/db";
import { calendar, user } from "@/lib/schema";
import { isProUser, FREE_VISIBLE_DAYS } from "@/lib/plan";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { CalendarDay } from "@/lib/schema";
import { PILLAR_LABELS } from "@/lib/schema";

const MONTH_NAMES = [
  "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const TYPE_COLORS: Record<string, string> = {
  Reels: "bg-violet-600",
  Carrossel: "bg-sky-600",
  Story: "bg-amber-500",
  Feed: "bg-emerald-600",
};

const PILLAR_COLORS: Record<string, string> = {
  atracao: "bg-rose-600",
  conexao: "bg-cyan-600",
  conversao: "bg-green-600",
};

export default async function PublicCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [cal] = await db
    .select()
    .from(calendar)
    .where(eq(calendar.id, id))
    .limit(1);

  if (!cal) notFound();

  // The public link mirrors the owner's plan: free owners share a 7-day teaser,
  // Pro owners can share the full calendar as marketing.
  const [owner] = await db
    .select()
    .from(user)
    .where(eq(user.id, cal.userId))
    .limit(1);

  const isPro = isProUser(owner);
  const allDays = cal.content as CalendarDay[];
  const days = isPro ? allDays : allDays.slice(0, FREE_VISIBLE_DAYS);
  const lockedCount = allDays.length - days.length;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-violet-400">RitmoPost</Link>
        <Link
          href="/"
          className="text-sm bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg font-medium"
        >
          Criar o meu grátis →
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{cal.businessName}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {cal.niche} · {MONTH_NAMES[cal.month]} {cal.year} · {allDays.length} dias
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <span key={type} className={`text-xs font-medium px-2 py-1 rounded-full text-white ${color}`}>
              {type}
            </span>
          ))}
        </div>

        {/* O método por trás do calendário — o que diferencia de "30 ideias soltas" */}
        {days.some((d) => d.pillar) && (
          <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 mb-3">
              Cada post tem uma <span className="text-slate-200 font-medium">função estratégica</span> — um plano que constrói a marca e traz cliente sem correr atrás:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {([
                { color: "bg-rose-600", label: "Atração", desc: "para o scroll de quem não te conhece" },
                { color: "bg-cyan-600", label: "Conexão", desc: "bastidor que faz quem segue confiar" },
                { color: "bg-green-600", label: "Conversão", desc: "convite leve pra agir, sem desespero" },
              ] as const).map((p) => (
                <div key={p.label} className="flex items-start gap-2 flex-1">
                  <span className={`mt-0.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white ${p.color} shrink-0`}>
                    {p.label}
                  </span>
                  <span className="text-xs text-slate-500 leading-snug">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {days.map((day) => (
            <div
              key={day.day}
              className="bg-slate-900 border border-slate-800 hover:border-violet-700/30 transition-colors rounded-xl p-3 group"
            >
              <p className="text-xs text-slate-600 mb-2 font-medium">Dia {day.day}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${TYPE_COLORS[day.type] ?? "bg-slate-600"}`}>
                  {day.type}
                </span>
                {day.pillar && (
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white ${PILLAR_COLORS[day.pillar]}`}>
                    {PILLAR_LABELS[day.pillar]}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-200 mt-2 leading-tight">
                {day.theme}
              </p>
              <p className="text-xs text-slate-500 mt-1 italic leading-snug">
                {day.hook}
              </p>
              <div className="mt-2 hidden group-hover:block">
                <p className="text-xs text-slate-400 leading-snug border-t border-slate-800 pt-2">
                  {day.caption}
                </p>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  {day.hashtags.slice(0, 4).join(" ")}
                </p>
                {day.story && (
                  <p className="text-xs text-amber-300/90 mt-2 leading-snug">
                    <span className="font-semibold">📲 Story:</span> {day.story}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {lockedCount > 0 && (
          <p className="mt-6 text-center text-slate-400 text-sm">
            🔒 + {lockedCount} dias no calendário completo
          </p>
        )}

        <div className="mt-12 text-center bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <p className="text-lg font-semibold mb-2">Quer um calendário assim para o seu negócio?</p>
          <p className="text-slate-400 text-sm mb-6">Gerado por IA em 10 segundos. 1 calendário grátis, sem cartão.</p>
          <Link
            href="/"
            className="bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-3 rounded-xl font-semibold inline-block"
          >
            Criar o meu grátis →
          </Link>
        </div>
      </div>
    </div>
  );
}
