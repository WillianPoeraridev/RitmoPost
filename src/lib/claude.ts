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

export async function generateCalendar(
  niche: string,
  businessName: string,
  month: number,
  year: number
): Promise<CalendarDay[]> {
  const monthName = MONTH_NAMES[month];

  const prompt = `Voce e um especialista em marketing de conteudo para Instagram no Brasil, com profundo conhecimento do segmento "${niche}".

Crie um calendario de conteudo de 30 dias para ${monthName}/${year} para:
Negocio: ${businessName}
Nicho: ${niche}

Regras obrigatorias:
- Varie os formatos: ~40% Reels, ~30% Carrossel, ~20% Feed, ~10% Story
- Identifique datas comemorativas do mes e crie posts tematicos para elas
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
