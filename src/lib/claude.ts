import { z } from "zod";
import type { CalendarDay, BusinessService, BusinessTone, ContentPillar } from "./schema";

// O haiku às vezes devolve o pilar com acento, maiúscula ou usando o sinônimo do
// pilar ("atenção", "confiança"). Normalizamos pra nunca derrubar a geração inteira
// por causa de uma variação de texto — pilar ausente/desconhecido vira undefined.
function normalizePillar(raw?: string): ContentPillar | undefined {
  if (!raw) return undefined;
  const k = raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
  if (k.startsWith("atra") || k.includes("aten")) return "atracao";
  if (k.startsWith("conex") || k.includes("confian")) return "conexao";
  if (k.startsWith("convers") || k.includes("venda")) return "conversao";
  return undefined;
}

// Subconjunto do perfil do negócio usado para enriquecer o prompt.
// Opcional em todas as gerações: sem perfil, o prompt continua igual ao de antes.
export type ProfileContext = {
  services?: BusinessService[];
  tone?: BusinessTone;
  differentials?: string;
  city?: string;
  neighborhood?: string;
  recurringPromos?: string | null;
};

const TONE_LABELS: Record<BusinessTone, string> = {
  descontraido: "descontraido e proximo, como uma conversa com cliente fiel",
  profissional: "profissional e confiavel, sem ser engessado",
  premium: "sofisticado e exclusivo, transmitindo alto padrao",
};

function buildProfileBlock(profile?: ProfileContext): string {
  if (!profile) return "";
  const lines: string[] = [];
  if (profile.services?.length) {
    const services = profile.services
      .map((s) => (s.price ? `${s.name} (${s.price})` : s.name))
      .join(", ");
    lines.push(`- Servicos e precos reais: ${services}`);
  }
  if (profile.tone) lines.push(`- Tom de voz: ${TONE_LABELS[profile.tone]}`);
  if (profile.differentials) lines.push(`- Diferenciais: ${profile.differentials}`);
  const location = [profile.neighborhood, profile.city].filter(Boolean).join(", ");
  if (location) lines.push(`- Localizacao: ${location}`);
  if (profile.recurringPromos) lines.push(`- Promocoes recorrentes: ${profile.recurringPromos}`);
  if (!lines.length) return "";
  return `\nPerfil do negocio (use estes dados reais nos posts):\n${lines.join("\n")}\n`;
}

function profileRules(profile?: ProfileContext): string {
  if (!profile || !buildProfileBlock(profile)) return "";
  return `\n- Cite servicos e precos REAIS do perfil em varios posts (CTAs com preco convertem mais)
- Pelo menos 5 posts do mes devem citar o bairro ou a cidade do perfil — gera identificacao local
- Escreva TODAS as legendas no tom de voz informado no perfil`;
}

