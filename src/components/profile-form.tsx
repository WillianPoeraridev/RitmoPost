"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BusinessService, BusinessTone } from "@/lib/schema";
import { LogoUpload } from "@/components/logo-upload";

const NICHE_SUGGESTIONS = [
  "Mentoria de negócios", "Copywriting e vendas", "Marketing digital",
  "Coach de carreira", "Finanças pessoais", "Liderança e gestão",
  "Design de interiores", "Arquitetura", "Fotografia", "Nutrição e saúde",
  "Psicologia e desenvolvimento", "Tráfego pago",
];

const TONE_OPTIONS: { value: BusinessTone; label: string; hint: string }[] = [
  { value: "descontraido", label: "Direto e cru", hint: "sem filtro, sem rodeio" },
  { value: "profissional", label: "Autoridade", hint: "sólido, seguro, experiente" },
  { value: "premium", label: "Premium", hint: "sofisticado, aspiracional" },
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
  "w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors";

export function ProfileForm({
  profileId,
  initial,
  initialLogoUrl,
}: {
  profileId?: string;
  initial?: ProfileFormData;
  initialLogoUrl?: string | null;
}) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(initial?.businessName ?? "");
  const [niche, setNiche] = useState(initial?.niche ?? "");
  const [services, setServices] = useState<BusinessService[]>(
    initial?.services?.length ? initial.services : [{ name: "", price: "" }]
  );
  const [tone, setTone] = useState<BusinessTone>(initial?.tone ?? "profissional");
  const [differentials, setDifferentials] = useState(initial?.differentials ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
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
      neighborhood: "",
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
      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5"
    >
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Seu nome / marca *</label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className={inputClass}
            placeholder="Ex: João Silva | Mentor de Vendas"
          />
        </div>
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Área de especialidade *</label>
          <input
            type="text"
            required
            list="niche-list"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className={inputClass}
            placeholder="Ex: Mentoria de negócios"
          />
          <datalist id="niche-list">
            {NICHE_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label className="block text-sm text-neutral-400 mb-1">
          Ofertas e programas
          <span className="text-neutral-600"> — o que você vende e por quanto</span>
        </label>
        <div className="space-y-2">
          {services.map((service, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={service.name}
                onChange={(e) => setService(i, { name: e.target.value })}
                className={inputClass}
                placeholder="Ex: Mentoria 1:1 intensiva"
              />
              <input
                type="text"
                value={service.price ?? ""}
                onChange={(e) => setService(i, { price: e.target.value })}
                className={`${inputClass} max-w-[140px]`}
                placeholder="R$3.000"
              />
              {services.length > 1 && (
                <button
                  type="button"
                  onClick={() => setServices((prev) => prev.filter((_, j) => j !== i))}
                  className="text-neutral-500 hover:text-red-400 px-2 transition-colors"
                  aria-label="Remover oferta"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {services.length < 10 && (
          <button
            type="button"
            onClick={() => setServices((prev) => [...prev, { name: "", price: "" }])}
            className="text-xs text-rose-400 hover:underline mt-2"
          >
            + Adicionar oferta
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm text-neutral-400 mb-1">Tom de voz</label>
        <div className="grid sm:grid-cols-3 gap-2">
          {TONE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTone(opt.value)}
              className={`py-2.5 px-3 rounded-lg text-sm border text-left transition-colors ${
                tone === opt.value
                  ? "bg-rose-600 border-rose-500 text-white"
                  : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              <span className="font-medium block">{opt.label}</span>
              <span className={`text-xs ${tone === opt.value ? "text-rose-200" : "text-neutral-500"}`}>
                {opt.hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-neutral-400 mb-1">
          Metodologia / pilares da sua marca
        </label>
        <textarea
          value={differentials}
          onChange={(e) => setDifferentials(e.target.value)}
          maxLength={500}
          rows={2}
          className={inputClass}
          placeholder="Ex: Meu método tem 3 pilares: Clareza, Consistência, Conversão. Ensino pelo princípio de..."
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Público-alvo</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
            placeholder="Ex: Empreendedores digitais 28-45 anos"
          />
        </div>
        <div>
          <label className="block text-sm text-neutral-400 mb-1">
            Tema âncora
            <span className="text-neutral-600"> — assunto que você sempre volta</span>
          </label>
          <input
            type="text"
            value={recurringPromos}
            onChange={(e) => setRecurringPromos(e.target.value)}
            className={inputClass}
            placeholder="Ex: liberdade financeira, mentalidade de dono"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-neutral-400 mb-1">Instagram</label>
        <input
          type="text"
          value={instagramHandle}
          onChange={(e) => setInstagramHandle(e.target.value)}
          className={inputClass}
          placeholder="@seuperfil"
        />
      </div>

      {profileId ? (
        <div className="border-t border-neutral-800 pt-5">
          <LogoUpload profileId={profileId} initialLogoUrl={initialLogoUrl} />
        </div>
      ) : (
        <p className="text-xs text-neutral-600 border-t border-neutral-800 pt-5">
          A logo pode ser enviada depois — ela aparece nos carrosséis.
        </p>
      )}

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
          className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-6 py-2.5 rounded-xl font-semibold"
        >
          {loading ? "Salvando..." : profileId ? "Salvar alterações" : "Criar perfil"}
        </button>
      </div>
    </form>
  );
}
