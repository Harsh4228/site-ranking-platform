import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Index from "@/models/Index";
import Listing from "@/models/Listing";
import Lead from "@/models/Lead";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  await connectDB();

  const totalUsers = await User.countDocuments();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalIndexes, totalListings, totalLeads, totalSubs] = await Promise.all([
    Index.countDocuments(),
    Listing.countDocuments(),
    Lead.countDocuments(),
    Subscription.countDocuments(),
  ]);

  const leadRev = await Lead.aggregate([{ $group: { _id: null, total: { $sum: "$cost" } } }]);
  const subRev = await Subscription.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
  const totalRevenue = (leadRev[0]?.total || 0) + (subRev[0]?.total || 0);

  const recentLeadCount = await Lead.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  const recentSubCount = await Subscription.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

  const topListings = await Listing.find()
    .sort({ rankScore: -1 })
    .limit(15)
    .populate("indexId", "name slug")
    .lean();

  const recentSubs = await Subscription.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("listingId", "name")
    .lean();

  return (
    <>
      <a href="/" className="back-link">← Back to site</a>
      <h1 className="display" style={{ fontSize: "2rem" }}>Admin Dashboard</h1>
      <p className="hero-sub">Platform overview and revenue tracking.</p>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{totalIndexes}</div>
          <div className="admin-stat-label">Indexes</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{totalListings}</div>
          <div className="admin-stat-label">Listings</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{totalUsers}</div>
          <div className="admin-stat-label">Users</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{totalLeads}</div>
          <div className="admin-stat-label">Total Leads</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{totalSubs}</div>
          <div className="admin-stat-label">Subscriptions</div>
        </div>
        <div className="admin-stat-card admin-stat-revenue">
          <div className="admin-stat-value">${totalRevenue.toFixed(2)}</div>
          <div className="admin-stat-label">Total Revenue</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{recentLeadCount}</div>
          <div className="admin-stat-label">Leads (30d)</div>
        </div>
      </div>

      <div className="admin-section">
        <h2 className="display" style={{ fontSize: "1.2rem", marginBottom: 16 }}>
          Top Listings by Rank
        </h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Index</th>
                <th>Trust</th>
                <th>Visibility</th>
                <th>Rank</th>
                <th>Views</th>
                <th>Clicks</th>
                <th>Reviews</th>
              </tr>
            </thead>
            <tbody>
              {topListings.map((l, i) => (
                <tr key={l._id}>
                  <td className="mono">{i + 1}</td>
                  <td>
                    <a href={`/listings/${l._id}`} style={{ color: "var(--gold)" }}>
                      {l.name}
                    </a>
                  </td>
                  <td>{l.indexId?.name || "—"}</td>
                  <td className="mono">{l.trustScore}</td>
                  <td className="mono">{l.visibilityScore}</td>
                  <td className="mono" style={{ color: "var(--gold)" }}>{l.rankScore}</td>
                  <td className="mono">{l.views || 0}</td>
                  <td className="mono">{l.clicks || 0}</td>
                  <td className="mono">{l.reviewCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section">
        <h2 className="display" style={{ fontSize: "1.2rem", marginBottom: 16 }}>
          Recent Subscriptions
        </h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Tier</th>
                <th>Amount</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {recentSubs.map((s) => (
                <tr key={s._id}>
                  <td>{s.listingId?.name || "—"}</td>
                  <td className="mono">Tier {s.tier}</td>
                  <td className="mono">${s.amount}</td>
                  <td>{new Date(s.periodStart).toLocaleDateString()}</td>
                  <td>{new Date(s.periodEnd).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentSubs.length === 0 && (
                <tr><td colSpan={5} style={{ color: "var(--ivory-dim)" }}>No subscriptions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
