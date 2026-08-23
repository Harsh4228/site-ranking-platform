import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Lead from "@/models/Lead";
import { recomputeListingScores } from "@/lib/scoring";
import {
  checkRateLimit,
  getIpHash,
  isObjectId,
  normalizeNumber,
  normalizeText,
  readJson,
} from "@/lib/api";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
export const dynamic = "force-dynamic";

const LEAD_COST = normalizeNumber(process.env.LEAD_COST_DEFAULT, {
  fallback: 2,
  min: 0,
  max: 10000,
});

// POST /api/leads — logs a paid "Contact via WhatsApp" click (Path B pricing)
// and rolls up the last 30 days of lead spend into the Visibility Score.
export async function POST(req) {
  const ipHash = getIpHash(req);
  const limit = checkRateLimit(`lead:create:${ipHash}`, { windowMs: 60 * 1000, limit: 20 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests, slow down" }, { status: 429 });
  }

  const parsed = await readJson(req);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const listingId = normalizeText(parsed.body.listingId, { maxLen: 40 });
  if (!listingId || !isObjectId(listingId)) {
    return NextResponse.json({ error: "Valid listingId is required" }, { status: 400 });
  }

  try {
    await connectDB();

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Keep billing server-owned: clients cannot set lead cost.
    await Lead.create({ listingId, cost: LEAD_COST, ipHash, source: "whatsapp" });

    const since = new Date(Date.now() - THIRTY_DAYS_MS);
    const recentLeads = await Lead.find({ listingId, createdAt: { $gte: since } });
    const recentLeadSpend = recentLeads.reduce((sum, l) => sum + l.cost, 0);

    listing.recentLeadSpend = recentLeadSpend;
    listing.clicks = (listing.clicks || 0) + 1;
    await recomputeListingScores(listing);

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
