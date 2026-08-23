import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Index from "@/models/Index";
import Listing from "@/models/Listing";
import Lead from "@/models/Lead";
import Subscription from "@/models/Subscription";

export const dynamic = "force-dynamic";

// GET /api/admin/stats — platform-wide stats for admin dashboard
export async function GET(req) {
  const adminKey = req.headers.get("x-admin-key");
  if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalIndexes,
      totalListings,
      totalLeads,
      totalSubscriptions,
      recentLeads,
      recentSubscriptions,
      topListings,
      revenueByDay,
    ] = await Promise.all([
      Index.countDocuments(),
      Listing.countDocuments(),
      Lead.countDocuments(),
      Subscription.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Subscription.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Listing.find()
        .sort({ rankScore: -1 })
        .limit(10)
        .select("name rankScore trustScore visibilityScore views clicks reviewCount")
        .lean(),
      Lead.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$cost" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalLeadRevenue = await Lead.aggregate([
      { $group: { _id: null, total: { $sum: "$cost" } } },
    ]);
    const totalSubRevenue = await Subscription.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return NextResponse.json({
      overview: {
        totalIndexes,
        totalListings,
        totalLeads,
        totalSubscriptions,
        recentLeads,
        recentSubscriptions,
      },
      revenue: {
        totalLeadRevenue: totalLeadRevenue[0]?.total || 0,
        totalSubRevenue: totalSubRevenue[0]?.total || 0,
        totalRevenue: (totalLeadRevenue[0]?.total || 0) + (totalSubRevenue[0]?.total || 0),
        revenueByDay,
      },
      topListings,
    });
  } catch (error) {
    console.error("GET /api/admin/stats failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
