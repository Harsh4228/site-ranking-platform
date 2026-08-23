import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import RankHistory from "@/models/RankHistory";
import { redirect } from "next/navigation";
import InsightsPanel from "./InsightsPanel";
import ReferralSection from "./ReferralSection";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { title: "Dashboard — GoSite" };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  await connectDB();

  const listings = await Listing.find({ ownerId: session.user.id })
    .populate("indexId", "name slug city")
    .sort({ rankScore: -1 })
    .lean();

  const totalViews = listings.reduce((s, l) => s + (l.views || 0), 0);
  const totalClicks = listings.reduce((s, l) => s + (l.clicks || 0), 0);
  const totalReviews = listings.reduce((s, l) => s + l.reviewCount, 0);
  const bestRank = listings.length > 0 ? Math.max(...listings.map((l) => l.rankScore)) : 0;

  const historyMap = {};
  if (listings.length > 0) {
    const ids = listings.map((l) => l._id);
    const history = await RankHistory.find({ listingId: { $in: ids } })
      .sort({ createdAt: -1 })
      .limit(listings.length * 30)
      .lean();
    for (const h of history) {
      const key = String(h.listingId);
      if (!historyMap[key]) historyMap[key] = [];
      historyMap[key].push(h);
    }
  }

  return (
    <>
      <h1 className="display" style={{ fontSize: "2rem" }}>Your Dashboard</h1>
      <p className="hero-sub">
        Welcome back, <strong>{session.user.name}</strong>. Here's how your listings are performing.
      </p>

      <div className="admin-stats-grid" style={{ marginTop: 20 }}>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{listings.length}</div>
          <div className="admin-stat-label">Your listings</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{totalViews}</div>
          <div className="admin-stat-label">Total views</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{totalClicks}</div>
          <div className="admin-stat-label">WhatsApp clicks</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{totalReviews}</div>
          <div className="admin-stat-label">Reviews</div>
        </div>
        <div className="admin-stat-card admin-stat-revenue">
          <div className="admin-stat-value">{bestRank}</div>
          <div className="admin-stat-label">Best rank score</div>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", marginTop: 32 }}>
          <h3 className="display" style={{ fontSize: "1.2rem" }}>Get started in 30 seconds</h3>
          <p style={{ color: "var(--ivory-dim)", marginTop: 8, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
            Browse a directory, click "Join free", and your listing will appear here with full analytics.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
            <a href="/browse" className="l-btn-primary">Browse directories</a>
          </div>
        </div>
      ) : (
        <div className="dashboard-listings">
          {listings.map((l) => {
            const history = (historyMap[String(l._id)] || []).reverse();
            const sponsored = l.subscriptionActive || l.recentLeadSpend > 0;
            const ctr = l.views > 0 ? (((l.clicks || 0) / l.views) * 100).toFixed(1) : "0.0";
            return (
              <div key={l._id} className="dashboard-card">
                <div className="dashboard-card-header">
                  <div>
                    <a href={`/listings/${l._id}`} className="dashboard-card-name">{l.name}</a>
                    <div className="dashboard-card-meta">
                      {l.indexId ? (
                        <a href={`/indexes/${l.indexId.slug}`} style={{ color: "var(--ivory-dim)" }}>
                          {l.indexId.name} · {l.indexId.city}
                        </a>
                      ) : "Unknown index"}
                      <span className={`badge ${sponsored ? "sponsored" : "organic"}`} style={{ marginLeft: 8 }}>
                        {sponsored ? "Sponsored" : "Organic"}
                      </span>
                    </div>
                  </div>
                  <div className="dashboard-card-rank">
                    <div className="score-card-value" style={{ fontSize: "1.4rem", color: "var(--gold)" }}>
                      {l.rankScore}
                    </div>
                    <div className="score-card-label">Rank Score</div>
                  </div>
                </div>

                <div className="dashboard-metrics">
                  <div className="dashboard-metric">
                    <span className="dashboard-metric-value">{l.trustScore}</span>
                    <span className="dashboard-metric-label">Trust</span>
                  </div>
                  <div className="dashboard-metric">
                    <span className="dashboard-metric-value">{l.visibilityScore}</span>
                    <span className="dashboard-metric-label">Visibility</span>
                  </div>
                  <div className="dashboard-metric">
                    <span className="dashboard-metric-value">{l.views || 0}</span>
                    <span className="dashboard-metric-label">Views</span>
                  </div>
                  <div className="dashboard-metric">
                    <span className="dashboard-metric-value">{l.clicks || 0}</span>
                    <span className="dashboard-metric-label">Clicks</span>
                  </div>
                  <div className="dashboard-metric">
                    <span className="dashboard-metric-value">{ctr}%</span>
                    <span className="dashboard-metric-label">CTR</span>
                  </div>
                  <div className="dashboard-metric">
                    <span className="dashboard-metric-value">{l.reviewCount}</span>
                    <span className="dashboard-metric-label">Reviews</span>
                  </div>
                </div>

                {history.length > 1 && (
                  <div className="dashboard-sparkline">
                    <div className="dashboard-sparkline-label">Rank trend — last {history.length} snapshots</div>
                    <div className="dashboard-sparkline-bar">
                      {history.map((h, i) => {
                        const max = Math.max(...history.map((x) => x.rankScore), 1);
                        const pct = (h.rankScore / max) * 100;
                        return (
                          <div key={i} className="dashboard-sparkline-col"
                            style={{ height: `${Math.max(pct, 4)}%` }}
                            title={`Score: ${h.rankScore} — ${new Date(h.createdAt).toLocaleDateString()}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                <InsightsPanel listingId={l._id.toString()} />
              </div>
            );
          })}
        </div>
      )}

      <ReferralSection />
    </>
  );
}
