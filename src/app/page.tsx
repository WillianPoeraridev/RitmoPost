import Link from "next/link";

// Preview do produto no hero — mostra o sistema (30 dias com método), não um exemplo pra convencer.
const PREVIEW = [
  { day: 1, pillar: "Atração", color: "bg-rose-500", theme: "O erro que afasta cliente caro" },
  { day: 2, pillar: "Conexão", color: "bg-cyan-500", theme: "O bastidor que ninguém vê" },
  { day: 5, pillar: "Conversão", color: "bg-emerald-500", theme: "Por que sua agenda tá aberta" },
];

const PILLARS = [
  { label: "Atração", color: "bg-rose-500", gloss: "novos olhos" },
  { label: "Conexão", color: "bg-cyan-500", gloss: "confiança" },
  { label: "Conversão", color: "bg-emerald-500", gloss: "venda" },
];

const ENTRY = [
  "30 dias planejados com método — cada post tem um trabalho: atrair, conectar ou converter.",
  "Carrosséis prontos pra postar, na identidade visual da sua marca.",
  "Legendas e roteiros escritos na sua voz — não em voz de robô.",
  "Tudo de uma vez. Hoje. Não pingando ao longo do mês.",
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
              Começar — R$47
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto w-full px-6 py-14 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-5">
              Pra quem já é referência e cansou de postar no improviso
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.03]">
              Sua autoridade tá grande.
              <br />
              Seu feed, não.
            </h1>
            <p className="text-lg text-neutral-400 mt-6 max-w-md leading-relaxed">
              Cadência fecha esse buraco: 30 dias de conteúdo on-brand, na sua
              voz, prontos pra postar. Você não cria nada.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <Link
                href="/cadastro?next=entry"
                className="bg-rose-500 hover:bg-rose-400 transition-colors text-neutral-950 font-semibold px-7 py-3.5 rounded-xl text-lg text-center"
              >
                Quero meus 30 dias — R$47
              </Link>
              <span className="text-xs text-neutral-500 leading-relaxed">
                Pague uma vez.<br className="hidden sm:block" /> O mês inteiro chega hoje.
              </span>
            </div>
          </div>

          {/* Preview do produto — o sistema, em abundância */}
          <div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-neutral-300">Seu mês</span>
                <span className="text-xs text-neutral-600">30 dias com propósito</span>
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
              <p className="text-xs text-neutral-600 mt-4">
                + 27 dias, cada um com um trabalho.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 px-1">
              {PILLARS.map((p) => (
                <div key={p.label} className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-neutral-950 ${p.color}`}
                  >
                    {p.label}
                  </span>
                  <span className="text-xs text-neutral-500">{p.gloss}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* O QUE CHEGA HOJE — entregável da entrada */}
      <section className="border-t border-neutral-900">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            R$47. Uma vez. Tudo isso na sua mão hoje.
          </h2>
          <ul className="mt-7 space-y-4">
            {ENTRY.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-neutral-300 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* A MÁQUINA — ascensão */}
      <section className="border-t border-neutral-900">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-4">
            Depois do primeiro mês
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Gostou do mês? Deixa no automático.
          </h2>
          <p className="text-neutral-400 mt-5 leading-relaxed max-w-xl">
            Cadência Pro gera todo mês no piloto automático — na sua voz, com a
            arte pronta, entregue no seu WhatsApp.{" "}
            <span className="text-neutral-200">R$297/mês.</span> Você nunca mais
            abre o Canva.
          </p>
        </div>
      </section>

      {/* PROVA — somos nosso próprio case */}
      <section className="border-t border-neutral-900">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <p className="text-xl md:text-2xl font-medium tracking-tight leading-snug text-neutral-200">
            O feed que te trouxe até aqui foi feito com Cadência.
            <span className="text-neutral-500"> Somos nosso próprio case.</span>
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-neutral-900">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Seu próximo mês de conteúdo tá a um clique.
          </h2>
          <Link
            href="/cadastro?next=entry"
            className="inline-block mt-8 bg-rose-500 hover:bg-rose-400 transition-colors text-neutral-950 font-semibold px-8 py-4 rounded-xl text-lg"
          >
            Quero meus 30 dias — R$47
          </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-900 py-8 px-6">
        <div className="max-w-6xl mx-auto text-neutral-600 text-sm">
          Cadência · ritmopost.com.br
        </div>
      </footer>
    </div>
  );
}
