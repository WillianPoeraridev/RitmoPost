"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const NICHE_SUGGESTIONS = [
  "Mentoria de negócios", "Copywriting", "Marketing digital",
  "Coach de carreira", "Finanças", "Design de interiores",
  "Arquitetura", "Fotografia", "Saúde e performance", "Tráfego pago",
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
  const [city, setCity] = useState("");
  const [differentials, setDifferentials] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = manualMode
      ? { niche, businessName, city: city || undefined, differentials: differentials || undefined, month: selectedMonth.month, year: selectedMonth.year }
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
        body: JSON.stringify({ plan: "monthly" }),
      });
      if (!checkoutRes.ok) {
        const data = await checkoutRes.json().catch(() => ({}));
        setError(data.error ?? "Erro ao iniciar checkout. Tente novamente.");
        setLoading(false);
        return;
      }
      const { url } = await checkoutRes.json();
      window.location.href = url;
      return;
    }

    if (!res.ok) {
      setError("Erro ao gerar o conteúdo. Tente novamente.");
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
      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5"
    >
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {hasProfiles && !manualMode ? (
        <div>
          <label className="block text-sm text-neutral-400 mb-2">Perfil de marca</label>
          <div className="space-y-2">
            {profiles.map((p) => {
              const selected = selectedProfileId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProfileId(p.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    selected
                      ? "bg-rose-600/20 border-rose-500"
                      : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
                  }`}
                >
                  <span className="font-medium block">{p.businessName}</span>
                  <span className="text-xs text-neutral-400">
                    {p.niche}
                    {p.servicesCount > 0
                      ? ` · ${p.servicesCount} oferta${p.servicesCount > 1 ? "s" : ""}`
                      : ""}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2">
            <Link href="/perfil/novo" className="text-xs text-rose-400 hover:underline">
              + Criar outro perfil
            </Link>
            <button
              type="button"
              onClick={() => setManualMode(true)}
              className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              Gerar sem perfil (genérico)
            </button>
          </div>
        </div>
      ) : (
        <>
          {hasProfiles && (
            <button
              type="button"
              onClick={() => setManualMode(false)}
              className="text-xs text-rose-400 hover:underline"
            >
              ← Usar um perfil salvo
            </button>
          )}
          {!hasProfiles && (
            <div className="space-y-3">
              <Link
                href="/perfil/novo"
                className="flex flex-col w-full bg-rose-600/20 border border-rose-500/60 hover:border-rose-400 hover:bg-rose-600/30 transition-colors px-4 py-4 rounded-xl text-left"
              >
                <span className="font-semibold text-rose-300 text-sm">Criar meu perfil de marca →</span>
                <span className="text-xs text-neutral-400 mt-0.5">Voz, método, ofertas — o conteúdo sai na sua cara. 2 minutos de setup.</span>
              </Link>
              <button
                type="button"
                onClick={() => {}}
                className="text-xs text-neutral-500 hover:text-neutral-400 transition-colors w-full text-center"
              >
                ou continuar sem perfil (conteúdo genérico)
              </button>
            </div>
          )}
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Área de especialidade</label>
            <input
              type="text"
              required={manualMode}
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="Ex: Mentoria de negócios, Coach de carreira..."
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {NICHE_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNiche(s)}
                  className="text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-2 py-1 rounded-full transition-colors text-neutral-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Seu nome / marca</label>
            <input
              type="text"
              required={manualMode}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="Ex: João Silva | Mentor de Vendas"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">
              Público-alvo <span className="text-neutral-600">(opcional)</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="Ex: Empreendedores digitais 28-45 anos"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">
              Metodologia / diferencial <span className="text-neutral-600">(opcional)</span>
            </label>
            <input
              type="text"
              value={differentials}
              onChange={(e) => setDifferentials(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="Ex: Método dos 3 pilares: Clareza, Consistência, Conversão"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm text-neutral-400 mb-1">Mês do conteúdo</label>
        <div className="flex gap-2">
          {monthOptions.map((opt) => (
            <button
              key={`${opt.month}-${opt.year}`}
              type="button"
              onClick={() => setSelectedMonth(opt)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selectedMonth.month === opt.month && selectedMonth.year === opt.year
                  ? "bg-rose-600 border-rose-500 text-white"
                  : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
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
        className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-3 rounded-xl font-semibold text-lg relative"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Gerando seu conteúdo...
          </span>
        ) : (
          "Gerar conteúdo →"
        )}
      </button>

      {loading && (
        <p className="text-center text-neutral-500 text-xs">
          30 dias com método — leva uns 30 a 40 segundos.
        </p>
      )}
    </form>
  );
}
