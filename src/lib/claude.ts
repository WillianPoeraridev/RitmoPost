import { z } from "zod";
import type { CalendarDay } from "./schema";

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
  day: number
): Promise<CalendarDay> {
  const monthName = MONTH_NAMES[month];

  const prompt = `Voce e um especialista em marketing de conteudo para Instagram no Brasil, nicho "${niche}".

Crie 1 post para o Dia ${day} de ${monthName}/${year} para:
Negocio: ${businessName}
Nicho: ${niche}

Regras:
- Escolha o formato mais adequado para o dia (Reels, Carrossel, Story ou Feed)
- Post ESPECIFICO para o nicho, nunca generico
- Legenda em portugues brasileiro informal, sem cliches, maximo 3 frases
- Hashtags: 6-8, mix de genericas e de nicho
- Hook deve parar o scroll em 2 segundos

Retorne SOMENTE este JSON (sem markdown, sem texto adicional):
{"day":${day},"type":"Reels","theme":"tema especifico","hook":"primeira frase que para o scroll","caption":"legenda completa com CTA","hashtags":["#tag1","#tag2"]}`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "anthropic/claude-haiku-4-5",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);

  const data = await res.json();
  const text = (data.choices[0].message.content as string).trim();
  const jsonText = text.startsWith("```")
    ? text.replace(/```(?:json)?\n?/g, "").trim()
    : text;

  return calendarDaySchema.parse(JSON.parse(jsonText)) as CalendarDay;
}

export async function generateCalendar(
  niche: string,
  businessName: string,
  month: number,
  year: number
): Promise<CalendarDay[]> {
  const monthName = MONTH_NAMES[month];

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

  const holidays = HOLIDAYS[month]?.join(", ") ?? "nenhuma data comemorativa relevante";

  const prompt = `Voce e um especialista em marketing de conteudo para Instagram no Brasil, com profundo conhecimento do segmento "${niche}".

Crie um calendario de conteudo de 30 dias para ${monthName}/${year} para:
Negocio: ${businessName}
Nicho: ${niche}

Regras obrigatorias:
- Varie os formatos: ~40% Reels, ~30% Carrossel, ~20% Feed, ~10% Story
- Datas comemorativas do mes: ${holidays} — crie posts tematicos para elas
- Cada post deve ser ESPECIFICO para o nicho - nunca generico
- Legendas em portugues brasileiro informal, sem cliches, maximo 3 frases
- Hashtags: 6-8 por post, mix de genericas e de nicho
- Hook deve parar o scroll em 2 segundos

Retorne SOMENTE este JSON (sem markdown, sem texto adicional):
[{"day":1,"type":"Reels","theme":"tema especifico do post","hook":"primeira frase que para o scroll","caption":"legenda completa com CTA","hashtags":["#tag1","#tag2"]}]`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "anthropic/claude-haiku-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);

  const data = await res.json();
  const text = (data.choices[0].message.content as string).trim();
  const jsonText = text.startsWith("```")
    ? text.replace(/```(?:json)?\n?/g, "").trim()
    : text;

  const parsed = JSON.parse(jsonText);
  return z.array(calendarDaySchema).parse(parsed) as CalendarDay[];
}
