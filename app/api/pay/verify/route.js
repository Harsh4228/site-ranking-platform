import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Subscription from "@/models/Subscription";
import { recomputeListingScores } from "@/lib/scoring";
import { readJson, normalizeText, isObjectId, normalizeInteger } from "@/lib/api";

export const dynamic = "force-dynamic";

const PERIOD_DAYS = 30;

// POST /api/pay/verify — verify Razorpay payment and activate subscription
export async function POST(req) {
  const parsed = await readJson(req);
  if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: parsed.status });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, listingId, tier } = parsed.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
  }
  if (!listingId || !isObjectId(listingId)) {
    return NextResponse.json({ error: "Invalid listingId" }, { status: 400 });
  }

  // Verify signature
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ error: "Payment not configured" }, { status: 500 });

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  try {
    await connectDB();
    const listing = await Listing.findById(listingId);
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const tierNum = normalizeInteger(tier, { fallback: 1, min: 1, max: 4 });
    const now = new Date();
    const periodEnd = new Date(now.getTime() + PERIOD_DAYS * 24 * 60 * 60 * 1000);

    const { TIER_CONFIG_INR } = await import("@/lib/razorpay");
    const tierInfo = TIER_CONFIG_INR[tierNum];

    await Subscription.create({
      listingId: listing._id,
      tier: tierNum,
      amount: tierInfo.pricePaise / 100,
      periodStart: now,
      periodEnd,
    });

    listing.subscriptionActive = true;
    listing.subscriptionTier = tierNum;
    listing.subscriptionExpiresAt = periodEnd;
    await recomputeListingScores(listing);

    return NextResponse.json({ listing, success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/pay/verify failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
