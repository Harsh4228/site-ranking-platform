"use client";
import { useState, useEffect } from "react";

export default function InsightsPanel({ listingId }) {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/listings/${listingId}/insights`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [open, listingId]);

  if (!open) {
    return (
      <button className="secondary" onClick={() => setOpen(true)} style={{ marginTop: 12, fontSize: "0.82rem" }}>
        📊 View insights & competitors
      </button>
    );
  }

  if (!data) return <p style={{ fontSize: "0.82rem", color: "var(--ivory-dim)", marginTop: 12 }}>Loading insights…</p>;

  return (
    <div className="insights-panel">
      <div className="insights-header">
        <span>You're <strong>#{data.myRank}</strong> of {data.totalInIndex} in this index</span>
      </div>

      {data.signals.length > 0 && (
        <div className="insights-signals">
          {data.signals.map((s, i) => (
            <div key={i} className="insight-signal">
              <span className="insight-signal-icon">
                {s.type === "subscribe" ? "⚡" : s.type === "competitor" ? "🏆" : s.type === "reviews" ? "⭐" : "📈"}
              </span>
              <div>
                <div className="insight-signal-msg">{s.message}</div>
                {s.type === "subscribe" && (
                  <a href={`/listings/${listingId}#subscription`} className="insight-signal-cta">{s.cta} →</a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {data.competitors.length > 0 && (
        <div className="insights-competitors">
          <div className="insights-comp-title">Top competitors</div>
          {data.competitors.map((c) => (
            <div key={c._id} className="insights-comp-row">
              <span className="insights-comp-name">{c.name}</span>
              <span className="insights-comp-score">
                Rank {c.rankScore}
                {c.subscriptionActive && <span className="badge sponsored" style={{ marginLeft: 6 }}>Sponsored</span>}
              </span>
            </div>
          ))}
        </div>
      )}

      {data.leads.total > 0 && (
        <div className="insights-roi">
          <span>{data.leads.total} total leads</span>
          <span className="stat-dot">·</span>
          <span>{data.leads.recent} in last 30 days</span>
          {data.leads.costPerLead && (
            <>
              <span className="stat-dot">·</span>
              <span>${data.leads.costPerLead}/lead</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
