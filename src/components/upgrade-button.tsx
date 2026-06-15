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
        className="bg-rose-600 hover:bg-rose-500 transition-colors px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold">Assine o Pro</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-neutral-500 hover:text-white transition-colors text-xl leading-none"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-neutral-400 mb-5">
              Calendários ilimitados, PDF sem marca d&apos;água e o post do dia no seu WhatsApp.
            </p>

            <div className="space-y-3">
              {/* Anual em primeiro — ancoragem pela economia */}
              <button
                onClick={() => checkout("yearly")}
                disabled={loading !== null}
                className="w-full text-left bg-rose-600/15 border-2 border-rose-500 hover:bg-rose-600/25 disabled:opacity-50 transition-colors rounded-xl p-4 relative"
              >
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                  3 meses grátis
                </span>
                <p className="font-semibold">Anual</p>
                <p className="text-2xl font-bold mt-1">
                  R$269<span className="text-sm font-normal text-neutral-400">/ano</span>
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">equivale a ~R$22,40/mês</p>
                <p className="text-sm text-rose-300 mt-2 font-medium">
                  {loading === "yearly" ? "Aguarde..." : "Assinar anual →"}
                </p>
              </button>

              <button
                onClick={() => checkout("monthly")}
                disabled={loading !== null}
                className="w-full text-left bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 disabled:opacity-50 transition-colors rounded-xl p-4"
              >
                <p className="font-semibold">Mensal</p>
                <p className="text-2xl font-bold mt-1">
                  R$29,90<span className="text-sm font-normal text-neutral-400">/mês</span>
                </p>
                <p className="text-sm text-neutral-300 mt-2 font-medium">
                  {loading === "monthly" ? "Aguarde..." : "Assinar mensal →"}
                </p>
              </button>
            </div>

            <p className="text-xs text-neutral-500 text-center mt-4">
              Cancela quando quiser · PIX ou cartão
            </p>
          </div>
        </div>
      )}
    </>
  );
}
