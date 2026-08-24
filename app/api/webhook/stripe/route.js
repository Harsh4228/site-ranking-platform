import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Subscription from "@/models/Subscription";
import Lead from "@/models/Lead";
import { recomputeListingScores } from "@/lib/scoring";
import { getStripe, TIER_CONFIG, LEAD_COST_CENTS } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// POST /api/webhook/stripe — handle Stripe webhook events
export async function POST(req) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {    const stripe = getStripe();    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata || {};

    try {
      await connectDB();

      if (meta.type === "subscription") {
        await handleSubscription(meta);
      } else if (meta.type === "lead") {
        await handleLead(meta);
      }
    } catch (error) {
      console.error("Webhook handler failed:", error);
      return NextResponse.json({ error: "Handler failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

async function handleSubscription(meta) {
  const listing = await Listing.findById(meta.listingId);
  if (!listing) return;

  const tier = Number(meta.tier);
  const tierInfo = TIER_CONFIG[tier];
  if (!tierInfo) return;

  const now = new Date();
  const periodEnd = new Date(now.getTime() + THIRTY_DAYS_MS);

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
}

async function handleLead(meta) {
  const listing = await Listing.findById(meta.listingId);
  if (!listing) return;

  await Lead.create({
    listingId: listing._id,
    cost: LEAD_COST_CENTS / 100,
    ipHash: meta.ipHash || "webhook",
    source: "whatsapp",
  });

  const since = new Date(Date.now() - THIRTY_DAYS_MS);
  const recentLeads = await Lead.find({ listingId: listing._id, createdAt: { $gte: since } });
  const recentLeadSpend = recentLeads.reduce((sum, l) => sum + l.cost, 0);

  listing.recentLeadSpend = recentLeadSpend;
  await recomputeListingScores(listing);
}
