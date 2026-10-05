import Stripe from "stripe";

let stripe: Stripe | undefined;

export function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("STRIPE_SECRET_KEY is not configured");
  stripe ??= new Stripe(secret);
  return stripe;
}