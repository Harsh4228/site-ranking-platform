export async function generateMetadata() {
  return {
    title: "API Access — GoSite",
    description: "Access ranked business data via API. Perfect for apps, integrations, and analytics.",
  };
}

export default function ApiPricingPage() {
  return (
    <div className="landing">
      <section className="l-hero">
        <div className="l-hero-badge">Developer API</div>
        <h1 className="display l-hero-title">
          Business data<br /><span className="l-gold">via API.</span>
        </h1>
        <p className="l-hero-sub">
          Access ranked, reviewed, and scored business listings across Indian cities.
          Build apps, dashboards, and integrations on top of GoSite data.
        </p>
      </section>

      <section className="l-section">
        <div className="l-section-label">Endpoints</div>
        <h2 className="display l-section-title">What you can access</h2>
        <div className="l-steps">
          <div className="l-step">
            <div className="l-step-num">GET</div>
            <h3>/api/indexes</h3>
            <p>List all directory indexes with category, city, and size.</p>
          </div>
          <div className="l-step">
            <div className="l-step-num">GET</div>
            <h3>/api/indexes/[slug]</h3>
            <p>Full leaderboard for an index — all listings ranked by score.</p>
          </div>
          <div className="l-step">
            <div className="l-step-num">GET</div>
            <h3>/api/search?q=</h3>
            <p>Search across all indexes and listings by keyword.</p>
          </div>
          <div className="l-step">
            <div className="l-step-num">GET</div>
            <h3>/api/embed/[id]</h3>
            <p>Listing badge data as JSON or SVG — embed on any website.</p>
          </div>
        </div>
      </section>

      <section className="l-section">
        <div className="l-section-label">Pricing</div>
        <h2 className="display l-section-title">Free to start. Pay as you scale.</h2>
        <div className="l-pricing">
          <div className="l-price-card">
            <div className="l-price-name">Free</div>
            <div className="l-price-amount">$0</div>
            <div className="l-price-period">forever</div>
            <ul className="l-price-features">
              <li>100 requests/day</li>
              <li>Public endpoints only</li>
              <li>JSON responses</li>
              <li>No auth required</li>
            </ul>
            <a href="/api/indexes" className="l-btn-secondary" style={{ width: "100%", textAlign: "center" }}>Try it now</a>
          </div>
          <div className="l-price-card l-price-featured">
            <div className="l-price-badge">Coming soon</div>
            <div className="l-price-name">Pro API</div>
            <div className="l-price-amount">$29</div>
            <div className="l-price-period">/month</div>
            <ul className="l-price-features">
              <li>Unlimited requests</li>
              <li>All endpoints</li>
              <li>Webhook notifications</li>
              <li>Priority support</li>
              <li>Bulk export</li>
            </ul>
            <a href="mailto:support@gosite.lol?subject=Pro API Access" className="l-btn-primary" style={{ width: "100%", textAlign: "center" }}>Contact us</a>
          </div>
        </div>
      </section>
    </div>
  );
}
