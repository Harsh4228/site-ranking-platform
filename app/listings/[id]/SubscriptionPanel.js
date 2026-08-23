"use client";
import { useState, useEffect } from "react";

const TIERS = [
  { tier: 1, name: "Starter", price: 5, boost: "+15 visibility", desc: "Basic boost for new listings" },
  { tier: 2, name: "Growth", price: 15, boost: "+30 visibility", desc: "2× visibility for growing businesses" },
  { tier: 3, name: "Pro", price: 30, boost: "+45 visibility", desc: "Serious competitive edge" },
  { tier: 4, name: "Leader", price: 50, boost: "+60 visibility", desc: "Maximum visibility boost" },
];

export default function SubscriptionPanel({ listing }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isActive = listing.subscriptionActive &&
    listing.subscriptionExpiresAt &&
    new Date(listing.subscriptionExpiresAt) > new Date();

  // Verify payment and activate subscription when returning from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (params.get("payment") === "success" && sessionId) {
      setSuccess("Payment successful — activating your boost…");
      window.history.replaceState({}, "", window.location.pathname);

      fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.listing || data.alreadyActive) {
            setSuccess("Visibility boost activated!");
            setTimeout(() => window.location.reload(), 600);
          } else {
            setError(data.error || "Activation failed — contact support.");
          }
        })
        .catch(() => setError("Verification failed — try refreshing the page."));
    } else if (params.get("payment") === "cancelled") {
      setError("Payment was cancelled.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const subscribe = async (tier) => {
    setBusy(tier);
    setError(null);
    setSuccess(null);

    // Try Stripe checkout first; falls back to direct activation if Stripe isn't configured
    const res = await fetch("/api/checkout/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: listing._id, tier }),
    });
    const data = await res.json();

    if (!res.ok) {
      // If Stripe isn't configured, use direct activation
      if (data.fallback) {
        const fallbackRes = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: listing._id, tier }),
        });
        const fallbackData = await fallbackRes.json();
        setBusy(null);
        if (!fallbackRes.ok) {
          setError(fallbackData.error || "Something went wrong");
          return;
        }
        setSuccess(`Subscribed to Tier ${tier} — visibility boost active for 30 days! (demo mode)`);
        setTimeout(() => window.location.reload(), 800);
        return;
      }
      setBusy(null);
      setError(data.error || "Something went wrong");
      return;
    }

    // Redirect to Stripe Checkout
    window.location.href = data.url;
  };

  const expiresAt = listing.subscriptionExpiresAt
    ? new Date(listing.subscriptionExpiresAt).toLocaleDateString()
    : null;

  return (
    <div className="subscription-panel">
      <h3 className="display" style={{ fontSize: "1.1rem" }}>
        ⚡ Boost Visibility — Path A
      </h3>
      <p className="sub-desc">
        Subscribe to a visibility tier for 30 days. Higher tiers add more points to your Visibility Score and help you rank higher.
        {isActive && (
          <span className="sub-active-badge">
            Active: Tier {listing.subscriptionTier} · expires {expiresAt}
          </span>
        )}
      </p>

      <div className="tier-grid">
        {TIERS.map((t) => {
          const isCurrent = isActive && listing.subscriptionTier === t.tier;
          return (
            <div key={t.tier} className={`tier-card ${isCurrent ? "tier-current" : ""}`}>
              <div className="tier-name">{t.name}</div>
              <div className="tier-price">${t.price}<span className="tier-period">/mo</span></div>
              <div className="tier-boost">{t.boost}</div>
              <div className="tier-desc">{t.desc}</div>
              <button
                className={isCurrent ? "secondary" : ""}
                disabled={busy !== null || isCurrent}
                onClick={() => subscribe(t.tier)}
              >
                {busy === t.tier ? "Processing…" : isCurrent ? "Current plan" : "Subscribe"}
              </button>
            </div>
          );
        })}
      </div>

      {error && <p className="sub-error">{error}</p>}
      {success && <p className="sub-success">{success}</p>}

      <div className="path-b-note">
        <strong>Path B — Pay-per-lead</strong>: Every "Contact via WhatsApp" click also adds to your Visibility Score automatically (up to 60 pts from the last 30 days of lead spend).
      </div>
    </div>
  );
}
