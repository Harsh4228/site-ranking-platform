"use client";
import { useState } from "react";

export default function WhatsAppLinkPage() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("Hi! I'd like to enquire about your services.");
  const [copied, setCopied] = useState(false);

  const num = phone.replace(/[^0-9]/g, "");
  const link = num ? `https://wa.me/${num}${message ? "?text=" + encodeURIComponent(message) : ""}` : "";

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <h1 className="display" style={{ fontSize: "2rem", textAlign: "center" }}>
        WhatsApp Link Generator
      </h1>
      <p style={{ color: "var(--ivory-dim)", textAlign: "center", marginTop: 8 }}>
        Create a click-to-chat WhatsApp link with a pre-filled message.
        <strong style={{ color: "var(--gold)" }}> Free, no signup.</strong>
      </p>

      <div className="panel" style={{ maxWidth: 500, margin: "24px auto 0" }}>
        <label>WhatsApp Number (with country code)</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+919876543210 or 919876543210"
          style={{ fontSize: "1.1rem" }} />
        <label>Pre-filled Message (optional)</label>
        <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="Hi! I'd like to know more about..." />

        {link && (
          <div style={{ marginTop: 16 }}>
            <label>Your WhatsApp Link</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={link} readOnly onClick={(e) => e.target.select()} style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.82rem" }} />
              <button onClick={copy} style={{ flexShrink: 0, marginTop: 0 }}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <a href={link} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, display: "block", background: "#25D366", color: "#fff", textAlign: "center", padding: "12px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
                💬 Test Link
              </a>
              <button onClick={() => {
                const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
                window.open(qr, "_blank");
              }} className="secondary" style={{ flex: 1, marginTop: 0 }}>
                📱 Get QR Code
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="panel" style={{ maxWidth: 500, margin: "16px auto 0" }}>
        <h3 className="display" style={{ fontSize: "1rem" }}>Where to use this link</h3>
        <ul style={{ paddingLeft: 20, color: "var(--ivory-dim)", fontSize: "0.88rem", lineHeight: 2 }}>
          <li>Instagram / Facebook bio</li>
          <li>Google My Business description</li>
          <li>Business cards (print the QR code)</li>
          <li>Website contact button</li>
          <li>Email signatures</li>
        </ul>
      </div>

      <div className="panel" style={{ maxWidth: 500, margin: "16px auto 0", textAlign: "center" }}>
        <p style={{ color: "var(--ivory-dim)", fontSize: "0.88rem" }}>
          Want a complete business page with your WhatsApp, reviews, and links?
        </p>
        <a href="/tools/bizlink" className="l-btn-primary" style={{ display: "inline-block", marginTop: 8 }}>
          Create your free Business Link Page
        </a>
      </div>
    </>
  );
}
