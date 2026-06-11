import Stripe from "stripe";

let _stripe: Stripe | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getStripe(): Stripe {
  if (!_stripe) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {} as any);
  }
  return _stripe;
}
