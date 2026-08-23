import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

let _stripe;

export function getStripe() {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY in environment");
  }
  if (!_stripe) {
    _stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-03-31.basil" });
  }
  return _stripe;
}

// Tier pricing in cents (USD)
export const TIER_CONFIG = {
  1: { name: "Starter", priceCents: 500, boost: 15 },
  2: { name: "Growth", priceCents: 1500, boost: 30 },
  3: { name: "Pro", priceCents: 3000, boost: 45 },
  4: { name: "Leader", priceCents: 5000, boost: 60 },
};

export const LEAD_COST_CENTS = Number(process.env.LEAD_COST_CENTS || "200");
