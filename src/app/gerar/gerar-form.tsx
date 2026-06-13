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

type ProfileOption = {
  id: string;
  businessName: string;
  niche: string;
  city: string;
  neighborhood: string;
  servicesCount: number;
};

function getMonthOptions() {
  const now = new Date();
  const options = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    options.push({ month: d.getMonth() + 1, year: d.getFullYear() });
  }
  return options;
}

export function GerarForm({
  profiles,
  initialProfileId,
}: {
  profiles: ProfileOption[];
  initialProfileId?: string;
}) {
  const router = useRouter();
  const monthOptions = getMonthOptions();
  const hasProfiles = profiles.length > 0;

  const initialProfile =
    profiles.find((p) => p.id === initialProfileId) ?? profiles[0] ?? null;

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    initialProfile?.id ?? null
  );
  const [manualMode, setManualMode] = useState(!hasProfiles);
  const [niche, setNiche] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = manualMode
      ? { niche, businessName, month: selectedMonth.month, year: selectedMonth.year }
      : { profileId: selectedProfileId, month: selectedMonth.month, year: selectedMonth.year };

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

  const canSubmit = manualMode ? Boolean(niche && businessName) : Boolean(selectedProfileId);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
    >
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {hasProfiles && !manualMode ? (
        <div>
          <label className="block text-sm text-slate-400 mb-2">Perfil do negócio</label>
          <div className="space-y-2">
            {profiles.map((p) => {
              const location = [p.neighborhood, p.city].filter(Boolean).join(", ");
              const selected = selectedProfileId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProfileId(p.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    selected
                      ? "bg-violet-600/20 border-violet-500"
                      : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  <span className="font-medium block">{p.businessName}</span>
                  <span className="text-xs text-slate-400">
                    {p.niche}
                    {location ? ` · ${location}` : ""}
                    {p.servicesCount > 0
                      ? ` · ${p.servicesCount} serviço${p.servicesCount > 1 ? "s" : ""}`
                      : ""}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2">
            <Link href="/perfil/novo" className="text-xs text-violet-400 hover:underline">
              + Cadastrar outro negócio
            </Link>
            <button
              type="button"
              onClick={() => setManualMode(true)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Gerar sem perfil
            </button>
          </div>
        </div>
      ) : (
        <>
          {hasProfiles && (
            <button
              type="button"
              onClick={() => setManualMode(false)}
              className="text-xs text-violet-400 hover:underline"
            >
              ← Usar um perfil salvo
            </button>
          )}
          {!hasProfiles && (
            <div className="bg-violet-900/20 border border-violet-700/40 text-sm text-slate-300 px-4 py-3 rounded-lg">
              💡 <Link href="/perfil/novo" className="text-violet-400 hover:underline">Cadastre o perfil do seu negócio</Link>{" "}
              e os posts saem citando seus serviços, preços e bairro.
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nicho / Segmento</label>
            <input
              type="text"
              required={manualMode}
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
            <label className="block text-sm text-slate-400 mb-1">Nome do negócio</label>
            <input
              type="text"
              required={manualMode}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="Ex: Barbearia do Zé, Studio Ana..."
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm text-slate-400 mb-1">Mês do calendário</label>
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
        disabled={loading || !canSubmit}
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
          A IA escreve os 30 dias um a um — leva uns 30 a 40 segundos ✨
        </p>
      )}
    </form>
  );
}
