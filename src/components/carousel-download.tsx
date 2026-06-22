"use client";
import { useState } from "react";

// Baixa todos os slides em sequência (blob → anchor), sem navegar pra fora da
// página. Instagram sobe imagem por imagem, então entregamos PNGs separados.
export function CarouselDownload({
  files,
}: {
  files: { url: string; filename: string }[];
}) {
  const [busy, setBusy] = useState(false);

  async function downloadAll() {
    setBusy(true);
    try {
      for (const f of files) {
        const res = await fetch(f.url);
        if (!res.ok) continue;
        const blob = await res.blob();
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = f.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(href);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={downloadAll}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white transition-colors"
    >
      {busy ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
      {busy ? "Baixando…" : `Baixar todos (${files.length})`}
    </button>
  );
}
