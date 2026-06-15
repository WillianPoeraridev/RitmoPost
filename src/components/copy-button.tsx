"use client";
import { useState } from "react";
import type { CalendarDay } from "@/lib/schema";

export function CopyButton({ days }: { days: CalendarDay[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = days
      .map(
        (d) =>
          `📅 Dia ${d.day} — ${d.type}\n📌 ${d.theme}\n💬 ${d.caption}\n${d.hashtags.join(" ")}${d.story ? `\n📲 Story: ${d.story}` : ""}`
      )
      .join("\n\n---\n\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="bg-neutral-800 hover:bg-neutral-700 transition-colors px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      {copied ? "Copiado!" : "Copiar tudo"}
    </button>
  );
}
