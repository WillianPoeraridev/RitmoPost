"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BusinessService, BusinessTone } from "@/lib/schema";

const NICHO_SUGGESTIONS = [
  "Barbearia", "Salão de Beleza", "Estética", "Personal Trainer",
  "Lanchonete", "Pizzaria", "Açaí", "Fotografia", "Pet Shop", "Clínica",
];

const TONE_OPTIONS: { value: BusinessTone; label: string; hint: string }[] = [
  { value: "descontraido", label: "Descontraído", hint: "papo de cliente fiel" },
  { value: "profissional", label: "Profissional", hint: "confiável, sem ser duro" },
  { value: "premium", label: "Premium", hint: "sofisticado, alto padrão" },
];

export type ProfileFormData = {
  businessName: string;
  niche: string;
  services: BusinessService[];
  tone: BusinessTone;
  differentials: string;
  city: string;
  neighborhood: string;
  recurringPromos: string | null;
  instagramHandle: string | null;
};

const inputClass =
  "w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors";

export function ProfileForm({
  profileId,
  initial,
}: {
  profileId?: string;
  initial?: ProfileFormData;
}) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(initial?.businessName ?? "");
  const [niche, setNiche] = useState(initial?.niche ?? "");
  const [services, setServices] = useState<BusinessService[]>(
    initial?.services?.length ? initial.services : [{ name: "", price: "" }]
  );
  const [tone, setTone] = useState<BusinessTone>(initial?.tone ?? "descontraido");
  const [differentials, setDifferentials] = useState(initial?.differentials ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [neighborhood, setNeighborhood] = useState(initial?.neighborhood ?? "");
  const [recurringPromos, setRecurringPromos] = useState(initial?.recurringPromos ?? "");
  const [instagramHandle, setInstagramHandle] = useState(initial?.instagramHandle ?? "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  function setService(index: number, patch: Partial<BusinessService>) {
    setServices((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = {
      businessName,
      niche,
      services: services
        .filter((s) => s.name.trim())
        .map((s) => ({ name: s.name.trim(), ...(s.price?.trim() ? { price: s.price.trim() } : {}) })),
      tone,
      differentials,
      city,
      neighborhood,
      recurringPromos: recurringPromos.trim() || null,
      instagramHandle: instagramHandle.trim() || null,
    };

    try {
      const res = await fetch(profileId ? `/api/profiles/${profileId}` : "/api/profiles", {
        method: profileId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        setError("Erro ao salvar o perfil. Confira os campos e tente novamente.");
        setLoading(false);
        return;
      }

      router.push("/perfil");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!profileId) return;
    if (!confirm("Excluir este perfil? Os calendários já gerados continuam disponíveis.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Erro ao excluir o perfil.");
        setDeleting(false);
        return;
      }
      router.push("/perfil");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setDeleting(false);
    }
  }

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

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Nome do negócio *</label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className={inputClass}
            placeholder="Ex: Barbearia do Zé"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Nicho / Segmento *</label>
          <input
            type="text"
            required
            list="nicho-list"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className={inputClass}
            placeholder="Ex: Barbearia"
          />
          <datalist id="nicho-list">
            {NICHO_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">
          Serviços e preços
          <span className="text-slate-600"> — os posts vão citar esses valores</span>
        </label>
        <div className="space-y-2">
          {services.map((service, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={service.name}
                onChange={(e) => setService(i, { name: e.target.value })}
                className={inputClass}
                placeholder="Ex: Combo corte + barba"
              />
              <input
                type="text"
                value={service.price ?? ""}
                onChange={(e) => setService(i, { price: e.target.value })}
                className={`${inputClass} max-w-[120px]`}
                placeholder="R$50"
              />
              {services.length > 1 && (
                <button
                  type="button"
                  onClick={() => setServices((prev) => prev.filter((_, j) => j !== i))}
                  className="text-slate-500 hover:text-red-400 px-2 transition-colors"
                  aria-label="Remover serviço"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {services.length < 20 && (
          <button
            type="button"
            onClick={() => setServices((prev) => [...prev, { name: "", price: "" }])}
            className="text-xs text-violet-400 hover:underline mt-2"
          >
            + Adicionar serviço
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Tom de voz</label>
        <div className="grid sm:grid-cols-3 gap-2">
          {TONE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTone(opt.value)}
              className={`py-2.5 px-3 rounded-lg text-sm border text-left transition-colors ${
                tone === opt.value
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <span className="font-medium block">{opt.label}</span>
              <span className={`text-xs ${tone === opt.value ? "text-violet-200" : "text-slate-500"}`}>
                {opt.hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Diferenciais</label>
        <textarea
          value={differentials}
          onChange={(e) => setDifferentials(e.target.value)}
          maxLength={500}
          rows={2}
          className={inputClass}
          placeholder="Ex: único com horário até 22h, atendimento com hora marcada, cerveja grátis"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Cidade</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
            placeholder="Ex: Tramandaí"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Bairro</label>
          <input
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className={inputClass}
            placeholder="Ex: Centro"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Promoções recorrentes</label>
          <input
            type="text"
            value={recurringPromos}
            onChange={(e) => setRecurringPromos(e.target.value)}
            className={inputClass}
            placeholder="Ex: terça 20% off, combo de sexta"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Instagram</label>
          <input
            type="text"
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value)}
            className={inputClass}
            placeholder="@barbeariadoze"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        {profileId ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-400/80 hover:text-red-400 disabled:opacity-50 transition-colors"
          >
            {deleting ? "Excluindo..." : "Excluir perfil"}
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={loading || !businessName || !niche}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-6 py-2.5 rounded-xl font-semibold"
        >
          {loading ? "Salvando..." : profileId ? "Salvar alterações" : "Criar perfil"}
        </button>
      </div>
    </form>
  );
}
