"use client";
import { useState } from "react";
import Link from "next/link";
import type { CalendarDay } from "@/lib/schema";

const MONTH_NAMES = [
  "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const TYPE_COLORS: Record<string, string> = {
  Reels: "bg-violet-600",
  Carrossel: "bg-sky-600",
  Story: "bg-amber-500",
  Feed: "bg-emerald-600",
};

const NICHO_SUGGESTIONS = [
  "Barbearia", "Salão de Beleza", "Estética", "Personal Trainer",
  "Lanchonete", "Pizzaria", "Pet Shop", "Fotografia",
];

const TONE_OPTIONS = [
  { value: "", label: "Tom padrão" },
  { value: "descontraido", label: "Descontraído" },
  { value: "profissional", label: "Profissional" },
  { value: "premium", label: "Premium" },
];

export default function AdminDemoPage() {
  const [secret, setSecret] = useState("");
  const [niche, setNiche] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [servicesText, setServicesText] = useState("");
  const [tone, setTone] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [differentials, setDifferentials] = useState("");
  const [recurringPromos, setRecurringPromos] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    days: CalendarDay[];
    month: number;
    year: number;
  } | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/admin/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        niche,
        businessName,
        secret,
        ...(servicesText.trim() ? { servicesText: servicesText.trim() } : {}),
        ...(tone ? { tone } : {}),
        ...(city.trim() ? { city: city.trim() } : {}),
        ...(neighborhood.trim() ? { neighborhood: neighborhood.trim() } : {}),
        ...(differentials.trim() ? { differentials: differentials.trim() } : {}),
        ...(recurringPromos.trim() ? { recurringPromos: recurringPromos.trim() } : {}),
      }),
    });

    if (res.status === 401) {
      setError("Senha incorreta.");
      setLoading(false);
      return;
    }

    if (!res.ok) {
      setError("Erro ao gerar. Tente novamente.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  function copyAll() {
    if (!result) return;
    const text = result.days
      .map(
        (d) =>
          `📅 Dia ${d.day} — ${d.type}\n📌 ${d.theme}\n💬 ${d.caption}\n${d.hashtags.join(" ")}`
      )
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-violet-400">RitmoPost</span>
        <span className="text-xs bg-amber-600/30 border border-amber-600/50 text-amber-300 px-2 py-1 rounded-full">
          Admin Demo
        </span>
      </nav>

      <div className="max-w-6xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Modo Demo</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gere um calendário personalizado para mostrar ao prospect — sem paywall
          </p>
        </div>

        <form onSubmit={handleGenerate} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Senha admin</label>
              <input
                type="password"
                required
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nicho</label>
              <input
                type="text"
                required
                list="nicho-list"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Barbearia..."
              />
              <datalist id="nicho-list">
                {NICHO_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nome do negócio</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Barbearia do Zé..."
              />
            </div>
          </div>
          <details className="mt-4">
            <summary className="text-sm text-violet-400 cursor-pointer select-none">
              Perfil do prospect (opcional — dispara o WOW da personalização)
            </summary>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-slate-400 mb-1">
                  Serviços e preços (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={servicesText}
                  onChange={(e) => setServicesText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="Corte R$35, Combo corte+barba R$50, Sobrancelha R$15"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tom de voz</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  {TONE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Diferenciais</label>
                <input
                  type="text"
                  value={differentials}
                  onChange={(e) => setDifferentials(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="Único aberto até 22h..."
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Cidade</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="Tramandaí"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Bairro</label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="Centro"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Promoções recorrentes</label>
                <input
                  type="text"
                  value={recurringPromos}
                  onChange={(e) => setRecurringPromos(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="Terça 20% off, combo de sexta..."
                />
              </div>
            </div>
          </details>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors px-6 py-2.5 rounded-xl font-medium flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Gerando...
              </>
            ) : (
              "Gerar Calendário Demo"
            )}
          </button>
        </form>

        {result && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {businessName} · {MONTH_NAMES[result.month]}/{result.year}
              </h2>
              <button
                onClick={copyAll}
                className="bg-slate-800 hover:bg-slate-700 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
              >
                Copiar tudo
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {result.days.map((day) => (
                <div
                  key={day.day}
                  className="bg-slate-900 border border-slate-800 hover:border-violet-700/30 transition-colors rounded-xl p-3 group cursor-default"
                >
                  <p className="text-xs text-slate-600 mb-2 font-medium">Dia {day.day}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${TYPE_COLORS[day.type] ?? "bg-slate-600"}`}>
                    {day.type}
                  </span>
                  <p className="text-sm font-medium text-slate-200 mt-2 leading-tight">
                    {day.theme}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 italic leading-snug">
                    {day.hook}
                  </p>
                  <div className="mt-2 hidden group-hover:block">
                    <p className="text-xs text-slate-400 leading-snug border-t border-slate-800 pt-2">
                      {day.caption}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      {day.hashtags.slice(0, 4).join(" ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
