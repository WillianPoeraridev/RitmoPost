"use client";
import { useState } from "react";

const COLORS = [
  { label: "Violeta", value: "#7c3aed" },
  { label: "Rosa", value: "#db2777" },
  { label: "Azul", value: "#2563eb" },
  { label: "Verde", value: "#059669" },
  { label: "Laranja", value: "#ea580c" },
  { label: "Preto", value: "#1a1a2e" },
];

export function PdfButton({ calendarId }: { calendarId: string }) {
  const [color, setColor] = useState("#7c3aed");
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex rounded-lg overflow-hidden border border-violet-600">
        <a
          href={`/calendario/${calendarId}/pdf?color=${encodeURIComponent(color)}`}
          target="_blank"
          className="bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar PDF
        </a>
        <button
          onClick={() => setOpen((v) => !v)}
          className="bg-violet-700 hover:bg-violet-600 transition-colors px-2 border-l border-violet-500"
          title="Escolher cor"
        >
          <div className="w-4 h-4 rounded-full border-2 border-white/50" style={{ backgroundColor: color }} />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl z-10 min-w-[160px]">
          <p className="text-xs text-slate-500 mb-2">Cor do PDF</p>
          <div className="grid grid-cols-3 gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => { setColor(c.value); setOpen(false); }}
                title={c.label}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c.value ? "border-white" : "border-transparent"}`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
