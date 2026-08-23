"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function NewListingForm({ indexId }) {
  const { data: session } = useSession();
  const [form, setForm] = useState({ name: "", description: "", whatsapp: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!session) {
      window.location.href = "/auth/signin";
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, indexId }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    setSuccess(true);
    setForm({ name: "", description: "", whatsapp: "", phone: "", email: "", website: "", address: "", hours: "" });
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h3 className="display" style={{ fontSize: "1.1rem" }}>Join this index — free</h3>
      {!session && (
        <p style={{ color: "var(--ivory-dim)", fontSize: "0.85rem", marginTop: 8 }}>
          <a href="/auth/signin" style={{ color: "var(--gold)" }}>Sign in</a> to list your business and track it from your dashboard.
        </p>
      )}
      <label>Business name *</label>
      <input value={form.name} onChange={update("name")} required placeholder="e.g. Sharma Plumbing Works" />
      <label>Description</label>
      <textarea rows="2" value={form.description} onChange={update("description")} placeholder="What does your business do?" />
      <label>Phone number</label>
      <input value={form.phone} onChange={update("phone")} placeholder="9876543210" />
      <label>WhatsApp number</label>
      <input value={form.whatsapp} onChange={update("whatsapp")} placeholder="+919876543210" />
      <label>Email</label>
      <input type="email" value={form.email} onChange={update("email")} placeholder="you@business.com" />
      <label>Address</label>
      <input value={form.address} onChange={update("address")} placeholder="Shop 12, Andheri West, Mumbai" />
      <label>Working hours</label>
      <input value={form.hours} onChange={update("hours")} placeholder="Mon-Sat 9AM-7PM" />
      <label>Website</label>
      <input value={form.website} onChange={update("website")} placeholder="https://…" />
      {error && <p style={{ color: "var(--sponsored)", fontSize: "0.85rem" }}>{error}</p>}
      {success && <p style={{ color: "var(--organic)", fontSize: "0.85rem" }}>Listed! Redirecting…</p>}
      <button disabled={busy} type="submit">
        {busy ? "Joining…" : session ? "Join free" : "Sign in & join"}
      </button>
    </form>
  );
}
