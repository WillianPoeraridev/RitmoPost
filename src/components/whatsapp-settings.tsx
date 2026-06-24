"use client";
import { useState } from "react";

export function WhatsAppSettings({
  initialNumber,
  initialOptIn,
}: {
  initialNumber: string;
  initialOptIn: boolean;
}) {
  const [number, setNumber] = useState(initialNumber);
  const [optIn, setOptIn] = useState(initialOptIn);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save(nextOptIn: boolean) {
    setStatus("saving");
    try {
      const res = await fetch("/api/whatsapp-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber: number, whatsappOptIn: nextOptIn }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setOptIn(nextOptIn);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold flex items-center gap-2">
            Post do dia no WhatsApp
            <span className="text-xs bg-rose-600/30 border border-rose-600/50 text-rose-300 px-2 py-0.5 rounded-full">
              Pro
            </span>
          </p>
          <p className="text-sm text-neutral-400 mt-1">
            O post chega. Você posta.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="tel"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="(51) 99999-8888"
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors w-44"
          />
          <button
            onClick={() => save(!optIn)}
            disabled={status === "saving" || (!optIn && !number.trim())}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
              optIn
                ? "bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700"
                : "bg-rose-600 hover:bg-rose-500 text-white"
            }`}
          >
            {status === "saving" ? "Salvando..." : optIn ? "Desativar" : "Ativar"}
          </button>
        </div>
      </div>
      {status === "saved" && (
        <p className="text-xs text-emerald-400 mt-2">
          {optIn ? "Ativado! Amanhã às 8h o post chega no seu zap." : "Entrega desativada."}
        </p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-400 mt-2">
          Número inválido — use DDD + número, ex: (51) 99999-8888.
        </p>
      )}
    </div>
  );
}
