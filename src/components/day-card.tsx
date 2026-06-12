"use client";
import { useState } from "react";
import type { CalendarDay } from "@/lib/schema";

const TYPE_COLORS: Record<string, string> = {
  Reels: "bg-violet-600",
  Carrossel: "bg-sky-600",
  Story: "bg-amber-500",
  Feed: "bg-emerald-600",
};

export function DayCard({
  day,
  calendarId,
}: {
  day: CalendarDay;
  calendarId: string;
}) {
  const [current, setCurrent] = useState(day);
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
    <div className="bg-slate-900 border border-slate-800 hover:border-violet-700/30 transition-colors rounded-xl p-3 group">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-600 font-medium">Dia {current.day}</p>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          title="Regenerar este dia"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-violet-400 disabled:opacity-30"
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

      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${TYPE_COLORS[current.type] ?? "bg-slate-600"}`}>
        {current.type}
      </span>
      <p className="text-sm font-medium text-slate-200 mt-2 leading-tight">{current.theme}</p>
      <p className="text-xs text-slate-500 mt-1 italic leading-snug">{current.hook}</p>

      <div className="mt-2 hidden group-hover:block">
        <p className="text-xs text-slate-400 leading-snug border-t border-slate-800 pt-2">
          {current.caption}
        </p>
        <p className="text-xs text-slate-600 mt-1 leading-snug">
          {current.hashtags.slice(0, 4).join(" ")}
        </p>

        {current.type === "Reels" && (
          <button
            onClick={handleScript}
            disabled={loadingScript}
            className="mt-2 w-full text-xs bg-violet-900/40 hover:bg-violet-900/60 border border-violet-700/50 text-violet-300 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
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
        <div className="mt-2 bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
          <p className="text-xs text-violet-400 font-semibold mb-1">Roteiro 30s</p>
          <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{script}</p>
        </div>
      )}
    </div>
  );
}
