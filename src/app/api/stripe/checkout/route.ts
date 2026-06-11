import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { z } from "zod";

const bodySchema = z.object({
  priceId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL!;

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: parsed.data.priceId, quantity: 1 }],
    metadata: { userId: session.user.id },
    customer_email: session.user.email,
    success_url: `${baseUrl}/dashboard?success=true`,
    cancel_url: `${baseUrl}/dashboard?canceled=true`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
