// Subscription lifecycle: expires subscriptions, computes rank snapshots.
// Run as: node scripts/cron.mjs  (schedule via cron/Vercel cron/Railway cron)

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("Missing MONGODB_URI"); process.exit(1); }

// Inline schemas to avoid ESM import issues with the app's models
const ListingSchema = new mongoose.Schema({
  indexId: mongoose.Schema.Types.ObjectId,
  name: String, ownerId: mongoose.Schema.Types.ObjectId,
  verified: Boolean, avgRating: Number, reviewCount: Number,
  subscriptionActive: Boolean, subscriptionTier: Number,
  subscriptionExpiresAt: Date, recentLeadSpend: Number,
  trustScore: Number, visibilityScore: Number, rankScore: Number,
  views: Number, clicks: Number,
}, { timestamps: true });

const RankHistorySchema = new mongoose.Schema({
  listingId: mongoose.Schema.Types.ObjectId,
  rankScore: Number, trustScore: Number, visibilityScore: Number,
  position: Number, views: Number, clicks: Number,
}, { timestamps: true });

const LeadSchema = new mongoose.Schema({
  listingId: mongoose.Schema.Types.ObjectId,
  cost: Number, ipHash: String, source: String,
}, { timestamps: true });

const Listing = mongoose.models.Listing || mongoose.model("Listing", ListingSchema);
const RankHistory = mongoose.models.RankHistory || mongoose.model("RankHistory", RankHistorySchema);
const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);

function computeTrust({ avgRating = 0, reviewCount = 0, verified = false }) {
  return Math.round(avgRating * 10 + Math.min(reviewCount, 50) * 0.6 + (verified ? 20 : 0));
}
function computeVisibility({ subscriptionActive, subscriptionTier = 0, recentLeadSpend = 0 }) {
  return Math.round((subscriptionActive ? subscriptionTier * 15 : 0) + Math.min(recentLeadSpend * 2, 60));
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 1. Expire subscriptions past their end date
  const expired = await Listing.find({
    subscriptionActive: true,
    subscriptionExpiresAt: { $lte: now },
  });

  let expiredCount = 0;
  for (const listing of expired) {
    listing.subscriptionActive = false;
    listing.subscriptionTier = 0;

    // Recompute scores
    const trust = computeTrust(listing);
    const recentLeads = await Lead.find({ listingId: listing._id, createdAt: { $gte: thirtyDaysAgo } });
    const recentLeadSpend = recentLeads.reduce((s, l) => s + l.cost, 0);
    listing.recentLeadSpend = recentLeadSpend;
    const vis = computeVisibility({ subscriptionActive: false, subscriptionTier: 0, recentLeadSpend });
    listing.trustScore = trust;
    listing.visibilityScore = vis;
    listing.rankScore = trust + vis;
    await listing.save();
    expiredCount++;
  }
  console.log(`Expired ${expiredCount} subscriptions.`);

  // 2. Recompute lead spend for all active listings (30-day decay)
  const allListings = await Listing.find();
  for (const listing of allListings) {
    const recentLeads = await Lead.find({ listingId: listing._id, createdAt: { $gte: thirtyDaysAgo } });
    const spend = recentLeads.reduce((s, l) => s + l.cost, 0);
    if (spend !== listing.recentLeadSpend) {
      listing.recentLeadSpend = spend;
      const subActive = listing.subscriptionActive && listing.subscriptionExpiresAt > now;
      const trust = computeTrust(listing);
      const vis = computeVisibility({ subscriptionActive: subActive, subscriptionTier: listing.subscriptionTier, recentLeadSpend: spend });
      listing.trustScore = trust;
      listing.visibilityScore = vis;
      listing.rankScore = trust + vis;
      await listing.save();
    }
  }

  // 3. Snapshot rank history (one per listing per day)
  const indexes = await mongoose.connection.db.collection("indexes").find().toArray();
  for (const index of indexes) {
    const listings = await Listing.find({ indexId: index._id }).sort({ rankScore: -1 });
    for (let i = 0; i < listings.length; i++) {
      const l = listings[i];
      await RankHistory.create({
        listingId: l._id,
        rankScore: l.rankScore,
        trustScore: l.trustScore,
        visibilityScore: l.visibilityScore,
        position: i + 1,
        views: l.views || 0,
        clicks: l.clicks || 0,
      });
    }
  }
  console.log(`Snapshotted rank history for ${allListings.length} listings.`);

  await mongoose.disconnect();
  console.log("Cron complete.");
}

run().catch((err) => { console.error(err); process.exit(1); });
