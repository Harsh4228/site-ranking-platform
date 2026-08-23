import { connectDB } from "@/lib/db";
import Index from "@/models/Index";
import Listing from "@/models/Listing";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: "Browse Directories — The Ledger",
    description: "Browse ranked business directories by city and category.",
  };
}

export default async function BrowsePage() {
  await connectDB();

  const [cities, categories, totalListings] = await Promise.all([
    Index.aggregate([
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]),
    Index.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]),
    Listing.countDocuments(),
  ]);

  return (
    <>
      <h1 className="display hero-title">Browse Directories</h1>
      <p className="hero-sub">
        {totalListings} businesses ranked across {cities.length} cities and {categories.length} categories.
      </p>

      <div className="browse-section">
        <h2 className="display" style={{ fontSize: "1.2rem", marginBottom: 16 }}>By City</h2>
        <div className="browse-tags">
          {cities.map((c) => (
            <a key={c._id} href={`/browse/city/${encodeURIComponent(c._id)}`} className="browse-tag">
              {c._id} <span className="browse-tag-count">{c.count}</span>
            </a>
          ))}
          {cities.length === 0 && (
            <p style={{ color: "var(--ivory-dim)" }}>No cities yet.</p>
          )}
        </div>
      </div>

      <div className="browse-section">
        <h2 className="display" style={{ fontSize: "1.2rem", marginBottom: 16 }}>By Category</h2>
        <div className="browse-tags">
          {categories.map((c) => (
            <a key={c._id} href={`/browse/category/${encodeURIComponent(c._id)}`} className="browse-tag">
              {c._id} <span className="browse-tag-count">{c.count}</span>
            </a>
          ))}
          {categories.length === 0 && (
            <p style={{ color: "var(--ivory-dim)" }}>No categories yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
