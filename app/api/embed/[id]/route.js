import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Index from "@/models/Index";
import { isObjectId } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/embed/[id] — returns listing badge data (JSON or SVG)
export async function GET(req, { params }) {
  const { id } = params;
  if (!isObjectId(id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    await connectDB();
    const listing = await Listing.findById(id).lean();
    if (!listing) {
      return new NextResponse("Not found", { status: 404 });
    }

    const index = await Index.findById(listing.indexId).lean();
    const rank = await Listing.countDocuments({
      indexId: listing.indexId,
      rankScore: { $gt: listing.rankScore },
    }) + 1;

    const url = req.nextUrl;
    const format = url.searchParams.get("format");

    if (format === "svg") {
      const label = listing.verified ? "✓ Verified" : `#${rank} Ranked`;
      const stars = listing.avgRating > 0 ? ` · ${listing.avgRating.toFixed(1)}★` : "";
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="64" viewBox="0 0 260 64">
  <rect width="260" height="64" rx="8" fill="#131F2E" stroke="#1E3348"/>
  <text x="12" y="22" fill="#D4A843" font-family="system-ui" font-size="11" font-weight="700">§ THE LEDGER</text>
  <text x="12" y="40" fill="#F3EFE3" font-family="system-ui" font-size="13" font-weight="600">${escXml(listing.name)}</text>
  <text x="12" y="55" fill="#8E8C82" font-family="system-ui" font-size="11">${label}${stars}${index ? ` · ${escXml(index.name)}` : ""}</text>
</svg>`;

      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Default: JSON
    return NextResponse.json(
      {
        listing: {
          id: listing._id,
          name: listing.name,
          rankScore: listing.rankScore,
          trustScore: listing.trustScore,
          avgRating: listing.avgRating,
          reviewCount: listing.reviewCount,
          verified: listing.verified,
          rank,
        },
        index: index ? { name: index.name, slug: index.slug } : null,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/embed/[id] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function escXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
