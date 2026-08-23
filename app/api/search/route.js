import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Index from "@/models/Index";
import Listing from "@/models/Listing";
import { normalizeText } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/search?q=plumber — search indexes and listings
export async function GET(req) {
  const q = normalizeText(req.nextUrl.searchParams.get("q"), { maxLen: 100 });
  if (!q || q.length < 2) {
    return NextResponse.json({ indexes: [], listings: [] });
  }

  try {
    await connectDB();
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const [indexes, listings] = await Promise.all([
      Index.find({ $or: [{ name: regex }, { category: regex }, { city: regex }] })
        .limit(10)
        .lean(),
      Listing.find({ $or: [{ name: regex }, { description: regex }] })
        .sort({ rankScore: -1 })
        .limit(15)
        .lean(),
    ]);

    return NextResponse.json({ indexes, listings });
  } catch (error) {
    console.error("GET /api/search failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
