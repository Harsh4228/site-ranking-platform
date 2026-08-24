"use client";
import { useState } from "react";

export default function BizLinkPage() {
  const [biz, setBiz] = useState({
    name: "", tagline: "", whatsapp: "", phone: "", email: "",
    address: "", category: "", city: "",
    links: [{ label: "", url: "" }],
    message: "Hi! I found you on GoSite. I'd like to enquire about your services.",
  });
  const [generated, setGenerated] = useState(null);

  const update = (k) => (e) => setBiz({ ...biz, [k]: e.target.value });
  const updateLink = (i, k, v) => {
    const links = [...biz.links];
    links[i] = { ...links[i], [k]: v };
    setBiz({ ...biz, links });
  };
  const addLink = () => setBiz({ ...biz, links: [...biz.links, { label: "", url: "" }] });

  const waNum = biz.whatsapp.replace(/[^0-9]/g, "");
  const waLink = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(biz.message)}` : "";

  const generate = (e) => {
    e.preventDefault();
    if (!biz.name || !biz.whatsapp) return;
    setGenerated(biz);
  };

  return (
    <>
      <h1 className="display" style={{ fontSize: "2rem", textAlign: "center" }}>
        Create Your Business Link Page
      </h1>
      <p style={{ color: "var(--ivory-dim)", textAlign: "center", marginTop: 8, maxWidth: 500, margin: "8px auto 0" }}>
        Get a beautiful one-page business card with WhatsApp contact. Share it everywhere — Instagram bio, Google Maps, business cards.
        <strong style={{ color: "var(--gold)" }}> Free forever.</strong>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginTop: 28 }}>
        {/* Form */}
        <form className="panel" onSubmit={generate} style={{ marginTop: 0 }}>
          <h3 className="display" style={{ fontSize: "1rem" }}>Your Business Info</h3>
          <label>Business Name *</label>
          <input value={biz.name} onChange={update("name")} required placeholder="e.g. Sharma Plumbing" />
          <label>Tagline</label>
          <input value={biz.tagline} onChange={update("tagline")} placeholder="e.g. 24/7 Emergency Plumbing in Mumbai" />
          <label>WhatsApp Number *</label>
          <input value={biz.whatsapp} onChange={update("whatsapp")} required placeholder="+919876543210" />
          <label>Pre-filled WhatsApp Message</label>
          <input value={biz.message} onChange={update("message")} placeholder="Hi! I'd like to enquire..." />
          <label>Phone</label>
          <input value={biz.phone} onChange={update("phone")} placeholder="9876543210" />
          <label>Email</label>
          <input value={biz.email} onChange={update("email")} placeholder="you@business.com" />
          <label>Category</label>
          <input value={biz.category} onChange={update("category")} placeholder="Plumbing, Restaurant, etc." />
          <label>City</label>
          <input value={biz.city} onChange={update("city")} placeholder="Mumbai" />
          <label>Address</label>
          <input value={biz.address} onChange={update("address")} placeholder="Your business address" />

          <h3 className="display" style={{ fontSize: "1rem", marginTop: 20 }}>Links</h3>
          {biz.links.map((link, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginTop: 6 }}>
              <input value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)} placeholder="Label (e.g. Website)" />
              <input value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)} placeholder="https://..." />
            </div>
          ))}
          <button type="button" onClick={addLink} className="secondary" style={{ fontSize: "0.82rem", marginTop: 8 }}>+ Add link</button>

          <button type="submit" style={{ width: "100%", marginTop: 16 }}>⚡ Generate Business Page</button>
        </form>

        {/* Live Preview */}
        <div>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, color: "#111", maxWidth: 380, margin: "0 auto", minHeight: 400 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #D4A843, #E8C96A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", fontWeight: 700, color: "#fff", margin: "0 auto" }}>
                {(biz.name || "B")[0].toUpperCase()}
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginTop: 12, color: "#111" }}>
                {biz.name || "Your Business Name"}
              </h2>
              {biz.tagline && <p style={{ fontSize: "0.85rem", color: "#666", marginTop: 4 }}>{biz.tagline}</p>}
              {biz.category && biz.city && (
                <p style={{ fontSize: "0.75rem", color: "#999", marginTop: 4 }}>{biz.category} · {biz.city}</p>
              )}
            </div>

            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", background: "#25D366", color: "#fff", textAlign: "center", padding: "12px 20px", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", marginTop: 20, textDecoration: "none" }}>
                💬 Chat on WhatsApp
              </a>
            )}

            {biz.phone && (
              <a href={`tel:${biz.phone}`}
                style={{ display: "block", background: "#f0f0f0", color: "#111", textAlign: "center", padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "0.88rem", marginTop: 8, textDecoration: "none" }}>
                📞 Call {biz.phone}
              </a>
            )}

            {biz.email && (
              <a href={`mailto:${biz.email}`}
                style={{ display: "block", background: "#f0f0f0", color: "#111", textAlign: "center", padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "0.88rem", marginTop: 8, textDecoration: "none" }}>
                ✉️ Email Us
              </a>
            )}

            {biz.links.filter(l => l.label && l.url).map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", border: "1px solid #ddd", color: "#111", textAlign: "center", padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: "0.88rem", marginTop: 8, textDecoration: "none" }}>
                {link.label}
              </a>
            ))}

            {biz.address && (
              <p style={{ fontSize: "0.78rem", color: "#999", textAlign: "center", marginTop: 16 }}>
                📍 {biz.address}
              </p>
            )}

            <p style={{ fontSize: "0.68rem", color: "#ccc", textAlign: "center", marginTop: 20 }}>
              Made with ⚡ gosite.lol
            </p>
          </div>
        </div>
      </div>

      {generated && (
        <div className="panel" style={{ marginTop: 24, textAlign: "center" }}>
          <h3 className="display" style={{ fontSize: "1.1rem" }}>🎉 Your page is ready!</h3>
          <p style={{ color: "var(--ivory-dim)", marginTop: 8, fontSize: "0.88rem" }}>
            To get a permanent link like <strong style={{ color: "var(--gold)" }}>gosite.lol/biz/{(biz.name || "your-business").toLowerCase().replace(/[^a-z0-9]+/g, "-")}</strong>,
            sign up and we'll host it for free.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
            <a href="/auth/signin" className="l-btn-primary">Sign up to publish — free</a>
          </div>
          <p style={{ color: "var(--ivory-dim)", marginTop: 16, fontSize: "0.82rem" }}>
            <strong>Premium features (₹99/mo):</strong> Custom colors, analytics, QR code, remove GoSite branding, custom domain
          </p>
        </div>
      )}
    </>
  );
}