const MONTH_NAMES = [
  "",
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const HOLIDAYS: Record<number, string[]> = {
  1: ["01/01 Ano Novo", "25/01 Aniversário de SP"],
  2: ["Carnaval (datas variam)", "14/02 Dia dos Namorados em alguns países"],
  3: ["08/03 Dia da Mulher", "19/03 Dia de São José"],
  4: ["21/04 Tiradentes", "22/04 Descobrimento do Brasil"],
  5: ["01/05 Dia do Trabalho", "Dia das Mães (2º domingo)"],
  6: ["12/06 Dia dos Namorados", "Festa Junina (mês todo)"],
  7: ["Férias escolares", "Festa Junina início do mês"],
  8: ["09/08 Dia dos Povos Indígenas", "Dia dos Pais (2º domingo)"],
  9: ["07/09 Independência do Brasil", "15/09 Dia do Cliente"],
  10: ["01/10 Dia das Crianças", "12/10 Nossa Sra Aparecida", "15/10 Dia do Professor", "31/10 Halloween"],
  11: ["02/11 Finados", "15/11 Proclamação da República", "20/11 Consciência Negra", "Black Friday (última sexta)"],
  12: ["25/12 Natal", "31/12 Réveillon"],
};

// Contexto rico por nicho para enriquecer o prompt da IA
const NICHE_TEMPLATES: Record<string, string> = {
  barbearia: "Seu publico são homens de 18-45 anos. Temas que performam: antes/depois do corte, tecnicas de barba, dicas de cuidado capilar, bastidores da barbearia, depoimentos de clientes, tutoriais rapidos. Evite posts muito formais.",
  "salão de beleza": "Publico feminino 20-50 anos. Temas que performam: transformacoes de cabelo, coloracoes, tratamentos, tendencias, cuidados em casa, bastidores, clientes satisfeitas. Use linguagem afetiva e inspiradora.",
  estetica: "Publico feminino 25-45 anos preocupado com autocuidado. Temas: procedimentos explicados, resultados antes/depois, mitos e verdades, dicas de rotina, promocoes de pacotes, bastidores dos atendimentos.",
  "personal trainer": "Publico de 20-45 anos querendo mudar o corpo. Temas: dicas de treino, motivacao, antes/depois de alunos, erros comuns na academia, nutricao basica, desafios, rotinas de exercicio. Tom motivacional.",
  lanchonete: "Publico local de todas as idades. Temas: fotos dos produtos, lancamentos do cardapio, bastidores da cozinha, promocoes do dia, combos especiais, depoimentos, horarios de funcionamento.",
  pizzaria: "Publico familiar e jovens adultos. Temas: pizzas do dia, ingredientes frescos, processo de producao, promocoes de fim de semana, sabores novos, delivery rapido, bastidores.",
  "açaí": "Publico jovem 15-35 anos. Temas: combinacoes do acai, montagem do bowl, ingredientes premium, promocoes, desafios, novos sabores, bastidores da preparacao. Tom descontraido e colorido.",
  fotografia: "Publico de noivos, familias e empresas. Temas: portfolio de ensaios, bastidores das sessoes, dicas de pose, resultados de clientes, equipamentos, processo criativo, depoimentos.",
  "pet shop": "Donos de pets de todas as idades. Temas: pets clientes do dia, dicas de cuidado, produtos em destaque, servicos de banho e tosa, curiosidades sobre racas, antes/depois da tosa.",
  "clínica": "Publico adulto preocupado com saude. Temas: dicas de saude e prevencao, procedimentos explicados, equipe especializada, depoimentos, mitos e verdades, orientacoes praticas.",
  "saas": "Publico de empreendedores, autonomos e donos de pequenos negocios. Temas que performam: antes/depois de usar a ferramenta (tempo economizado, resultado real), o problema que o software resolve mostrado na pratica, bastidores do desenvolvimento e decisoes de produto, depoimentos reais de usuarios, funcionalidades em destaque com caso de uso concreto, comparacao do processo manual vs automatizado. Tom: direto, mostre resultado antes de vender.",
  "software": "Publico de empreendedores, autonomos e donos de pequenos negocios. Temas que performam: antes/depois de usar a ferramenta (tempo economizado, resultado real), o problema que o software resolve mostrado na pratica, bastidores do desenvolvimento e decisoes de produto, depoimentos reais de usuarios, funcionalidades em destaque com caso de uso concreto, comparacao do processo manual vs automatizado. Tom: direto, mostre resultado antes de vender.",
  "marketing digital": "Publico de empreendedores e autonomos querendo crescer online. Temas: resultados reais com numeros (seguidores, vendas, alcance), bastidores da estrategia de conteudo, erros que destroem perfis do Instagram, metricas que importam vs metricas de vaidade, ferramentas e processo de trabalho, depoimentos de clientes com resultado especifico. Tom: educativo sem ser professor — quem ja fez mostrando o que funciona.",
  "negócios digitais": "Publico de empreendedores digitais e autonomos. Temas: bastidores de como o negocio funciona por dentro, receita e numeros reais (quanto fatura, quanto custa), processo de aquisicao de clientes, erros de quem esta comecando, ferramentas usadas no dia a dia, depoimentos de clientes com transformacao especifica. Tom: transparente e sem filtro — audiencia detesta marketing de guru.",
  "infoproduto": "Publico de empreendedores querendo monetizar conhecimento. Temas: resultados de alunos com numero especifico, bastidores da criacao do produto, o problema que o curso/mentoria resolve na pratica, objecoes mais comuns derrubadas com argumento real, processo de transformacao do aluno, comparacao antes/depois. Tom: prova social e resultado acima de qualquer promessa.",
  "criação de conteúdo": "Publico de criadores e empreendedores que querem crescer no Instagram. Temas: bastidores do processo criativo, metricas reais de posts (alcance, salvamentos, seguidores gerados), erros que matam o engajamento, rotina de producao de conteudo, ferramentas usadas, resultados de clientes ou da propria conta. Tom: quem ja faz mostrando o que funciona — sem guru, sem promessa vazia.",
};

function getNicheContext(niche: string): string {
  const key = niche.toLowerCase().trim();
  const exact = NICHE_TEMPLATES[key];
  if (exact) return exact;
  const partial = Object.keys(NICHE_TEMPLATES).find((k) => key.includes(k) || k.includes(key));
  return partial ? NICHE_TEMPLATES[partial] : "";
}

async function callOpenRouter(
  prompt: string,
  maxTokens: number,
  temperature?: number
): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "anthropic/claude-haiku-4-5",
      max_tokens: maxTokens,
      ...(temperature !== undefined ? { temperature } : {}),
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenRouter HTTP ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const choice = data?.choices?.[0];
  const content = choice?.message?.content;
  if (typeof content !== "string") {
    throw new Error(`OpenRouter returned no content: ${JSON.stringify(data).slice(0, 300)}`);
  }
  if (choice.finish_reason === "length") {
    throw new Error("OpenRouter response truncated (hit max_tokens) — increase max_tokens");
  }

  const text = content.trim();
  return text.startsWith("```") ? text.replace(/```(?:json)?\n?/g, "").trim() : text;
}

// Tenta consertar malformações comuns que o modelo emite (~10% das gerações com
// haiku): prosa antes/depois do JSON, vírgula sobrando antes de ] ou }, e vírgula
// FALTANDO entre dois objetos adjacentes — a causa do erro "Expected ',' or ']'".
function salvageJson(text: string, arrayRoot: boolean): string {
  let t = text.trim();
  // Recorta do primeiro delimitador de abertura até o último de fechamento,
  // descartando qualquer texto que o modelo tenha colocado em volta.
  const open = arrayRoot ? "[" : "{";
  const close = arrayRoot ? "]" : "}";
  const start = t.indexOf(open);
  const end = t.lastIndexOf(close);
  if (start !== -1 && end !== -1 && end > start) {
    t = t.slice(start, end + 1);
  }
  // Vírgula faltando entre objetos: `} {` ou `}\n{` → `},{`
  t = t.replace(/\}(\s*)\{/g, "},$1{");
  // Vírgula sobrando antes do fechamento: `, ]` → `]`
  t = t.replace(/,(\s*[\]}])/g, "$1");
  return t;
}

// JSON.parse tolerante: tenta o texto cru e, se falhar, tenta a versão "salvada".
// Erro inclui um trecho do texto para diagnóstico (truncamento, markdown solto).
function parseJsonOrThrow(text: string, context: string, arrayRoot = true): unknown {
  try {
    return JSON.parse(text);
  } catch {
    try {
      return JSON.parse(salvageJson(text, arrayRoot));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(
        `Failed to parse ${context} JSON (${msg}). Length=${text.length}. Tail: ${text.slice(-200)}`
      );
    }
  }
}

const calendarDaySchema = z.object({
  day: z.number(),
  type: z.enum(["Reels", "Carrossel", "Story", "Feed"]),
  // Pilar e story são opcionais e tolerantes: se o modelo omitir ou variar o texto,
  // o dia continua válido (geração robusta > campo perfeito). normalizePillar mapeia
  // variações ("Atenção", "Confiança", "Conversão") pro enum canônico.
  pillar: z
    .string()
    .optional()
    .transform(normalizePillar),
  theme: z.string(),
  hook: z.string(),
  caption: z.string(),
  hashtags: z.array(z.string()),
  story: z.string().optional(),
});

export async function generateSingleDay(
  niche: string,
  businessName: string,
  month: number,
  year: number,
  day: number,
  profile?: ProfileContext
): Promise<CalendarDay> {
  const monthName = MONTH_NAMES[month];
  const nicheContext = getNicheContext(niche);

  const prompt = `Voce e um especialista em marketing de conteudo para Instagram no Brasil, nicho "${niche}".
