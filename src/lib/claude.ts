import { z } from "zod";
import type { CalendarDay, BusinessService, BusinessTone } from "./schema";

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
};

function getNicheContext(niche: string): string {
  const key = niche.toLowerCase().trim();
  const exact = NICHE_TEMPLATES[key];
  if (exact) return exact;
  const partial = Object.keys(NICHE_TEMPLATES).find((k) => key.includes(k) || k.includes(key));
  return partial ? NICHE_TEMPLATES[partial] : "";
}

async function callOpenRouter(prompt: string, maxTokens: number): Promise<string> {
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

// JSON.parse with a clear error message that includes a snippet of the raw text,
// so failures (truncation, stray markdown) are diagnosable instead of opaque.
function parseJsonOrThrow(text: string, context: string): unknown {
  try {
    return JSON.parse(text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Failed to parse ${context} JSON (${msg}). Length=${text.length}. Tail: ${text.slice(-200)}`
    );
  }
}

const calendarDaySchema = z.object({
  day: z.number(),
  type: z.enum(["Reels", "Carrossel", "Story", "Feed"]),
  theme: z.string(),
  hook: z.string(),
  caption: z.string(),
  hashtags: z.array(z.string()),
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

Regras:
- Escolha o formato mais adequado para o dia (Reels, Carrossel, Story ou Feed)
- Post ESPECIFICO para o nicho, nunca generico
- Legenda em portugues brasileiro informal, sem cliches, NO MAXIMO 3 frases curtas
- Hashtags: EXATAMENTE de 6 a 8 — nunca menos que 6 — mix de genericas e de nicho
- Hook deve parar o scroll em 2 segundos${profileRules(profile)}

Retorne SOMENTE este JSON (sem markdown, sem texto adicional):
{"day":${day},"type":"Reels","theme":"tema especifico","hook":"primeira frase que para o scroll","caption":"legenda completa com CTA","hashtags":["#tag1","#tag2"]}`;

  const text = await callOpenRouter(prompt, 700);
  return calendarDaySchema.parse(parseJsonOrThrow(text, "single day")) as CalendarDay;
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

  const prompt = `Voce e um especialista em marketing de conteudo para Instagram no Brasil, com profundo conhecimento do segmento "${niche}".
${nicheContext ? `\nContexto do nicho: ${nicheContext}` : ""}${buildProfileBlock(profile)}
Crie um calendario de conteudo de 30 dias para ${monthName}/${year} para:
Negocio: ${businessName}
Nicho: ${niche}

Regras obrigatorias:
- Distribuicao EXATA dos formatos no mes: 12 Reels, 9 Carrossel, 6 Feed, 3 Story
- Datas comemorativas do mes: ${holidays} — crie posts tematicos para elas
- Cada post deve ser ESPECIFICO para o nicho - nunca generico
- Legendas em portugues brasileiro informal, sem cliches, NO MAXIMO 3 frases curtas (conte as frases antes de finalizar)
- Hashtags: EXATAMENTE de 6 a 8 por post — nunca menos que 6 — mix de genericas e de nicho
- Hook deve parar o scroll em 2 segundos${profileRules(profile)}

Retorne SOMENTE este JSON (sem markdown, sem texto adicional):
[{"day":1,"type":"Reels","theme":"tema especifico do post","hook":"primeira frase que para o scroll","caption":"legenda completa com CTA","hashtags":["#tag1","#tag2"]}]`;

  const text = await callOpenRouter(prompt, 8000);
  const parsed = parseJsonOrThrow(text, "calendar");
  return z.array(calendarDaySchema).parse(parsed) as CalendarDay[];
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
