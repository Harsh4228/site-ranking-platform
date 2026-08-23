export async function generateMetadata() {
  return {
    title: "Promote Your Business — GoSite",
    description: "Boost your business visibility on GoSite. Get more customers through real rankings.",
  };
}

export default function PromotePage() {
  return (
    <div className="landing">
      <section className="l-hero">
        <div className="l-hero-badge">For business owners</div>
        <h1 className="display l-hero-title">
          Get more customers<br /><span className="l-gold">starting today.</span>
        </h1>
        <p className="l-hero-sub">
          Your customers are already searching for businesses like yours.
          Get listed on <strong>GoSite</strong>, collect reviews, and climb the rankings — or boost instantly with a visibility subscription.
        </p>
        <div className="l-hero-cta">
          <a href="/auth/signin" className="l-btn-primary">List your business — free</a>
          <a href="/browse" className="l-btn-secondary">See who's ranking</a>
        </div>
      </section>

      <section className="l-section">
        <div className="l-section-label">Why GoSite works</div>
        <h2 className="display l-section-title">Real results, not empty promises</h2>
        <div className="l-steps">
          <div className="l-step">
            <div className="l-step-num">📞</div>
            <h3>Get WhatsApp leads</h3>
            <p>Customers click "Contact via WhatsApp" directly from your listing. You get real conversations, not just views.</p>
          </div>
          <div className="l-step">
            <div className="l-step-num">⭐</div>
            <h3>Build trust with reviews</h3>
            <p>Real customer reviews improve your Trust Score. The more reviews you have, the higher you rank — for free.</p>
          </div>
          <div className="l-step">
            <div className="l-step-num">📊</div>
            <h3>Track everything</h3>
            <p>See exactly how many people view your listing, click contact, and leave reviews. Data you can act on.</p>
          </div>
        </div>
      </section>

      <section className="l-section">
        <div className="l-section-label">Boost your visibility</div>
        <h2 className="display l-section-title">Pay only when you want more</h2>
        <p className="l-hero-sub" style={{ textAlign: "center", margin: "12px auto 0" }}>
          Your free listing already gets you found. Subscriptions give you a competitive edge.
        </p>
        <div className="l-pricing">
          <div className="l-price-card">
            <div className="l-price-name">Free</div>
            <div className="l-price-amount">₹0</div>
            <div className="l-price-period">forever</div>
            <ul className="l-price-features">
              <li>Listed in your category</li>
              <li>Collect reviews</li>
              <li>WhatsApp contact button</li>
              <li>Owner dashboard</li>
              <li>Embeddable badge</li>
            </ul>
            <a href="/auth/signin" className="l-btn-secondary" style={{ width: "100%", textAlign: "center" }}>Get started free</a>
          </div>
          <div className="l-price-card l-price-featured">
            <div className="l-price-badge">Most popular</div>
            <div className="l-price-name">Growth</div>
            <div className="l-price-amount">₹999</div>
            <div className="l-price-period">/month</div>
            <ul className="l-price-features">
              <li>Everything in Free</li>
              <li>+30 Visibility Score boost</li>
              <li>"Sponsored" badge</li>
              <li>Rank above free listings</li>
              <li>Competitor insights</li>
            </ul>
            <a href="/auth/signin" className="l-btn-primary" style={{ width: "100%", textAlign: "center" }}>Start boosting</a>
          </div>
          <div className="l-price-card">
            <div className="l-price-name">Leader</div>
            <div className="l-price-amount">₹3,999</div>
            <div className="l-price-period">/month</div>
            <ul className="l-price-features">
              <li>Everything in Free</li>
              <li>+60 Visibility Score (max)</li>
              <li>"Sponsored" badge</li>
              <li>Top ranking position</li>
              <li>Priority support</li>
            </ul>
            <a href="/auth/signin" className="l-btn-secondary" style={{ width: "100%", textAlign: "center" }}>Go all in</a>
          </div>
        </div>
      </section>

      <section className="l-cta">
        <h2 className="display l-section-title">Your competitor is already listed.</h2>
        <p className="l-hero-sub" style={{ maxWidth: 480, margin: "12px auto 0" }}>
          Every day you're not on GoSite is a day your competitor gets the customers searching for your service.
        </p>
        <div className="l-hero-cta" style={{ marginTop: 20 }}>
          <a href="/auth/signin" className="l-btn-primary">List your business — free</a>
        </div>
      </section>
    </div>
  );
}
