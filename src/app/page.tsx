import Link from "next/link";

const EXAMPLE_DAYS = [
  { day: 1, type: "Reels", theme: "Antes e Depois do Degradê", hook: "Esse corte mudou tudo" },
  { day: 2, type: "Carrossel", theme: "5 erros no corte que afastam clientes", hook: "Você comete o #3?" },
  { day: 3, type: "Story", theme: "Bastidores da semana", hook: "O dia a dia da barbearia" },
  { day: 4, type: "Feed", theme: "Cliente feliz com o resultado", hook: "Transformação real aqui" },
  { day: 5, type: "Reels", theme: "Técnica de barba em 60 segundos", hook: "Aprenda em 1 minuto" },
  { day: 6, type: "Carrossel", theme: "Tipos de degradê: qual combina com você?", hook: "Qual é o seu?" },
  { day: 7, type: "Feed", theme: "Promoção Domingo: corte + barba", hook: "Só hoje!" },
  { day: 8, type: "Reels", theme: "Reação do cliente ao ver o resultado", hook: "A cara dele disse tudo" },
  { day: 9, type: "Story", theme: "Agenda da semana — horários disponíveis", hook: "Ainda tem vaga!" },
  { day: 10, type: "Carrossel", theme: "Cuidados pós-corte para durar mais", hook: "Dicas que ninguém conta" },
];

const TYPE_COLORS: Record<string, string> = {
  Reels: "bg-violet-600",
  Carrossel: "bg-sky-600",
  Story: "bg-amber-500",
  Feed: "bg-emerald-600",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-violet-400">PostaJá</span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="text-sm bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg font-medium"
          >
            Criar grátis
          </Link>
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-block bg-violet-900/30 border border-violet-700/50 text-violet-300 text-xs font-medium px-3 py-1 rounded-full mb-6">
          Gerado por IA · Personalizado para o seu negócio
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl">
          30 dias de conteúdo para o{" "}
          <span className="text-violet-400">Instagram</span> em{" "}
          <span className="text-violet-400">10 segundos</span>
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-xl">
          Chega de &quot;o que eu posto hoje?&quot;. Digite seu nicho, a IA cria o calendário inteiro — ideias, legendas prontas e hashtags. Você baixa em PDF e usa.
        </p>
        <Link
          href="/cadastro"
          className="bg-violet-600 hover:bg-violet-500 transition-colors text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lg shadow-violet-900/40"
        >
          Gerar meu primeiro calendário grátis →
        </Link>
        <p className="text-xs text-slate-500 mt-4">
          Sem cartão. 1 calendário grátis. Plano Pro R$29,90/mês.
        </p>
      </section>

      <section className="max-w-5xl mx-auto w-full px-6 pb-20">
        <p className="text-center text-slate-500 text-sm mb-6">
          Exemplo gerado para uma Barbearia — em 10 segundos
        </p>
        <div className="grid grid-cols-5 gap-3">
          {EXAMPLE_DAYS.map((day) => (
            <div
              key={day.day}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 hover:border-violet-700/50 transition-colors"
            >
              <p className="text-xs text-slate-600 mb-2">Dia {day.day}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${TYPE_COLORS[day.type]}`}>
                {day.type}
              </span>
              <p className="text-sm font-medium text-slate-200 mt-2 leading-tight">{day.theme}</p>
              <p className="text-xs text-slate-500 mt-1 italic">{day.hook}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-600 text-xs mt-4">
          + 20 dias com legendas completas e hashtags. Tudo exportado em PDF profissional.
        </p>
      </section>

      <section className="border-t border-slate-800 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Preço simples</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Grátis</h3>
              <p className="text-4xl font-bold mb-6">R$0</p>
              <ul className="space-y-3 text-slate-400 text-sm mb-8">
                <li>✓ 1 calendário completo de 30 dias</li>
                <li>✓ PDF para download</li>
                <li>✓ Personalizado para seu nicho</li>
              </ul>
              <Link href="/cadastro" className="block text-center bg-slate-800 hover:bg-slate-700 transition-colors py-3 rounded-xl font-medium">
                Começar grátis
              </Link>
            </div>
            <div className="bg-violet-900/20 border border-violet-700/50 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">Pro</h3>
                <span className="text-xs bg-violet-600 px-2 py-0.5 rounded-full">Mais popular</span>
              </div>
              <p className="text-4xl font-bold mb-1">R$29,90<span className="text-lg text-slate-400 font-normal">/mês</span></p>
              <p className="text-sm text-slate-400 mb-6">ou R$239/ano — economize 2 meses</p>
              <ul className="space-y-3 text-slate-300 text-sm mb-8">
                <li>✓ Calendários ilimitados</li>
                <li>✓ PDF profissional todo mês</li>
                <li>✓ Histórico de 12 meses</li>
                <li>✓ Qualquer nicho e negócio</li>
              </ul>
              <Link href="/cadastro" className="block text-center bg-violet-600 hover:bg-violet-500 transition-colors py-3 rounded-xl font-semibold shadow-lg shadow-violet-900/40">
                Assinar Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-600 text-sm">
        PostaJá · Conteúdo para Instagram com IA · contato@postaja.com.br
      </footer>
    </div>
  );
}
