"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signUp.email({ name, email, password });

      if (result.error) {
        setError(result.error.message ?? "Erro ao criar conta. Tente novamente.");
        setLoading(false);
        return;
      }

      fetch("/api/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }).catch(() => {});

      // Veio do CTA de entrada (R$47)? Manda direto pro checkout em vez do app.
      const next = new URLSearchParams(window.location.search).get("next");
      if (next === "entry") {
        try {
          const res = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan: "entry" }),
          });
          const { url } = await res.json();
          if (url) {
            window.location.href = url;
            return;
          }
        } catch {
          // Falhou o checkout: cai no app mesmo assim, sem travar o cadastro.
        }
      }

      router.push("/gerar");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-semibold tracking-tight">
            Cadência<span className="text-rose-500">.</span>
          </Link>
          <p className="text-neutral-400 mt-2 text-sm">
            Quase lá. Seus 30 dias chegam hoje.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Nome</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-2.5 rounded-lg font-medium"
          >
            {loading ? "Um segundo..." : "Quero meus 30 dias"}
          </button>
        </form>

        <p className="text-center text-neutral-500 text-sm mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-rose-400 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
