import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Index from "@/models/Index";
import {
  checkRateLimit,
  getIpHash,
  normalizeInteger,
  normalizeText,
  readJson,
} from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/indexes — list all indexes
export async function GET() {
  try {
    await connectDB();
    const indexes = await Index.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ indexes });
  } catch (error) {
    console.error("GET /api/indexes failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/indexes — create a new index (spam-prevention fee is handled client-side/billing, not enforced here)
export async function POST(req) {
  const ipHash = getIpHash(req);
  const limit = checkRateLimit(`index:create:${ipHash}`, { windowMs: 60 * 1000, limit: 5 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests, slow down" }, { status: 429 });
  }

  const parsed = await readJson(req);
  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const name = normalizeText(parsed.body.name, { maxLen: 80 });
  const category = normalizeText(parsed.body.category, { maxLen: 60 });
  const city = normalizeText(parsed.body.city, { maxLen: 60 });
  const sizeLimit = normalizeInteger(parsed.body.sizeLimit, { fallback: 20, min: 1, max: 500 });

  if (!name || !category || !city) {
    return NextResponse.json({ error: "name, category, and city are required" }, { status: 400 });
  }

  try {
    await connectDB();

    const slug = `${name}-${city}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await Index.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "An index with this name/city already exists" }, { status: 409 });
    }

    const index = await Index.create({
      name,
      slug,
      category,
      city,
      sizeLimit,
    });

    return NextResponse.json({ index }, { status: 201 });
  } catch (error) {
    console.error("POST /api/indexes failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
