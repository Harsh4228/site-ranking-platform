import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Subscription from "@/models/Subscription";
import { recomputeListingScores } from "@/lib/scoring";
import {
  checkRateLimit,
  getIpHash,
  isObjectId,
  normalizeInteger,
  normalizeText,
  readJson,
} from "@/lib/api";

export const dynamic = "force-dynamic";

// Tier pricing in demo currency units (replace with real Stripe prices later)
const TIER_PRICES = { 1: 5, 2: 15, 3: 30, 4: 50 };
const PERIOD_DAYS = 30;

// POST /api/subscriptions — purchase or upgrade a subscription (Path A pricing)
export async function POST(req) {
  const ipHash = getIpHash(req);
  const limit = checkRateLimit(`sub:create:${ipHash}`, { windowMs: 60 * 1000, limit: 5 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests, slow down" }, { status: 429 });
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

    const now = new Date();
    const periodStart = now;
    const periodEnd = new Date(now.getTime() + PERIOD_DAYS * 24 * 60 * 60 * 1000);
    const amount = TIER_PRICES[tier];

    // Record the subscription period
    await Subscription.create({
      listingId,
      tier,
      amount,
      periodStart,
      periodEnd,
    });

    // Activate on the listing
    listing.subscriptionActive = true;
    listing.subscriptionTier = tier;
    listing.subscriptionExpiresAt = periodEnd;
    await recomputeListingScores(listing);

    return NextResponse.json({
      listing,
      subscription: { tier, amount, periodStart, periodEnd },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/subscriptions failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
