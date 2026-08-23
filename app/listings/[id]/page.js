import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Index from "@/models/Index";
import Review from "@/models/Review";
import { notFound } from "next/navigation";
import ListingActions from "./ListingActions";
import SubscriptionPanel from "./SubscriptionPanel";
import ClaimButton from "./ClaimButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  await connectDB();
  const listing = await Listing.findById(params.id).select("name description").lean();
  if (!listing) return { title: "Not Found" };
  return {
    title: `${listing.name} — GoSite`,
    description: listing.description || `View ${listing.name}'s rank, reviews, and visibility score.`,
  };
}

export default async function ListingPage({ params }) {
  await connectDB();
  const listing = await Listing.findById(params.id).lean();
  if (!listing) notFound();

  // Track page view (fire-and-forget)
  Listing.updateOne({ _id: listing._id }, { $inc: { views: 1 } }).exec();

  const index = await Index.findById(listing.indexId).lean();
  const reviews = await Review.find({ listingId: listing._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const sponsored = listing.subscriptionActive || listing.recentLeadSpend > 0;

  return (
    <>
      {index && (
        <a href={`/indexes/${index.slug}`} className="back-link">
          ← {index.name}
        </a>
      )}

      <div className="listing-hero">
        <h1 className="display" style={{ fontSize: "2rem" }}>
          {listing.name}
        </h1>
        <div className="listing-badges">
          {listing.verified && <span className="verified-seal">✓ Verified</span>}
          <span className={`badge ${sponsored ? "sponsored" : "organic"}`}>
            {sponsored ? "Sponsored" : "Organic"}
          </span>
        </div>
        {listing.description && (
          <p className="listing-desc">{listing.description}</p>
        )}

        <div className="listing-info">
          {listing.address && <div className="listing-info-row">📍 {listing.address}</div>}
          {listing.hours && <div className="listing-info-row">🕐 {listing.hours}</div>}
          {listing.phone && <div className="listing-info-row">📞 {listing.phone}</div>}
          {listing.email && <div className="listing-info-row">✉️ {listing.email}</div>}
          {listing.website && <div className="listing-info-row">🌐 <a href={listing.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)" }}>{listing.website}</a></div>}
        </div>
      </div>

      <div className="scores-grid">
        <div className="score-card">
          <div className="score-card-label">Trust Score</div>
          <div className="score-card-value">{listing.trustScore}</div>
          <div className="score-card-detail">
            {listing.reviewCount} review{listing.reviewCount !== 1 ? "s" : ""}
            {listing.reviewCount > 0 ? ` · ${listing.avgRating.toFixed(1)}★` : ""}
          </div>
        </div>
        <div className="score-card">
          <div className="score-card-label">Visibility Score</div>
          <div className="score-card-value">{listing.visibilityScore}</div>
          <div className="score-card-detail">
            {listing.subscriptionActive ? `Tier ${listing.subscriptionTier}` : "No subscription"}
          </div>
        </div>
        <div className="score-card score-card-rank">
          <div className="score-card-label">Rank Score</div>
          <div className="score-card-value">{listing.rankScore}</div>
          <div className="score-card-detail">Trust + Visibility</div>
        </div>
      </div>

      <div className="analytics-bar">
        <span>👁 {listing.views || 0} views</span>
        <span className="stat-dot">·</span>
        <span>🖱 {listing.clicks || 0} clicks</span>
        <span className="stat-dot">·</span>
        <span>⭐ {listing.reviewCount} reviews</span>
      </div>

      <ClaimButton listingId={listing._id.toString()} ownerId={listing.ownerId?.toString() || null} />

      <ListingActions listing={JSON.parse(JSON.stringify(listing))} />

      <SubscriptionPanel listing={JSON.parse(JSON.stringify(listing))} />

      <div className="embed-section">
        <h3 className="display" style={{ fontSize: "1.1rem" }}>📋 Embed Badge on Your Website</h3>
        <p className="embed-desc">
          Add this badge to your site to show your rank and build trust with visitors.
        </p>
        <div className="embed-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/embed/${listing._id}?format=svg`} alt="Ledger badge" width={260} height={64} />
        </div>
        <div className="embed-code">
          <code>{`<a href="/listings/${listing._id}"><img src="/api/embed/${listing._id}?format=svg" alt="Ranked on The Ledger" width="260" height="64" /></a>`}</code>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="reviews-section">
          <h3 className="display" style={{ fontSize: "1.1rem", marginBottom: 12 }}>
            Recent Reviews
          </h3>
          {reviews.map((r) => (
            <div key={r._id} className="review-card">
              <div className="review-rating">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
              {r.comment && <div className="review-comment">{r.comment}</div>}
              <div className="review-date">
                {new Date(r.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
