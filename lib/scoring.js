// Core scoring logic: Rank Score = Trust Score (earned) + Visibility Score (paid).
// Money can only ever move the Visibility half — it never touches Trust directly.
// See the design report, section 2, for why this split exists.

export function computeTrustScore({ avgRating = 0, reviewCount = 0, verified = false }) {
  const ratingPart = avgRating * 10; // 0-50 (0-5 stars)
  const volumePart = Math.min(reviewCount, 50) * 0.6; // up to 30
  const verifiedPart = verified ? 20 : 0; // earned via document check, not payment
  return Math.round(ratingPart + volumePart + verifiedPart);
}

export function computeVisibilityScore({
  subscriptionActive = false,
  subscriptionTier = 0, // 1-4
  recentLeadSpend = 0, // sum of lead cost in last 30 days
}) {
  const subPart = subscriptionActive ? subscriptionTier * 15 : 0; // up to 60
  const leadPart = Math.min(recentLeadSpend * 2, 60); // decayed/capped
  return Math.round(subPart + leadPart);
}

export function computeRankScore(trustScore, visibilityScore) {
  return trustScore + visibilityScore;
}

// Recomputes and persists all three scores on a listing document.
export async function recomputeListingScores(listing) {
  const now = new Date();
  const subscriptionActive =
    !!listing.subscriptionActive &&
    listing.subscriptionExpiresAt &&
    new Date(listing.subscriptionExpiresAt) > now;

  const trustScore = computeTrustScore({
    avgRating: listing.avgRating,
    reviewCount: listing.reviewCount,
    verified: listing.verified,
  });

  const visibilityScore = computeVisibilityScore({
    subscriptionActive,
    subscriptionTier: listing.subscriptionTier,
    recentLeadSpend: listing.recentLeadSpend,
  });

  listing.subscriptionActive = subscriptionActive;
  listing.trustScore = trustScore;
  listing.visibilityScore = visibilityScore;
  listing.rankScore = computeRankScore(trustScore, visibilityScore);

  await listing.save();
  return listing;
}
