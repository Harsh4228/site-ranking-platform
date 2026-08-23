import { connectDB } from "@/lib/db";
import Index from "@/models/Index";
import Listing from "@/models/Listing";
import Review from "@/models/Review";
import Lead from "@/models/Lead";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectDB();

  const [totalIndexes, totalListings, totalReviews, totalLeads, topIndexes] = await Promise.all([
    Index.countDocuments(),
    Listing.countDocuments(),
    Review.countDocuments(),
    Lead.countDocuments(),
    Index.find().sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  const counts = await Listing.aggregate([
    { $group: { _id: "$indexId", count: { $sum: 1 }, reviews: { $sum: "$reviewCount" } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c]));

  return (
    <div className="landing">
      {/* ---- Hero ---- */}
      <section className="l-hero">
        <div className="l-hero-badge">Trusted ranking platform</div>
        <h1 className="display l-hero-title">
          Get ranked.<br />Get found.<br /><span className="l-gold">Get customers.</span>
        </h1>
        <p className="l-hero-sub">
          The only directory where your position is <strong>earned by trust</strong> and
          <strong> boosted by visibility</strong> — never bought outright.
          Customers find businesses they can actually trust.
        </p>
        <div className="l-hero-cta">
          <a href="/auth/signin" className="l-btn-primary">List your business — free</a>
          <a href="/browse" className="l-btn-secondary">Browse directories</a>
        </div>
        <div className="l-hero-proof">
          <div className="l-proof-item">
            <div className="l-proof-value">{totalListings}</div>
            <div className="l-proof-label">Businesses listed</div>
          </div>
          <div className="l-proof-item">
            <div className="l-proof-value">{totalReviews}</div>
            <div className="l-proof-label">Reviews collected</div>
          </div>
          <div className="l-proof-item">
            <div className="l-proof-value">{totalIndexes}</div>
            <div className="l-proof-label">Directory indexes</div>
          </div>
          <div className="l-proof-item">
            <div className="l-proof-value">{totalLeads}</div>
            <div className="l-proof-label">Leads delivered</div>
          </div>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section className="l-section">
        <div className="l-section-label">How it works</div>
        <h2 className="display l-section-title">Transparent ranking in 3 steps</h2>
        <div className="l-steps">
          <div className="l-step">
            <div className="l-step-num">01</div>
            <h3>Join an index for free</h3>
            <p>Find your category and city. List your business in seconds — no fees, no contracts, no catch.</p>
          </div>
          <div className="l-step">
            <div className="l-step-num">02</div>
            <h3>Build your Trust Score</h3>
            <p>Collect real reviews, get verified, climb the leaderboard on merit. Trust can't be bought.</p>
          </div>
          <div className="l-step">
            <div className="l-step-num">03</div>
            <h3>Boost with Visibility</h3>
            <p>Choose a subscription tier or pay-per-lead to increase your Visibility Score. Always labeled "Sponsored" — never hidden.</p>
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="l-section">
        <div className="l-section-label">Platform features</div>
        <h2 className="display l-section-title">Everything a business needs to grow</h2>
        <div className="l-features">
          <div className="l-feature">
            <div className="l-feature-icon">📊</div>
            <h3>Owner Dashboard</h3>
            <p>Views, clicks, CTR, rank history — all in one place. Know exactly how your listing performs.</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">⚡</div>
            <h3>Two Ways to Boost</h3>
            <p>Monthly subscription tiers ($5–$50) or pay-per-WhatsApp-lead. Choose what fits your budget.</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">🏅</div>
            <h3>Embeddable Badge</h3>
            <p>Put your rank badge on your website. Every embed builds trust and drives traffic back to you.</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">💬</div>
            <h3>Index Chat</h3>
            <p>Real-time discussion in every directory. Engage with potential customers directly.</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">🔍</div>
            <h3>Search & Browse</h3>
            <p>Customers find you by city, category, or keyword. SEO-optimized pages that rank on Google.</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">💳</div>
            <h3>Stripe Payments</h3>
            <p>Real payment processing built in. Subscriptions activate instantly after checkout.</p>
          </div>
        </div>
      </section>

      {/* ---- Pricing ---- */}
      <section className="l-section">
        <div className="l-section-label">Pricing</div>
        <h2 className="display l-section-title">Start free. Pay only when you want more visibility.</h2>
        <div className="l-pricing">
          <div className="l-price-card">
            <div className="l-price-name">Free</div>
            <div className="l-price-amount">$0</div>
            <div className="l-price-period">forever</div>
            <ul className="l-price-features">
              <li>Join any index</li>
              <li>Collect reviews</li>
              <li>Owner dashboard</li>
              <li>Embeddable badge</li>
              <li>WhatsApp contact button</li>
            </ul>
            <a href="/auth/signin" className="l-btn-secondary" style={{ width: "100%", textAlign: "center" }}>Get started</a>
          </div>
          <div className="l-price-card l-price-featured">
            <div className="l-price-badge">Most popular</div>
            <div className="l-price-name">Growth</div>
            <div className="l-price-amount">$15</div>
            <div className="l-price-period">/month</div>
            <ul className="l-price-features">
              <li>Everything in Free</li>
              <li>+30 Visibility Score boost</li>
              <li>"Sponsored" badge</li>
              <li>Priority in leaderboard</li>
              <li>30-day billing period</li>
            </ul>
            <a href="/auth/signin" className="l-btn-primary" style={{ width: "100%", textAlign: "center" }}>Start boosting</a>
          </div>
          <div className="l-price-card">
            <div className="l-price-name">Leader</div>
            <div className="l-price-amount">$50</div>
            <div className="l-price-period">/month</div>
            <ul className="l-price-features">
              <li>Everything in Free</li>
              <li>+60 Visibility Score (max)</li>
              <li>"Sponsored" badge</li>
              <li>Maximum ranking boost</li>
              <li>30-day billing period</li>
            </ul>
            <a href="/auth/signin" className="l-btn-secondary" style={{ width: "100%", textAlign: "center" }}>Go all in</a>
          </div>
        </div>
        <p className="l-pricing-note">
          <strong>Pay-per-lead alternative:</strong> Don't want a subscription? Pay only when someone clicks
          "Contact via WhatsApp" — your Visibility Score grows with real engagement.
        </p>
      </section>

      {/* ---- Live indexes ---- */}
      {topIndexes.length > 0 && (
        <section className="l-section">
          <div className="l-section-label">Live directories</div>
          <h2 className="display l-section-title">Explore active indexes</h2>
          <div className="index-grid">
            {topIndexes.map((idx) => {
              const stats = countMap[String(idx._id)] || { count: 0, reviews: 0 };
              return (
                <a key={idx._id} className="index-card" href={`/indexes/${idx.slug}`}>
                  <div className="eyebrow">{idx.category}</div>
                  <h3>{idx.name}</h3>
                  <div className="meta">{idx.city}</div>
                  <div className="card-stats">
                    <span>{stats.count} listing{stats.count !== 1 ? "s" : ""}</span>
                    <span className="stat-dot">·</span>
                    <span>{stats.reviews} review{stats.reviews !== 1 ? "s" : ""}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* ---- Final CTA ---- */}
      <section className="l-cta">
        <h2 className="display l-section-title">Ready to get ranked?</h2>
        <p className="l-hero-sub" style={{ maxWidth: 480, margin: "12px auto 0" }}>
          Join for free. Build trust. Grow your visibility. Your customers are already looking.
        </p>
        <div className="l-hero-cta" style={{ marginTop: 20 }}>
          <a href="/auth/signin" className="l-btn-primary">Create your free listing</a>
        </div>
      </section>
    </div>
  );
}
