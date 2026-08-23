import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Index from "@/models/Index";
import Listing from "@/models/Listing";
import { normalizeText } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/indexes/[slug] — the leaderboard for one index, ranked by rankScore
export async function GET(req, { params }) {
  const slug = normalizeText(params.slug, { maxLen: 120 });

  try {
    await connectDB();
    const index = await Index.findOne({ slug }).lean();
    if (!index) {
      return NextResponse.json({ error: "Index not found" }, { status: 404 });
    }

    const listings = await Listing.find({ indexId: index._id })
      .sort({ rankScore: -1 })
      .lean();

    // Attach rank position + sponsored flag without ever letting payment override the sort order
    const ranked = listings.map((listing, i) => ({
      ...listing,
      position: i + 1,
      sponsored: listing.subscriptionActive || listing.recentLeadSpend > 0,
    }));

    return NextResponse.json({ index, listings: ranked });
  } catch (error) {
    console.error("GET /api/indexes/[slug] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