${nicheContext ? `\nContexto do nicho: ${nicheContext}` : ""}${buildProfileBlock(profile)}
Crie 1 post para o Dia ${day} de ${monthName}/${year} para:
Negocio: ${businessName}
Nicho: ${niche}

Cada post tem uma funcao estrategica (campo "pillar") — escolha a mais adequada pro dia:
- "atracao": opiniao/posicionamento do dono ou antes/depois que impressiona; traz seguidor novo (nunca "5 dicas" generico)
- "conexao": bastidor, rotina, historia real de cliente; gera confianca (nao e aula)
- "conversao": convite leve pra agir (agendar/pedir/aproveitar promo), tom de "a porta esta aberta"

Regras:
- Escolha o formato mais adequado para o dia (Reels, Carrossel, Story ou Feed)
- Post ESPECIFICO para o nicho, nunca generico
- Legenda em portugues brasileiro informal, sem cliches, NO MAXIMO 3 frases curtas
- Hashtags: EXATAMENTE de 6 a 8 — nunca menos que 6 — mix de genericas e de nicho
- Hook deve parar o scroll em 2 segundos
- "story": 1 frase curta do que postar no Story do dia${profileRules(profile)}

Retorne SOMENTE um objeto JSON valido (sem markdown, sem texto adicional). Use aspas duplas e escape aspas dentro dos textos. Formato:
{"day":${day},"type":"Reels","pillar":"atracao","theme":"tema especifico","hook":"primeira frase que para o scroll","caption":"legenda completa com CTA","hashtags":["#tag1","#tag2"],"story":"ideia de story do dia"}`;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const text = await callOpenRouter(prompt, 700, attempt === 1 ? undefined : 0.4);
      return calendarDaySchema.parse(parseJsonOrThrow(text, "single day", false)) as CalendarDay;
    } catch (err) {
      lastErr = err;
      console.warn(`[generateSingleDay] tentativa ${attempt}/3 falhou:`, err instanceof Error ? err.message : err);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export async function generateCalendar(
  niche: string,
  businessName: string,
  month: number,
  year: number,
  profile?: ProfileContext
): Promise<CalendarDay[]> {
  const monthName = MONTH_NAMES[month];
  const holidays = HOLIDAYS[month]?.join(", ") ?? "nenhuma data comemorativa relevante";
  const nicheContext = getNicheContext(niche);

  const prompt = `Voce e um estrategista de conteudo para Instagram no Brasil, especialista no segmento "${niche}". Voce NAO entrega "ideias de post soltas" — voce monta um PLANO de 30 dias que constroi a marca do negocio e faz o cliente chegar pronto pra comprar, sem o dono precisar correr atras de ninguem.
