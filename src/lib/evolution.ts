import type { CalendarDay } from "./schema";
import { PILLAR_LABELS } from "./schema";

/**
 * Client mínimo da Evolution API (WhatsApp não-oficial via Baileys).
 * Roda numa VPS própria — ver "Arquitetura WhatsApp Delivery" no ROADMAP.md.
 */

export function isEvolutionConfigured(): boolean {
  return Boolean(
    process.env.EVOLUTION_API_URL &&
      process.env.EVOLUTION_API_KEY &&
      process.env.EVOLUTION_INSTANCE
  );
}

export async function sendWhatsAppText(number: string, text: string): Promise<void> {
  if (!isEvolutionConfigured()) {
    throw new Error("Evolution API não configurada (EVOLUTION_API_URL/KEY/INSTANCE)");
  }

  const url = `${process.env.EVOLUTION_API_URL!.replace(/\/$/, "")}/message/sendText/${process.env.EVOLUTION_INSTANCE}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.EVOLUTION_API_KEY!,
    },
    body: JSON.stringify({ number, text }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Evolution HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
}

/** Mensagem do post do dia — legenda pronta pra copiar e colar no Instagram. */
export function formatDailyPostMessage(
  businessName: string,
  day: CalendarDay
): string {
  const pillarTag = day.pillar ? ` · ${PILLAR_LABELS[day.pillar]}` : "";
  return [
    `☀️ Bom dia! Seu post de hoje no RitmoPost:`,
    ``,
    `📅 *Dia ${day.day} — ${day.type}${pillarTag}* (${businessName})`,
    `📌 ${day.theme}`,
    `🎣 ${day.hook}`,
    ``,
    `✍️ *Legenda pronta (é só copiar):*`,
    ``,
    `${day.caption}`,
    ``,
    `${day.hashtags.join(" ")}`,
    ...(day.story
      ? ["", `📲 *Story de hoje:* ${day.story}`]
      : []),
    ``,
    `Posta e bora manter o ritmo! 💜`,
  ].join("\n");
}

/** Valida número no formato internacional usado pela Evolution: 55 + DDD + número. */
export function isValidWhatsAppNumber(n: string): boolean {
  return /^55\d{10,11}$/.test(n);
}
