import { connectDB } from "@/lib/db";
import Index from "@/models/Index";
import Listing from "@/models/Listing";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// Programmatic SEO: generates pages like /best/plumbing/mumbai
export async function generateMetadata({ params }) {
  const category = decodeURIComponent(params.category).replace(/-/g, " ");
  const city = decodeURIComponent(params.city).replace(/-/g, " ");
  return {
    title: `Best ${category} in ${city} (2026) — Ranked by Real Reviews | GoSite`,
    description: `Find the top rated ${category} services in ${city}. Ranked by trust score from real customer reviews. Compare prices, ratings, and contact via WhatsApp.`,
    openGraph: {
      title: `Best ${category} in ${city} — GoSite`,
      description: `Top rated ${category} in ${city}, ranked by verified reviews.`,
    },
  };
}

export default async function BestPage({ params }) {
  const categoryRaw = decodeURIComponent(params.category).replace(/-/g, " ");
  const cityRaw = decodeURIComponent(params.city).replace(/-/g, " ");

  await connectDB();

  const indexes = await Index.find({
    category: new RegExp(categoryRaw, "i"),
    city: new RegExp(cityRaw, "i"),
  }).lean();

  if (indexes.length === 0) {
    // Try broader match
    const allIndexes = await Index.find({
      $or: [
        { category: new RegExp(categoryRaw, "i") },
        { city: new RegExp(cityRaw, "i") },
      ],
    }).lean();

    if (allIndexes.length === 0) notFound();

    const indexIds = allIndexes.map((i) => i._id);
    const listings = await Listing.find({ indexId: { $in: indexIds } })
      .sort({ rankScore: -1 })
      .limit(20)
      .lean();

    return renderPage(categoryRaw, cityRaw, allIndexes, listings, false);
  }

  const indexIds = indexes.map((i) => i._id);
  const listings = await Listing.find({ indexId: { $in: indexIds } })
    .sort({ rankScore: -1 })
    .limit(20)
    .lean();

  return renderPage(categoryRaw, cityRaw, indexes, listings, true);
}

function renderPage(category, city, indexes, listings, exactMatch) {
  const title = `Best ${capitalize(category)} in ${capitalize(city)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    numberOfItems: listings.length,
    itemListElement: listings.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LocalBusiness",
        name: l.name,
        description: l.description,
        address: l.address,
        telephone: l.phone,
        aggregateRating: l.reviewCount > 0 ? {
          "@type": "AggregateRating",
          ratingValue: l.avgRating?.toFixed(1),
          reviewCount: l.reviewCount,
        } : undefined,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <a href="/browse" className="back-link">← Browse all directories</a>

      <h1 className="display hero-title">{title}</h1>
      <p className="hero-sub">
        {listings.length} businesses ranked by real customer reviews. Updated {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}.
        {!exactMatch && ` Showing related results.`}
      </p>

      {indexes.length > 0 && (
        <div className="index-grid" style={{ marginTop: 20 }}>
          {indexes.map((idx) => (
            <a key={idx._id} className="index-card" href={`/indexes/${idx.slug}`}>
              <div className="eyebrow">{idx.category} · {idx.city}</div>
              <h3>{idx.name}</h3>
            </a>
          ))}
        </div>
      )}

      <div className="leaderboard" style={{ marginTop: 28 }}>
        {listings.map((l, i) => {
          const sponsored = l.subscriptionActive || l.recentLeadSpend > 0;
          return (
            <a key={l._id} href={`/listings/${l._id}`} className={`row ${i === 0 ? "leader" : ""}`}>
              <div className="tile">{i === 0 ? "👑" : i + 1}</div>
              <div>
                <div className="name">
                  {l.name}
                  {l.verified && <span className="verified-seal" style={{ marginLeft: 6 }}>✓ Verified</span>}
                </div>
                <div className="sub">
                  <span className={`badge ${sponsored ? "sponsored" : "organic"}`}>
                    {sponsored ? "Sponsored" : "Organic"}
                  </span>
                  {" · "}{l.reviewCount} review{l.reviewCount !== 1 ? "s" : ""}
                  {l.avgRating > 0 ? ` · ${l.avgRating.toFixed(1)}★` : ""}
                  {l.address && ` · ${l.address}`}
                </div>
              </div>
              <div className="scores">
                <div className="score-block">
                  <div className="label">Trust</div>
                  <div className="value">{l.trustScore}</div>
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

      {listings.length === 0 && (
        <div className="panel" style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ color: "var(--ivory-dim)" }}>No {category} businesses listed in {city} yet.</p>
          <a href="/promote" className="l-btn-primary" style={{ display: "inline-block", marginTop: 12 }}>
            Be the first — list your business free
          </a>
        </div>
      )}

      <div className="panel" style={{ marginTop: 32, textAlign: "center" }}>
        <h3 className="display" style={{ fontSize: "1.1rem" }}>Are you a {category} business in {city}?</h3>
        <p style={{ color: "var(--ivory-dim)", marginTop: 8 }}>
          List your business for free and start getting WhatsApp leads from customers searching for {category} services.
        </p>
        <a href="/promote" className="l-btn-primary" style={{ display: "inline-block", marginTop: 12 }}>
          Get listed free →
        </a>
      </div>
    </>
  );
}

function capitalize(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
