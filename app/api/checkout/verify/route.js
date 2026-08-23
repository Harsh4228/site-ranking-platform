import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Subscription from "@/models/Subscription";
import { recomputeListingScores } from "@/lib/scoring";
import { getStripe, TIER_CONFIG } from "@/lib/stripe";
import { checkRateLimit, getIpHash, normalizeText, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

const PERIOD_DAYS = 30;

// POST /api/checkout/verify — verify a completed Stripe session and activate the subscription
export async function POST(req) {
  const ipHash = getIpHash(req);
  const limit = checkRateLimit(`checkout:verify:${ipHash}`, { windowMs: 60 * 1000, limit: 10 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = await readJson(req);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const sessionId = normalizeText(parsed.body.sessionId, { maxLen: 200 });
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const meta = session.metadata || {};
    if (meta.type !== "subscription" || !meta.listingId || !meta.tier) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    await connectDB();

    const listing = await Listing.findById(meta.listingId);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const tier = Number(meta.tier);
    const tierInfo = TIER_CONFIG[tier];
    if (!tierInfo) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Skip if already activated by webhook
    if (
      listing.subscriptionActive &&
      listing.subscriptionTier === tier &&
      listing.subscriptionExpiresAt > new Date()
    ) {
      return NextResponse.json({ listing, alreadyActive: true });
    }

    const now = new Date();
    const periodEnd = new Date(now.getTime() + PERIOD_DAYS * 24 * 60 * 60 * 1000);

    await Subscription.create({
      listingId: listing._id,
      tier,
      amount: tierInfo.priceCents / 100,
      periodStart: now,
      periodEnd,
    });

    listing.subscriptionActive = true;
    listing.subscriptionTier = tier;
    listing.subscriptionExpiresAt = periodEnd;
    await recomputeListingScores(listing);

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("POST /api/checkout/verify failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
