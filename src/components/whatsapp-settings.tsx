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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold flex items-center gap-2">
            💬 Post do dia no WhatsApp
            <span className="text-xs bg-violet-600/30 border border-violet-600/50 text-violet-300 px-2 py-0.5 rounded-full">
              Pro
            </span>
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Todo dia às 8h, o post do dia chega no seu zap com a legenda pronta pra copiar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="tel"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="(51) 99999-8888"
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors w-44"
          />
          <button
            onClick={() => save(!optIn)}
            disabled={status === "saving" || (!optIn && !number.trim())}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
              optIn
                ? "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                : "bg-violet-600 hover:bg-violet-500 text-white"
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