${nicheContext ? `\nContexto do nicho: ${nicheContext}` : ""}${buildProfileBlock(profile)}
Crie um calendario ESTRATEGICO de 30 dias para ${monthName}/${year} para:
Negocio: ${businessName}
Nicho: ${niche}

== METODO: cada post tem UMA funcao (campo "pillar") ==
1. "atracao" — para o scroll de quem ainda NAO conhece o negocio e traz seguidor novo. E OPINIAO/POSICIONAMENTO do dono que contraria o senso comum do nicho, OU um antes/depois/resultado que impressiona. NUNCA "5 dicas" generico. Quem le ou concorda na hora ou discorda e fica curioso — os dois viram seguidor.
2. "conexao" — faz quem ja segue CONFIAR. E bastidor, rotina, historia real de cliente, o que rolou no dia a dia, os valores do negocio. NAO e aula/tutorial. Mostra que o negocio e real e entende o problema do cliente na pratica.
3. "conversao" — CONVITE leve pra agir (agendar, pedir, aproveitar a promo). Sem desespero, sem "ULTIMA CHANCE". Tom de "a porta esta aberta". So funciona porque atracao e conexao ja construiram a confianca.

== DISTRIBUICAO OBRIGATORIA ==
- Pilares no mes: ~12 dias "atracao", ~12 dias "conexao", ~6 dias "conversao"
- NUNCA dois dias seguidos de "conversao". Ancore "conversao" nas datas comemorativas e nas promocoes do perfil.
- Dias 1 a 5 do mes: use SOMENTE "atracao" ou "conexao". E PROIBIDO "conversao" nesses 5 primeiros dias (primeiro constroi audiencia e confianca, depois convida)
- Formatos no mes: 12 Reels, 9 Carrossel, 6 Feed, 3 Story
- Datas comemorativas do mes: ${holidays} — crie posts tematicos para elas
- STORY DIARIO: alem do post, TODO dia tem o campo "story" com UMA ideia curta de Story (bastidor, enquete, pergunta, making-of) — e a camada diaria que mantem a audiencia aquecida

