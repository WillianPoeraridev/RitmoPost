import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (!userId) return NextResponse.json({ ok: true });

    if (session.mode === "payment") {
      // Tripwire R$47: libera Pro por ~1 mês (os "30 dias"). Sem assinatura —
      // quando expira, isProUser volta a false e vira o gancho pro R$297/mês.
      const expiresAt = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000);
      await db
        .update(user)
        .set({
          plan: "pro",
          planExpiresAt: expiresAt,
          stripeCustomerId: session.customer as string,
        })
        .where(eq(user.id, userId));
    } else {
      // Assinatura (a máquina): Pro contínuo, sem expiração enquanto ativa.
      await db
        .update(user)
        .set({
          plan: "pro",
          planExpiresAt: null,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        })
        .where(eq(user.id, userId));
    }
  }

  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.paused"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    await db
      .update(user)
      .set({ plan: "free" })
      .where(eq(user.stripeSubscriptionId, sub.id));
  }

  return NextResponse.json({ ok: true });
}
