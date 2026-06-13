import { NextRequest, NextResponse } from "next/server";
import { generateCalendar, type ProfileContext } from "@/lib/claude";
import { z } from "zod";

// Generation can take ~30s; raise above the default function timeout.
export const maxDuration = 60;

// Campos de perfil opcionais: na demo de venda, cadastrar o perfil EXATO do
// prospect é o que dispara o WOW da personalização.
const bodySchema = z.object({
  niche: z.string().min(1).max(100),
  businessName: z.string().min(1).max(100),
  secret: z.string(),
  servicesText: z.string().max(500).optional(),
  tone: z.enum(["descontraido", "profissional", "premium"]).optional(),
  differentials: z.string().max(500).optional(),
  city: z.string().max(80).optional(),
  neighborhood: z.string().max(80).optional(),
  recurringPromos: z.string().max(300).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { niche, businessName, secret } = parsed.data;

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { servicesText, tone, differentials, city, neighborhood, recurringPromos } =
    parsed.data;

  // "Corte R$35, Combo corte+barba R$50" → um serviço por vírgula (preço fica no nome).
  const services = servicesText
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ name }));

  const hasProfileData =
    Boolean(services?.length) || tone || differentials || city || neighborhood || recurringPromos;

  const profileContext: ProfileContext | undefined = hasProfileData
    ? { services, tone, differentials, city, neighborhood, recurringPromos }
    : undefined;

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  try {
    const days = await generateCalendar(niche, businessName, month, year, profileContext);
    return NextResponse.json({ days, month, year });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[admin/generate] failed:", detail);
    return NextResponse.json({ error: "generation_failed", detail }, { status: 500 });
  }
}
