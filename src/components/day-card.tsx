"use client";
import { useState } from "react";
import Link from "next/link";
import type { CalendarDay, ContentPillar } from "@/lib/schema";
import { PILLAR_LABELS } from "@/lib/schema";
import { getPostingTime } from "@/lib/posting-times";

const TYPE_COLORS: Record<string, string> = {
  Reels: "bg-violet-600",
  Carrossel: "bg-sky-600",
  Story: "bg-amber-500",
  Feed: "bg-emerald-600",
};

// Cor por função estratégica (método MoneyBranding). Distinta dos tipos de post.
const PILLAR_COLORS: Record<ContentPillar, string> = {
  atracao: "bg-rose-600",
  conexao: "bg-cyan-600",
  conversao: "bg-green-600",
};

export function DayCard({
  day,
  calendarId,
  niche,
}: {
  day: CalendarDay;
  calendarId: string;
  niche: string;
}) {
  const [current, setCurrent] = useState(day);
  const postingTime = getPostingTime(niche, current.type);
  const [regenerating, setRegenerating] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [loadingScript, setLoadingScript] = useState(false);
  const [showScript, setShowScript] = useState(false);

  async function handleRegenerate() {
    setRegenerating(true);
    const res = await fetch("/api/regenerate-day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendarId, day: current.day }),
    });
    if (res.ok) {
      const { day: newDay } = await res.json();
      setCurrent(newDay);
      setScript(null);
      setShowScript(false);
    }
    setRegenerating(false);
  }

  async function handleScript() {
    if (script) {
      setShowScript((v) => !v);
      return;
    }
    setLoadingScript(true);
    const res = await fetch("/api/reels-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendarId, day: current.day }),
    });
    if (res.ok) {
      const { script: s } = await res.json();
      setScript(s);
      setShowScript(true);
    }
    setLoadingScript(false);
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 hover:border-rose-700/30 transition-colors rounded-xl p-3 group">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-neutral-600 font-medium">Dia {current.day}</p>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          title="Regenerar este dia"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-rose-400 disabled:opacity-30"
        >
          <svg
            className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${TYPE_COLORS[current.type] ?? "bg-neutral-600"}`}>
          {current.type}
        </span>
        {current.pillar && (
          <span
            title="Função estratégica do post"
            className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white ${PILLAR_COLORS[current.pillar]}`}
          >
            {PILLAR_LABELS[current.pillar]}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-neutral-200 mt-2 leading-tight">{current.theme}</p>
      <p className="text-xs text-neutral-500 mt-1 italic leading-snug">{current.hook}</p>

      <div className="mt-2 hidden group-hover:block">
        <p className="text-xs text-neutral-400 leading-snug border-t border-neutral-800 pt-2">
          {current.caption}
        </p>
        <p className="text-xs text-neutral-600 mt-1 leading-snug">
          {current.hashtags.slice(0, 4).join(" ")}
        </p>

        {current.story && (
          <p className="text-xs text-amber-300/90 mt-2 leading-snug border-t border-neutral-800 pt-2">
            <span className="font-semibold">📲 Story de hoje:</span> {current.story}
          </p>
        )}

        <p className="text-xs text-neutral-500 mt-2 leading-snug border-t border-neutral-800 pt-2">
          🕐 <span className="text-neutral-300 font-medium">{postingTime.time}</span> · {postingTime.reason}
        </p>

        <Link
          href={`/calendario/${calendarId}/carousel/${current.day}`}
          className="mt-2 w-full text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a2 2 0 012-2h8a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z M18 7h1a2 2 0 012 2v8a2 2 0 01-2 2h-1" />
          </svg>
          Gerar carrossel
        </Link>

        {current.type === "Reels" && (
          <button
            onClick={handleScript}
            disabled={loadingScript}
            className="mt-2 w-full text-xs bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/50 text-rose-300 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            {loadingScript ? (
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            )}
            {script ? (showScript ? "Ocultar roteiro" : "Ver roteiro") : "Gerar roteiro 30s"}
          </button>
        )}
      </div>

      {showScript && script && (
        <div className="mt-2 bg-neutral-800/60 rounded-lg p-3 border border-neutral-700/50">
          <p className="text-xs text-rose-400 font-semibold mb-1">Roteiro 30s</p>
          <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">{script}</p>
        </div>
      )}
    </div>
  );
}
