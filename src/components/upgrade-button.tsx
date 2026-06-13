"use client";
import { useState } from "react";

type Plan = "monthly" | "yearly";

export function UpgradeButton({ label = "Assinar Pro" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<Plan | null>(null);

  async function checkout(plan: Plan) {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        setLoading(null);
      }
    } catch {
      setLoading(null);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold">Assine o Pro</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-white transition-colors text-xl leading-none"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              Calendários ilimitados, PDF sem marca d&apos;água e o post do dia no seu WhatsApp.
            </p>

            <div className="space-y-3">
              {/* Anual em primeiro — ancoragem pela economia */}
              <button
                onClick={() => checkout("yearly")}
                disabled={loading !== null}
                className="w-full text-left bg-violet-600/15 border-2 border-violet-500 hover:bg-violet-600/25 disabled:opacity-50 transition-colors rounded-xl p-4 relative"
              >
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-violet-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Economize 2 meses
                </span>
                <p className="font-semibold">Anual</p>
                <p className="text-2xl font-bold mt-1">
                  R$239<span className="text-sm font-normal text-slate-400">/ano</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">equivale a ~R$19,90/mês</p>
                <p className="text-sm text-violet-300 mt-2 font-medium">
                  {loading === "yearly" ? "Aguarde..." : "Assinar anual →"}
                </p>
              </button>

              <button
                onClick={() => checkout("monthly")}
                disabled={loading !== null}
                className="w-full text-left bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-50 transition-colors rounded-xl p-4"
              >
                <p className="font-semibold">Mensal</p>
                <p className="text-2xl font-bold mt-1">
                  R$29,90<span className="text-sm font-normal text-slate-400">/mês</span>
                </p>
                <p className="text-sm text-slate-300 mt-2 font-medium">
                  {loading === "monthly" ? "Aguarde..." : "Assinar mensal →"}
                </p>
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-4">
              Cancela quando quiser · PIX ou cartão
            </p>
          </div>
        </div>
      )}
    </>
  );
}
