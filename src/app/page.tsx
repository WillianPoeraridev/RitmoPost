import Link from "next/link";

// Preview do produto no hero — mostra o plano com método, não um exemplo pra convencer.
const PREVIEW = [
  { day: 1, type: "Reels", pillar: "Atração", color: "bg-rose-600", theme: "O erro que afasta cliente" },
  { day: 2, type: "Story", pillar: "Conexão", color: "bg-cyan-600", theme: "O bastidor de hoje" },
  { day: 5, type: "Carrossel", pillar: "Conversão", color: "bg-green-600", theme: "Tá na hora de agendar" },
];

const PILLARS = [
  { label: "Atração", color: "bg-rose-600", gloss: "novos seguidores" },
  { label: "Conexão", color: "bg-cyan-600", gloss: "confiança" },
  { label: "Conversão", color: "bg-green-600", gloss: "venda" },
];

const STEPS = [
  {
    title: "Conta do seu negócio",
    text: "Nicho, serviços, preços e bairro.",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    title: "A IA monta seu mês",
    text: "30 posts com método, em 10 segundos.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    title: "Recebe e posta",
    text: "O post do dia chega no seu WhatsApp.",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <nav className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
            RitmoPost
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-neutral-400 hover:text-white transition-colors px-4 py-2"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="text-sm bg-rose-500 hover:bg-rose-400 transition-colors px-4 py-2 rounded-lg font-medium text-white"
            >
              Criar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto w-full px-6 py-10 lg:py-14">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Texto à esquerda */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              Seu mês inteiro de Instagram,{" "}
              <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                pronto em 10 segundos.
              </span>
            </h1>
            <p className="text-lg text-neutral-400 mt-5 max-w-md">
              Posts, stories e legendas feitos pro seu negócio.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4">
              <Link
                href="/cadastro"
                className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 transition-colors text-white font-semibold px-7 py-3.5 rounded-xl text-lg shadow-lg shadow-rose-900/30 text-center"
              >
                Gerar meu plano grátis →
              </Link>
              <span className="text-xs text-neutral-500">
                Grátis pra começar.<br className="hidden sm:block" /> Sem cartão.
              </span>
            </div>
          </div>

          {/* Preview do produto à direita */}
          <div>
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-rose-600/25 to-orange-600/10 blur-3xl rounded-full" />
              <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-neutral-200">Seu plano do mês</span>
                  <span className="text-xs text-neutral-600">30 dias</span>
                </div>
                <div className="space-y-2.5">
                  {PREVIEW.map((p) => (
                    <div key={p.day} className="flex items-center gap-3 bg-neutral-950/70 border border-neutral-800 rounded-xl px-3 py-2.5">
                      <span className="text-xs text-neutral-600 font-medium w-10 shrink-0">Dia {p.day}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white ${p.color} shrink-0`}>
                        {p.pillar}
                      </span>
                      <span className="text-sm text-neutral-300 truncate">{p.theme}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-neutral-600 mt-4">+ 27 dias, cada um com um propósito.</p>
              </div>
            </div>

            {/* Método — legenda compacta sob o preview */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 px-1">
              {PILLARS.map((p) => (
                <div key={p.label} className="flex items-center gap-2 group">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white ${p.color} transition-transform group-hover:scale-105`}>
                    {p.label}
                  </span>
                  <span className="text-xs text-neutral-500">{p.gloss}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-bold mb-6">Como funciona</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex items-start gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    Passo {i + 1}
                  </p>
                  <h3 className="font-semibold leading-tight mt-0.5">{s.title}</h3>
                  <p className="text-sm text-neutral-400 mt-1 leading-snug">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇO */}
      <section className="border-t border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl font-bold mb-6">Entre pro ritmo.</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-neutral-300 mb-2">Grátis</h3>
              <p className="text-4xl font-bold mb-6">R$0</p>
              <ul className="space-y-3 text-neutral-400 text-sm mb-8">
                <li>✓ 1 plano pro seu nicho</li>
                <li>✓ Prévia de 7 dias</li>
                <li>✓ Sem cartão</li>
              </ul>
              <Link href="/cadastro" className="block text-center bg-neutral-800 hover:bg-neutral-700 transition-colors py-3 rounded-xl font-medium">
                Começar grátis
              </Link>
            </div>
            <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">Pro</h3>
                <span className="text-xs bg-gradient-to-r from-rose-500 to-orange-500 px-2 py-0.5 rounded-full text-white">Mais popular</span>
              </div>
              <p className="text-4xl font-bold mb-1">R$29,90<span className="text-lg text-neutral-400 font-normal">/mês</span></p>
              <p className="text-sm text-neutral-400 mb-6">ou R$269/ano · 3 meses grátis</p>
              <ul className="space-y-3 text-neutral-300 text-sm mb-8">
                <li>✓ Planos ilimitados</li>
                <li>✓ O post do dia no seu WhatsApp</li>
                <li>✓ PDF sem marca d&apos;água</li>
                <li>✓ Histórico de 12 meses</li>
              </ul>
              <Link href="/cadastro" className="block text-center bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 transition-colors py-3 rounded-xl font-semibold shadow-lg shadow-rose-900/30 text-white">
                Assinar Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-800 py-8 px-6">
        <div className="max-w-6xl mx-auto text-neutral-600 text-sm">
          RitmoPost · ritmopost.com.br
        </div>
      </footer>
    </div>
  );
}
