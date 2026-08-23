import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Index from "@/models/Index";
import { recomputeListingScores } from "@/lib/scoring";
import {
  checkRateLimit,
  getIpHash,
  isObjectId,
  normalizeText,
  readJson,
} from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/listings — a business joins an index (free by default)
export async function POST(req) {
  const ipHash = getIpHash(req);
  const limit = checkRateLimit(`listing:create:${ipHash}`, { windowMs: 60 * 1000, limit: 10 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests, slow down" }, { status: 429 });
  }

  const parsed = await readJson(req);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const indexId = normalizeText(parsed.body.indexId, { maxLen: 40 });
  const name = normalizeText(parsed.body.name, { maxLen: 100 });
  const description = normalizeText(parsed.body.description, { maxLen: 500, fallback: "" });
  const phone = normalizeText(parsed.body.phone, { maxLen: 30, fallback: "" });
  const whatsapp = normalizeText(parsed.body.whatsapp, { maxLen: 30, fallback: "" });
  const email = normalizeText(parsed.body.email, { maxLen: 120, fallback: "" });
  const website = normalizeText(parsed.body.website, { maxLen: 180, fallback: "" });
  const address = normalizeText(parsed.body.address, { maxLen: 200, fallback: "" });
  const hours = normalizeText(parsed.body.hours, { maxLen: 100, fallback: "" });

  if (!indexId || !name) {
    return NextResponse.json({ error: "indexId and name are required" }, { status: 400 });
  }
  if (!isObjectId(indexId)) {
    return NextResponse.json({ error: "Invalid indexId" }, { status: 400 });
  }

  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    const index = await Index.findById(indexId);
    if (!index) {
      return NextResponse.json({ error: "Index not found" }, { status: 404 });
    }

    const currentCount = await Listing.countDocuments({ indexId });
    if (currentCount >= index.sizeLimit) {
      return NextResponse.json({ error: "This index is full" }, { status: 409 });
    }

    const listing = await Listing.create({
      indexId,
      ownerId: session?.user?.id || null,
      name,
      description,
      phone,
      whatsapp,
      email,
      website,
      address,
      hours,
    });

    await recomputeListingScores(listing);

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("POST /api/listings failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
