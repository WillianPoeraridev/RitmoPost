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
  const [loading, setLoading] = useState(false);

  async function handleRegenerate() {
    setLoading(true);
    const res = await fetch("/api/regenerate-day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendarId, day: current.day }),
    });
    if (res.ok) {
      const { day: newDay } = await res.json();
      setCurrent(newDay);
    }
    setLoading(false);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-violet-700/30 transition-colors rounded-xl p-3 group relative">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-600 font-medium">Dia {current.day}</p>
        <button
          onClick={handleRegenerate}
          disabled={loading}
          title="Regenerar este dia"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-violet-400 disabled:opacity-30"
        >
          <svg
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${TYPE_COLORS[current.type] ?? "bg-slate-600"}`}>
        {current.type}
      </span>
      <p className="text-sm font-medium text-slate-200 mt-2 leading-tight">
        {current.theme}
      </p>
      <p className="text-xs text-slate-500 mt-1 italic leading-snug">
        {current.hook}
      </p>
      <div className="mt-2 hidden group-hover:block">
        <p className="text-xs text-slate-400 leading-snug border-t border-slate-800 pt-2">
          {current.caption}
        </p>
        <p className="text-xs text-slate-600 mt-1 leading-snug">
          {current.hashtags.slice(0, 4).join(" ")}
        </p>
      </div>
    </div>
  );
}
