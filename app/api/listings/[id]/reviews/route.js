import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Review from "@/models/Review";
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

// POST /api/listings/[id]/reviews — a review is Trust Score input, never Visibility.
// This route never touches payment fields — reviews cannot be bought.
export async function POST(req, { params }) {
  const ipHash = getIpHash(req);
  const limit = checkRateLimit(`review:create:${ipHash}`, { windowMs: 60 * 1000, limit: 5 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests, slow down" }, { status: 429 });
  }

  const listingId = normalizeText(params.id, { maxLen: 40 });
  if (!isObjectId(listingId)) {
    return NextResponse.json({ error: "Invalid listing id" }, { status: 400 });
  }

  const parsed = await readJson(req);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const rating = normalizeInteger(parsed.body.rating, { fallback: 0, min: 1, max: 5 });
  const comment = normalizeText(parsed.body.comment, { maxLen: 500, fallback: "" });

  if (!rating) {
    return NextResponse.json({ error: "rating must be between 1 and 5" }, { status: 400 });
  }

  try {
    await connectDB();

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const existing = await Review.findOne({ listingId, ipHash });
    if (existing) {
      return NextResponse.json(
        { error: "Only one review per listing is allowed from the same visitor" },
        { status: 409 }
      );
    }

    await Review.create({ listingId, rating, comment, ipHash });

    const allReviews = await Review.find({ listingId });
    const reviewCount = allReviews.length;
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

    listing.reviewCount = reviewCount;
    listing.avgRating = avgRating;
    await recomputeListingScores(listing);

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("POST /api/listings/[id]/reviews failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
