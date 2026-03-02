import Stripe from "stripe";
import { requireStripeSecretKey, env } from "@/lib/env";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  throw new Error("Stripe API is disabled");
}
