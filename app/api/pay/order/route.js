import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { getRazorpay, TIER_CONFIG_INR } from "@/lib/razorpay";
import {
  checkRateLimit,
  getIpHash,
  isObjectId,
  normalizeInteger,
  normalizeText,
  readJson,
} from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/pay/order — create a Razorpay order for subscription
export async function POST(req) {
  const ipHash = getIpHash(req);
  const limit = checkRateLimit(`pay:order:${ipHash}`, { windowMs: 60 * 1000, limit: 10 });
  if (!limit.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const parsed = await readJson(req);
  if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: parsed.status });

  const listingId = normalizeText(parsed.body.listingId, { maxLen: 40 });
  const tier = normalizeInteger(parsed.body.tier, { fallback: 0, min: 1, max: 4 });

  if (!listingId || !isObjectId(listingId)) return NextResponse.json({ error: "Valid listingId required" }, { status: 400 });
  if (!tier) return NextResponse.json({ error: "tier must be 1-4" }, { status: 400 });

  try {
    await connectDB();
    const listing = await Listing.findById(listingId);
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    if (!process.env.RAZORPAY_KEY_ID) {
      return NextResponse.json({ error: "Razorpay not configured", fallback: true }, { status: 503 });
    }

    const tierInfo = TIER_CONFIG_INR[tier];
    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: tierInfo.pricePaise,
      currency: "INR",
      receipt: `sub_${listingId}_${tier}_${Date.now()}`,
      notes: { type: "subscription", listingId: String(listing._id), tier: String(tier) },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      listingName: listing.name,
      tierName: tierInfo.name,
    });
  } catch (error) {
    console.error("POST /api/pay/order failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
