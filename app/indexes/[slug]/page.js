import { connectDB } from "@/lib/db";
import Index from "@/models/Index";
import Listing from "@/models/Listing";
import { notFound } from "next/navigation";
import NewListingForm from "./NewListingForm";
import ChatPanel from "./ChatPanel";

export const dynamic = "force-dynamic";

export default async function IndexPage({ params }) {
  await connectDB();
  const index = await Index.findOne({ slug: params.slug }).lean();
  if (!index) notFound();

  const listings = await Listing.find({ indexId: index._id })
    .sort({ rankScore: -1 })
    .lean();

  const totalReviews = listings.reduce((s, l) => s + l.reviewCount, 0);

  return (
    <>
      <a href="/" className="back-link">← All indexes</a>

      <div className="index-hero">
        <div className="eyebrow">{index.category} · {index.city}</div>
        <h1 className="display" style={{ fontSize: "2rem", marginTop: 6 }}>{index.name}</h1>
        <div className="index-stats">
          <span>{listings.length} listing{listings.length !== 1 ? "s" : ""}</span>
          <span className="stat-dot">·</span>
          <span>{totalReviews} review{totalReviews !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="leaderboard">
        {listings.length === 0 && (
          <p style={{ color: "var(--ivory-dim)" }}>No listings yet — be the first to join, free.</p>
        )}
        {listings.map((l, i) => {
          const sponsored = l.subscriptionActive || l.recentLeadSpend > 0;
          return (
            <a
              key={l._id}
              href={`/listings/${l._id}`}
              className={`row ${i === 0 ? "leader" : ""}`}
            >
              <div className="tile">{i === 0 ? "👑" : i + 1}</div>
              <div>
                <div className="name">
                  {l.name}{" "}
                  {l.verified && <span className="verified-seal">✓ Verified</span>}
                </div>
                <div className="sub">
                  <span className={`badge ${sponsored ? "sponsored" : "organic"}`}>
                    {sponsored ? "Sponsored" : "Organic"}
                  </span>{" "}
                  · {l.reviewCount} review{l.reviewCount === 1 ? "" : "s"}
                  {l.reviewCount > 0 ? ` · ${l.avgRating.toFixed(1)}★` : ""}
                </div>
              </div>
              <div className="scores">
                <div className="score-block">
                  <div className="label">Trust</div>
                  <div className="value">{l.trustScore}</div>
                </div>
                <div className="score-block">
                  <div className="label">Visibility</div>
                  <div className="value">{l.visibilityScore}</div>
                </div>
                <div className="score-block">
                  <div className="label">Rank</div>
                  <div className="value" style={{ color: "var(--gold)" }}>{l.rankScore}</div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <div className="index-bottom-grid">
        <NewListingForm indexId={index._id.toString()} />
        <ChatPanel slug={index.slug} />
      </div>
    </>
  );
}
