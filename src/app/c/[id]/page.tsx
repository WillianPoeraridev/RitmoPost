import { db } from "@/lib/db";
import { calendar } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { CalendarDay } from "@/lib/schema";

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

  const days = cal.content as CalendarDay[];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-violet-400">PostaJá</Link>
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
            {cal.niche} · {MONTH_NAMES[cal.month]} {cal.year} · {days.length} dias
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <span key={type} className={`text-xs font-medium px-2 py-1 rounded-full text-white ${color}`}>
              {type}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {days.map((day) => (
            <div
              key={day.day}
              className="bg-slate-900 border border-slate-800 hover:border-violet-700/30 transition-colors rounded-xl p-3 group"
            >
              <p className="text-xs text-slate-600 mb-2 font-medium">Dia {day.day}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${TYPE_COLORS[day.type] ?? "bg-slate-600"}`}>
                {day.type}
              </span>
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
              </div>
            </div>
          ))}
        </div>

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
