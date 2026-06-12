"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const NICHO_SUGGESTIONS = [
  "Barbearia", "Salão de Beleza", "Estética", "Personal Trainer",
  "Lanchonete", "Pizzaria", "Açaí", "Fotografia", "Pet Shop", "Clínica",
];

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function getMonthOptions() {
  const now = new Date();
  const options = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    options.push({ month: d.getMonth() + 1, year: d.getFullYear() });
  }
  return options;
}

export default function GerarPage() {
  const router = useRouter();
  const monthOptions = getMonthOptions();
  const [niche, setNiche] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        niche,
        businessName,
        month: selectedMonth.month,
        year: selectedMonth.year,
      }),
    });

    if (res.status === 402) {
      const checkoutRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY }),
      });
      const { url } = await checkoutRes.json();
      window.location.href = url;
      return;
    }

    if (!res.ok) {
      setError("Erro ao gerar calendário. Tente novamente.");
      setLoading(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/calendario/${id}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-violet-400">RitmoPost</Link>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
          ← Meus calendários
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Gerar Calendário</h1>
            <p className="text-slate-400 text-sm">
              A IA vai criar 30 dias de conteúdo personalizado para o seu negócio
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
          >
            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Nicho / Segmento
              </label>
              <input
                type="text"
                required
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Ex: Barbearia, Salão de Beleza, Personal Trainer..."
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {NICHO_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNiche(s)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-1 rounded-full transition-colors text-slate-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Nome do negócio
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Ex: Barbearia do Zé, Studio Ana..."
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Mês do calendário
              </label>
              <div className="flex gap-2">
                {monthOptions.map((opt) => (
                  <button
                    key={`${opt.month}-${opt.year}`}
                    type="button"
                    onClick={() => setSelectedMonth(opt)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      selectedMonth.month === opt.month && selectedMonth.year === opt.year
                        ? "bg-violet-600 border-violet-500 text-white"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {MONTH_NAMES[opt.month - 1]}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !niche || !businessName}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-3 rounded-xl font-semibold text-lg relative"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  A IA está criando seu calendário...
                </span>
              ) : (
                "Gerar Calendário →"
              )}
            </button>

            {loading && (
              <p className="text-center text-slate-500 text-xs">
                Isso leva cerca de 10 segundos ✨
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
