import { connectDB } from "@/lib/db";
import Index from "@/models/Index";
import Listing from "@/models/Listing";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  return {
    title: `Best ${decodeURIComponent(params.category)} businesses — GoSite`,
    description: `Top-ranked ${decodeURIComponent(params.category)} directories.`,
  };
}

export default async function CategoryPage({ params }) {
  const category = decodeURIComponent(params.category);
  await connectDB();

  const indexes = await Index.find({ category: new RegExp(`^${category}$`, "i") }).lean();
  if (indexes.length === 0) notFound();

  const indexIds = indexes.map((i) => i._id);
  const listings = await Listing.find({ indexId: { $in: indexIds } })
    .sort({ rankScore: -1 })
    .limit(50)
    .lean();

  return (
    <>
      <a href="/browse" className="back-link">← Browse all</a>
      <h1 className="display hero-title">Top {category} Businesses</h1>
      <p className="hero-sub">{indexes.length} indexes · {listings.length} listings across {[...new Set(indexes.map(i => i.city))].length} cities</p>

      <div className="index-grid" style={{ marginTop: 20 }}>
        {indexes.map((idx) => (
          <a key={idx._id} className="index-card" href={`/indexes/${idx.slug}`}>
            <div className="eyebrow">{idx.city}</div>
            <h3>{idx.name}</h3>
          </a>
        ))}
      </div>

      {listings.length > 0 && (
        <div className="leaderboard" style={{ marginTop: 28 }}>
          <h2 className="display" style={{ fontSize: "1.2rem", marginBottom: 12 }}>All Listings — Ranked</h2>
          {listings.map((l, i) => {
            const sponsored = l.subscriptionActive || l.recentLeadSpend > 0;
            return (
              <a key={l._id} href={`/listings/${l._id}`} className={`row ${i === 0 ? "leader" : ""}`}>
                <div className="tile">{i === 0 ? "👑" : i + 1}</div>
                <div>
                  <div className="name">{l.name}</div>
                  <div className="sub">
                    <span className={`badge ${sponsored ? "sponsored" : "organic"}`}>
                      {sponsored ? "Sponsored" : "Organic"}
                    </span>{" "}
                    · {l.reviewCount} review{l.reviewCount === 1 ? "" : "s"}
                    {l.avgRating > 0 ? ` · ${l.avgRating.toFixed(1)}★` : ""}
                  </div>
                </div>
                <div className="scores">
                  <div className="score-block">
                    <div className="label">Rank</div>
                    <div className="value" style={{ color: "var(--gold)" }}>{l.rankScore}</div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}
