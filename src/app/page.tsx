import Link from "next/link";

const PREVIEW = [
  { day: 1, pillar: "Atração", color: "bg-rose-500", theme: "O erro que afasta cliente caro" },
  { day: 2, pillar: "Conexão", color: "bg-cyan-500", theme: "O bastidor que ninguém vê" },
  { day: 3, pillar: "Conversão", color: "bg-emerald-500", theme: "Por que sua agenda tá aberta" },
];

const ENTRY = [
  "30 posts. Cada um com um trabalho — atrair, conectar ou converter.",
  "Carrossel e legenda na sua marca.",
  "Tudo de uma vez. Hoje.",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <nav className="border-b border-neutral-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-semibold tracking-tight">
            Cadência<span className="text-rose-500">.</span>
          </span>
          <div className="flex items-center gap-1">
            <Link
              href="/login"
              className="text-sm text-neutral-400 hover:text-white transition-colors px-4 py-2"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro?next=entry"
              className="text-sm bg-rose-500 hover:bg-rose-400 transition-colors px-4 py-2 rounded-lg font-medium text-neutral-950"
            >
              Começar → R$47
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto w-full px-6 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-5">
              Você virou referência. Não criador de conteúdo.
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.03]">
              Sua autoridade tá grande.
              <br />
              Seu feed, não.
            </h1>
            <p className="text-lg text-neutral-400 mt-5 max-w-md leading-relaxed">
              30 dias de conteúdo na sua marca. Você não escreve nada.
            </p>
          </div>

          <div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl shadow-black/40">
              <div className="mb-4">
                <span className="text-sm font-medium text-neutral-300">Seu mês</span>
              </div>
              <div className="space-y-2.5">
                {PREVIEW.map((p) => (
                  <div
                    key={p.day}
                    className="flex items-center gap-3 bg-neutral-950/60 border border-neutral-800 rounded-xl px-3 py-2.5"
                  >
                    <span className="text-xs text-neutral-600 font-medium w-12 shrink-0">
                      Dia {p.day}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-neutral-950 ${p.color} shrink-0`}
                    >
                      {p.pillar}
                    </span>
                    <span className="text-sm text-neutral-300 truncate">{p.theme}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-neutral-600">+ 27 dias, cada um com um trabalho.</span>
                <span className="text-xs text-neutral-600">30 dias com propósito</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ENTRADA × ASCENSÃO */}
      <section className="border-t border-neutral-900">
        <div className="max-w-5xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-10 lg:gap-0">
          <div className="lg:pr-14">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              R$47, uma vez. O mês inteiro na sua mão hoje.
            </h2>
            <ul className="mt-6 space-y-3">
              {ENTRY.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-neutral-300 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t-2 border-rose-500 pt-8 lg:border-t-0 lg:pt-0 lg:border-l-2 lg:pl-14 lg:flex lg:flex-col lg:justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500 mb-4">
              Depois do primeiro mês
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Deixa no automático.
            </h2>
            <p className="text-lg text-neutral-400 mt-4 leading-relaxed">
              Todo mês no WhatsApp. Arte pronta, na sua marca.{" "}
              <span className="text-neutral-100 font-medium">R$297/mês.</span>
            </p>
          </div>
        </div>
      </section>

      {/* PROVA */}
      <section className="border-t border-neutral-900">
        <div className="max-w-3xl mx-auto px-6 py-8 md:py-10">
          <p className="text-xl md:text-2xl font-medium tracking-tight leading-snug text-neutral-200 text-center">
            O feed que te trouxe até aqui foi feito com Cadência.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-neutral-900">
        <div className="max-w-5xl mx-auto px-6 py-12 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight md:whitespace-nowrap">
            O próximo mês começa agora.
          </h2>
          <Link
            href="/cadastro?next=entry"
            className="inline-block mt-7 bg-rose-500 hover:bg-rose-400 transition-colors text-neutral-950 font-semibold px-8 py-4 rounded-xl text-lg"
          >
            Quero meus 30 dias → R$47
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-900 py-6 px-6">
        <div className="max-w-6xl mx-auto text-neutral-600 text-sm text-center">
          Cadência · ritmopost.com.br
        </div>
      </footer>
    </div>
  );
}
