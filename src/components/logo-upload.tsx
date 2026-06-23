"use client";
import { useRef, useState } from "react";

// Upload da logo do negócio (vai pro R2; renderizada nos carrosséis).
export function LogoUpload({
  profileId,
  initialLogoUrl,
}: {
  profileId: string;
  initialLogoUrl?: string | null;
}) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/profiles/${profileId}/logo`, { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar a logo.");
        return;
      }
      setLogoUrl(data.logoUrl);
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/logo`, { method: "DELETE" });
      if (!res.ok) {
        setError("Erro ao remover a logo.");
        return;
      }
      setLogoUrl(null);
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1">
        Logo
        <span className="text-neutral-600"> — aparece nos carrosséis. PNG transparente fica melhor.</span>
      </label>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-lg border border-neutral-700 bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
          ) : (
            <span className="text-neutral-600 text-xs">sem logo</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFile}
            disabled={busy}
            className="hidden"
            id="logo-input"
          />
          <label
            htmlFor="logo-input"
            className={`inline-flex items-center justify-center cursor-pointer text-sm bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 px-4 py-2 rounded-lg transition-colors ${
              busy ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {busy ? "Enviando…" : logoUrl ? "Trocar logo" : "Enviar logo"}
          </label>
          {logoUrl && !busy && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-red-400/80 hover:text-red-400 transition-colors text-left"
            >
              Remover
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
