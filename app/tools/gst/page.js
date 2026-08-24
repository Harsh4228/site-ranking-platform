"use client";
import { useState } from "react";

export default function GSTCalculatorPage() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState(18);
  const [type, setType] = useState("exclusive");

  const amt = Number(amount) || 0;
  const gst = type === "exclusive" ? (amt * rate) / 100 : amt - amt / (1 + rate / 100);
  const base = type === "exclusive" ? amt : amt - gst;
  const total = type === "exclusive" ? amt + gst : amt;
  const cgst = gst / 2;
  const sgst = gst / 2;

  return (
    <>
      <h1 className="display" style={{ fontSize: "2rem" }}>GST Calculator</h1>
      <p style={{ color: "var(--ivory-dim)", marginTop: 8 }}>
        Calculate GST instantly — CGST, SGST, IGST breakup included.
        <span style={{ color: "var(--gold)", marginLeft: 8 }}>Free tool by GoSite</span>
      </p>

      <div className="panel" style={{ maxWidth: 500, marginTop: 24 }}>
        <label>Amount (₹)</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" style={{ fontSize: "1.2rem" }} />

        <label>GST Rate</label>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {[5, 12, 18, 28].map((r) => (
            <button key={r} onClick={() => setRate(r)} className={rate === r ? "" : "secondary"}
              style={{ flex: 1, marginTop: 0, fontSize: "0.88rem" }}>
              {r}%
            </button>
          ))}
        </div>

        <label>Calculation Type</label>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button onClick={() => setType("exclusive")} className={type === "exclusive" ? "" : "secondary"}
            style={{ flex: 1, marginTop: 0, fontSize: "0.85rem" }}>
            Add GST (Exclusive)
          </button>
          <button onClick={() => setType("inclusive")} className={type === "inclusive" ? "" : "secondary"}
            style={{ flex: 1, marginTop: 0, fontSize: "0.85rem" }}>
            Remove GST (Inclusive)
          </button>
        </div>
      </div>

      {amt > 0 && (
        <div className="panel" style={{ maxWidth: 500, marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <div className="admin-stat-card">
              <div className="admin-stat-value" style={{ fontSize: "1.2rem" }}>₹{base.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
              <div className="admin-stat-label">Base Amount</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-value" style={{ fontSize: "1.2rem" }}>₹{gst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
              <div className="admin-stat-label">GST ({rate}%)</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-value" style={{ fontSize: "1rem" }}>₹{cgst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
              <div className="admin-stat-label">CGST ({rate / 2}%)</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-value" style={{ fontSize: "1rem" }}>₹{sgst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
              <div className="admin-stat-label">SGST ({rate / 2}%)</div>
            </div>
          </div>
          <div className="admin-stat-card admin-stat-revenue" style={{ marginTop: 12 }}>
            <div className="admin-stat-value">₹{total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
            <div className="admin-stat-label">Total Amount</div>
          </div>
        </div>
      )}

      <div className="panel" style={{ maxWidth: 500, marginTop: 24, textAlign: "center" }}>
        <p style={{ color: "var(--ivory-dim)", fontSize: "0.88rem" }}>
          Need professional invoices? Try our <a href="/tools/invoice" style={{ color: "var(--gold)", fontWeight: 600 }}>Free Invoice Generator</a>
        </p>
        <p style={{ color: "var(--ivory-dim)", fontSize: "0.88rem", marginTop: 8 }}>
          📢 Running a business? <a href="/promote" style={{ color: "var(--gold)", fontWeight: 600 }}>Get listed on GoSite for free</a> and attract more customers.
        </p>
      </div>
    </>
  );
}
