import Stripe from "stripe";
import { requireStripeSecretKey, env } from "@/lib/env";

let cached: Stripe | null = null;

export function getStripe() {
  if (cached) return cached;
  requireStripeSecretKey();
  cached = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
  return cached;
}
