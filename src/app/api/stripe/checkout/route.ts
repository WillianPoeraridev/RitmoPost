import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { z } from "zod";

// O plano (não o priceId) vem do cliente; o servidor resolve o price a partir
// de env — assim os IDs de preço não ficam expostos e ninguém forja o checkout.
// "entry" = tripwire R$47 (pagamento único, libera Pro por ~1 mês).
// "monthly"/"yearly" = assinatura recorrente (a máquina). Default mantém
// compatível chamadas antigas que não mandavam plano.
const bodySchema = z.object({
  plan: z.enum(["entry", "monthly", "yearly"]).default("monthly"),
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const plan = parsed.data.plan;
  const baseUrl = process.env.NEXT_PUBLIC_URL!;

  // Tripwire: pagamento único, não assinatura.
  if (plan === "entry") {
    const priceId = process.env.STRIPE_PRICE_ID_ENTRY;
    if (!priceId) {
      return NextResponse.json({ error: "price_not_configured" }, { status: 500 });
    }
    try {
      const checkoutSession = await getStripe().checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { userId: session.user.id, plan: "entry" },
        customer_email: session.user.email,
        success_url: `${baseUrl}/dashboard?entry=success`,
        cancel_url: `${baseUrl}/?canceled=true`,
      });
      return NextResponse.json({ url: checkoutSession.url });
    } catch (err) {
      const message = err instanceof Error ? err.message : "stripe_error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // Assinatura recorrente (a máquina). Fallback entre as duas nomenclaturas de
  // env pra não quebrar independente de como a Vercel está configurada.
  const priceId =
    plan === "yearly"
      ? process.env.STRIPE_PRICE_ID_YEARLY ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY
      : process.env.STRIPE_PRICE_ID_MONTHLY ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;

  if (!priceId) {
    return NextResponse.json({ error: "price_not_configured" }, { status: 500 });
  }

  try {
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: session.user.id, plan },
      customer_email: session.user.email,
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/dashboard?canceled=true`,
    });
    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "stripe_error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