== REGRAS DE ESCRITA ==
- Cada post ESPECIFICO para o nicho - nunca generico
- Legendas em portugues brasileiro informal, sem cliches, NO MAXIMO 3 frases curtas (conte as frases antes de finalizar)
- Hashtags: EXATAMENTE de 6 a 8 por post — nunca menos que 6 — mix de genericas e de nicho
- Hook deve parar o scroll em 2 segundos
- "story": 1 frase curta e direta do que postar no Story daquele dia${profileRules(profile)}

Retorne SOMENTE um array JSON valido (sem markdown, sem texto adicional). Use aspas duplas e escape aspas dentro dos textos. Formato de cada item:
[{"day":1,"type":"Reels","pillar":"atracao","theme":"tema especifico do post","hook":"primeira frase que para o scroll","caption":"legenda completa com CTA","hashtags":["#tag1","#tag2"],"story":"ideia de story do dia"}]`;

  // Haiku emite JSON inválido em ~10% das gerações. Salvamos o que dá e, se ainda
  // assim falhar, regeneramos — uma tentativa nova quase sempre sai válida.
  let lastErr: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const text = await callOpenRouter(prompt, 10000, attempt === 1 ? undefined : 0.4);
      const parsed = parseJsonOrThrow(text, "calendar", true);
      return z.array(calendarDaySchema).parse(parsed) as CalendarDay[];
    } catch (err) {
      lastErr = err;
      console.warn(`[generateCalendar] tentativa ${attempt}/3 falhou:`, err instanceof Error ? err.message : err);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export async function generateReelsScript(
  day: CalendarDay,
  niche: string,
  businessName: string
): Promise<string> {
  const prompt = `Voce e um roteirista de videos curtos para Instagram no Brasil, especialista em "${niche}".

Crie um roteiro de 30 segundos para um Reels com base neste post:
Negocio: ${businessName}
Tema: ${day.theme}
Hook: ${day.hook}
Legenda: ${day.caption}

Formato do roteiro:
[0-3s] HOOK VISUAL: o que aparece na tela + o que falar
[3-10s] PROBLEMA/CONTEXTO: desenvolvimento rapido
[10-25s] SOLUCAO/CONTEUDO: o valor entregue
[25-30s] CTA: chamada para acao clara

Escreva em portugues brasileiro informal. Seja especifico, nao generico. Maximo 150 palavras.`;

  return callOpenRouter(prompt, 600);
}
