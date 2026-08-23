"use client";
import { useState, useEffect } from "react";

export default function ReferralSection() {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referral").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return null;

  const copy = () => {
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="referral-section">
      <h3 className="display" style={{ fontSize: "1.1rem" }}>🎁 Invite & Earn</h3>
      <p style={{ color: "var(--ivory-dim)", fontSize: "0.85rem", marginTop: 6 }}>
        Invite 3 businesses to join. When they sign up, you get a <strong style={{ color: "var(--ivory)" }}>free 7-day visibility boost</strong> on your listing.
      </p>

      <div className="referral-stats">
        <div className="dashboard-metric">
          <span className="dashboard-metric-value">{data.totalReferred}</span>
          <span className="dashboard-metric-label">Referred</span>
        </div>
        <div className="dashboard-metric">
          <span className="dashboard-metric-value">{data.rewardsEarned}</span>
          <span className="dashboard-metric-label">Rewards earned</span>
        </div>
        <div className="dashboard-metric">
          <span className="dashboard-metric-value">{data.nextRewardAt}</span>
          <span className="dashboard-metric-label">Until next reward</span>
        </div>
      </div>

      <div className="referral-link-box">
        <input className="referral-link-input" value={data.referralLink} readOnly onClick={(e) => e.target.select()} />
        <button onClick={copy} style={{ marginTop: 0, flexShrink: 0 }}>
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
