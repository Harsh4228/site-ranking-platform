import { connectDB } from "@/lib/db";
import Index from "@/models/Index";
import Listing from "@/models/Listing";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: "Buy GoSite — White-Label Business Directory Platform",
    description: "Launch your own ranked business directory in any city. Next.js + MongoDB + Stripe. Buy once, deploy anywhere.",
  };
}

export default async function BuyPage() {
  await connectDB();
  const totalListings = await Listing.countDocuments();
  const totalIndexes = await Index.countDocuments();

  return (
    <div className="landing">
      <section className="l-hero">
        <div className="l-hero-badge">White-label SaaS template</div>
        <h1 className="display l-hero-title">
          Launch your own<br />business directory<br /><span className="l-gold">in 10 minutes.</span>
        </h1>
        <p className="l-hero-sub">
          Get the complete source code behind <strong>GoSite</strong> — a production-ready
          ranked business directory with Stripe payments, auth, dashboards, and 30+ API routes.
          Deploy to Vercel with one click. Customize everything.
        </p>
        <div className="l-hero-cta">
          <a href="https://harsh4228.gumroad.com/l/gosite" target="_blank" rel="noopener noreferrer" className="l-btn-primary">
            Buy now — $99
          </a>
          <a href="/" className="l-btn-secondary">See live demo</a>
        </div>
      </section>

      <section className="l-section">
        <div className="l-section-label">What you get</div>
        <h2 className="display l-section-title">Everything included. No subscriptions.</h2>
        <div className="l-features">
          <div className="l-feature">
            <div className="l-feature-icon">💰</div>
            <h3>3 Revenue Streams Built In</h3>
            <p>Subscription tiers ($5–$50/mo), pay-per-lead (WhatsApp clicks), and embeddable badges. Start charging day one.</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">💳</div>
            <h3>Stripe Payments</h3>
            <p>Real checkout, webhook verification, subscription activation. Not a demo — production Stripe integration.</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">🔐</div>
            <h3>Full Auth System</h3>
            <p>NextAuth with email/password + Google OAuth. Admin roles, protected routes, setup wizard.</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">📊</div>
            <h3>Owner + Admin Dashboards</h3>
            <p>Business owners see views, clicks, CTR, competitor insights, rank history. Admins see revenue and users.</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">🏅</div>
            <h3>Trust + Visibility Scoring</h3>
            <p>Transparent ranking formula. Reviews build trust, payments boost visibility. Never pay-to-win.</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">⚡</div>
            <h3>One-Click Deploy</h3>
            <p>Next.js 14, MongoDB, Vercel-ready. Clone repo, add env vars, deploy. Live in under 10 minutes.</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">🎨</div>
            <h3>White-Label Config</h3>
            <p>Change name, colors, pricing, currency in one file. No code changes needed.</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">🔍</div>
            <h3>SEO Optimized</h3>
            <p>Sitemap, robots.txt, Schema.org structured data, dynamic meta tags. Google indexes your listings.</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">💬</div>
            <h3>Chat, Search, Referrals</h3>
            <p>Real-time chat per index, global search, referral system with auto-rewards. All built in.</p>
          </div>
        </div>
      </section>

      <section className="l-section">
        <div className="l-section-label">Live stats</div>
        <h2 className="display l-section-title">This is a real, running platform</h2>
        <div className="l-hero-proof">
          <div className="l-proof-item">
            <div className="l-proof-value">30+</div>
            <div className="l-proof-label">API Routes</div>
          </div>
          <div className="l-proof-item">
            <div className="l-proof-value">65</div>
            <div className="l-proof-label">Source Files</div>
          </div>
          <div className="l-proof-item">
            <div className="l-proof-value">{totalListings}</div>
            <div className="l-proof-label">Demo Listings</div>
          </div>
          <div className="l-proof-item">
            <div className="l-proof-value">{totalIndexes}</div>
            <div className="l-proof-label">Demo Indexes</div>
          </div>
        </div>
      </section>

      <section className="l-section">
        <div className="l-section-label">Pricing</div>
        <h2 className="display l-section-title">One payment. Yours forever.</h2>
        <div className="l-pricing" style={{ maxWidth: 400, margin: "36px auto 0" }}>
          <div className="l-price-card l-price-featured" style={{ width: "100%" }}>
            <div className="l-price-badge">Complete package</div>
            <div className="l-price-name">GoSite Template</div>
            <div className="l-price-amount">$99</div>
            <div className="l-price-period">one-time payment</div>
            <ul className="l-price-features">
              <li>Full source code (Next.js 14)</li>
              <li>MongoDB + Mongoose models</li>
              <li>Stripe payment integration</li>
              <li>NextAuth authentication</li>
              <li>Admin + Owner dashboards</li>
              <li>White-label configuration</li>
              <li>Seed script with demo data</li>
              <li>Vercel deployment ready</li>
              <li>Commercial license included</li>
              <li>Free updates via GitHub</li>
            </ul>
            <a href="https://harsh4228.gumroad.com/l/gosite" target="_blank" rel="noopener noreferrer"
              className="l-btn-primary" style={{ width: "100%", textAlign: "center", display: "block" }}>
              Buy now — $99
            </a>
          </div>
        </div>
      </section>

      <section className="l-cta">
        <h2 className="display l-section-title">Stop building from scratch.</h2>
        <p className="l-hero-sub" style={{ maxWidth: 480, margin: "12px auto 0" }}>
          Get a complete, revenue-ready business directory platform. Deploy it for your city, your niche, your market.
        </p>
        <div className="l-hero-cta" style={{ marginTop: 20 }}>
          <a href="https://harsh4228.gumroad.com/l/gosite" target="_blank" rel="noopener noreferrer" className="l-btn-primary">
            Buy GoSite — $99
          </a>
        </div>
      </section>
    </div>
  );
}
