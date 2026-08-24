import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Lead from "@/models/Lead";
import Subscription from "@/models/Subscription";

export const dynamic = "force-dynamic";

// GET /api/listings/[id]/insights — competitor & ROI insights for the listing owner
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const listing = await Listing.findById(params.id).lean();
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.ownerId && String(listing.ownerId) !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Not your listing" }, { status: 403 });
    }

    // Competitors in same index
    const competitors = await Listing.find({
      indexId: listing.indexId,
      _id: { $ne: listing._id },
    })
      .sort({ rankScore: -1 })
      .limit(5)
      .select("name rankScore trustScore visibilityScore subscriptionActive reviewCount")
      .lean();

    const myRank = await Listing.countDocuments({
      indexId: listing.indexId,
      rankScore: { $gt: listing.rankScore },
    }) + 1;

    const totalInIndex = await Listing.countDocuments({ indexId: listing.indexId });

    // Lead ROI
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentLeads = await Lead.countDocuments({
      listingId: listing._id,
      createdAt: { $gte: thirtyDaysAgo },
    });
    const totalLeads = await Lead.countDocuments({ listingId: listing._id });

    // Subscription spend
    const totalSubSpend = await Subscription.aggregate([
      { $match: { listingId: listing._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalSpent = (totalSubSpend[0]?.total || 0) + (listing.recentLeadSpend || 0);
    const costPerLead = totalLeads > 0 ? (totalSpent / totalLeads).toFixed(2) : null;

    // Upsell signals
    const signals = [];
    if (!listing.subscriptionActive) {
      signals.push({
        type: "subscribe",
        message: `You're ranked #${myRank} of ${totalInIndex}. A Growth subscription (+30 visibility) could move you up.`,
        cta: "Boost visibility",
      });
    }
    if (listing.reviewCount < 5) {
      signals.push({
        type: "reviews",
        message: `You have ${listing.reviewCount} reviews. Listings with 5+ reviews rank significantly higher.`,
        cta: "Share your listing to collect reviews",
      });
    }
    if (competitors.length > 0 && competitors[0].rankScore > listing.rankScore) {
      const gap = competitors[0].rankScore - listing.rankScore;
      signals.push({
        type: "competitor",
        message: `"${competitors[0].name}" leads by ${gap} points. ${competitors[0].subscriptionActive ? "They have an active subscription." : "They rank on trust alone."}`,
        cta: competitors[0].subscriptionActive ? "Match their visibility" : "Overtake with a subscription",
      });
    }
    if ((listing.views || 0) > 10 && (listing.clicks || 0) === 0) {
      signals.push({
        type: "ctr",
        message: `${listing.views} people viewed your listing but 0 clicked contact. Add a description and WhatsApp number.`,
        cta: "Improve your listing",
      });
    }

    return NextResponse.json({
      myRank,
      totalInIndex,
      competitors,
      leads: { recent: recentLeads, total: totalLeads, costPerLead },
      totalSpent,
      signals,
    });
  } catch (error) {
    console.error("GET /api/listings/[id]/insights failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
