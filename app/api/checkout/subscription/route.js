import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { getStripe, TIER_CONFIG } from "@/lib/stripe";
import {
  checkRateLimit,
  getIpHash,
  isObjectId,
  normalizeInteger,
  normalizeText,
  readJson,
} from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/checkout/subscription — create a Stripe Checkout session for a subscription
export async function POST(req) {
  const ipHash = getIpHash(req);
  const limit = checkRateLimit(`checkout:sub:${ipHash}`, { windowMs: 60 * 1000, limit: 10 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = await readJson(req);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const listingId = normalizeText(parsed.body.listingId, { maxLen: 40 });
  const tier = normalizeInteger(parsed.body.tier, { fallback: 0, min: 1, max: 4 });

  if (!listingId || !isObjectId(listingId)) {
    return NextResponse.json({ error: "Valid listingId is required" }, { status: 400 });
  }
  if (!tier) {
    return NextResponse.json({ error: "tier must be between 1 and 4" }, { status: 400 });
  }

  try {
    await connectDB();

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // If Stripe keys aren't configured, tell the client to use the direct fallback
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe not configured — using demo mode", fallback: true },
        { status: 503 }
      );
    }

    const tierInfo = TIER_CONFIG[tier];
    const stripe = getStripe();
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: tierInfo.priceCents,
            product_data: {
              name: `${tierInfo.name} Visibility Boost — 30 days`,
              description: `+${tierInfo.boost} visibility points for "${listing.name}"`,
              tax_code: "txcd_10000000",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "subscription",
        listingId: String(listing._id),
        tier: String(tier),
      },
      success_url: `${origin}/listings/${listing._id}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/listings/${listing._id}?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("POST /api/checkout/subscription failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
