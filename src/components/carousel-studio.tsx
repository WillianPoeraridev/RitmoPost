"use client";
import { useState } from "react";
import { CarouselDownload } from "@/components/carousel-download";

// Mesmas 6 cores do PDF — coerência entre os artefatos do mesmo negócio.
const COLORS = [
  { label: "Coral", value: "#f43f5e" },
  { label: "Rosa", value: "#db2777" },
  { label: "Azul", value: "#2563eb" },
  { label: "Verde", value: "#059669" },
  { label: "Laranja", value: "#ea580c" },
  { label: "Preto", value: "#1a1a2e" },
];

type Theme = "dark" | "light";

export function CarouselStudio({
  calendarId,
  day,
  slideCount,
  slug,
}: {
  calendarId: string;
  day: number;
  slideCount: number;
  slug: string;
}) {
  const [color, setColor] = useState("#f43f5e");
  const [theme, setTheme] = useState<Theme>("dark");

  const files = Array.from({ length: slideCount }, (_, i) => ({
    url: `/api/carousel?id=${calendarId}&day=${day}&slide=${i}&color=${encodeURIComponent(color)}&theme=${theme}`,
    filename: `ritmopost-${slug}-dia${day}-${String(i + 1).padStart(2, "0")}.png`,
  }));

  return (
    <div>
      {/* Barra de controle: cor da marca + tema + baixar todos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Cor</span>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === c.value ? "border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Tema</span>
            <div className="flex rounded-lg overflow-hidden border border-neutral-700">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    theme === t
                      ? "bg-rose-600 text-white"
                      : "bg-neutral-900 text-neutral-400 hover:text-white"
                  }`}
                >
                  {t === "dark" ? "Escuro" : "Claro"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <CarouselDownload files={files} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {files.map((f, i) => (
          <div key={i} className="flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={f.url}
              alt={`Slide ${i + 1}`}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900"
            />
            <a
              href={f.url}
              download={f.filename}
              className="text-center text-xs text-neutral-400 hover:text-rose-400 transition-colors"
            >
              Slide {i + 1} · baixar
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
