import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Referral from "@/models/Referral";
import Listing from "@/models/Listing";
import Subscription from "@/models/Subscription";
import { recomputeListingScores } from "@/lib/scoring";
import { isObjectId } from "@/lib/api";

export const dynamic = "force-dynamic";

const REWARD_REFERRALS_NEEDED = 3;
const REWARD_DAYS = 7;

// GET /api/referral — get referral stats for current user
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();

    const referrals = await Referral.find({ referrerId: session.user.id })
      .populate("referredUserId", "name email")
      .lean();

    const totalReferred = referrals.length;
    const rewardsEarned = referrals.filter((r) => r.rewardGranted).length;
    const nextRewardAt = REWARD_REFERRALS_NEEDED - (totalReferred % REWARD_REFERRALS_NEEDED);

    // Generate referral link
    const origin = process.env.NEXTAUTH_URL || req.headers.get("origin") || "https://gosite.lol";
    const referralLink = `${origin}/auth/signin?ref=${session.user.id}`;

    return NextResponse.json({
      referralLink,
      totalReferred,
      rewardsEarned,
      nextRewardAt,
      referrals: referrals.map((r) => ({
        name: r.referredUserId?.name || "Unknown",
        date: r.createdAt,
        rewardGranted: r.rewardGranted,
      })),
    });
  } catch (error) {
    console.error("GET /api/referral failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/referral — record a referral (called during registration)
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { referrerId, referredUserId } = body;

    if (!referrerId || !referredUserId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    if (referrerId === referredUserId) return NextResponse.json({ error: "Can't refer yourself" }, { status: 400 });
    if (!isObjectId(referrerId) || !isObjectId(referredUserId)) return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });

    const existing = await Referral.findOne({ referredUserId });
    if (existing) return NextResponse.json({ ok: true, alreadyRecorded: true });

    await Referral.create({ referrerId, referredUserId });

    // Check if referrer hit the threshold for a reward
    const count = await Referral.countDocuments({ referrerId, rewardGranted: false });
    if (count >= REWARD_REFERRALS_NEEDED) {
      // Grant free 7-day Tier 1 subscription to referrer's first listing
      const listing = await Listing.findOne({ ownerId: referrerId });
      if (listing) {
        const now = new Date();
        const periodEnd = new Date(now.getTime() + REWARD_DAYS * 24 * 60 * 60 * 1000);

        await Subscription.create({
          listingId: listing._id,
          tier: 1,
          amount: 0,
          periodStart: now,
          periodEnd,
        });

        listing.subscriptionActive = true;
        listing.subscriptionTier = Math.max(listing.subscriptionTier, 1);
        listing.subscriptionExpiresAt = periodEnd;
        await recomputeListingScores(listing);

        // Mark the batch as rewarded
        await Referral.updateMany(
          { referrerId, rewardGranted: false },
          { $set: { rewardGranted: true } },
          { limit: REWARD_REFERRALS_NEEDED }
        );
      }
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/referral failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
