"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

export default function SetupPage() {
  const [needed, setNeeded] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/setup").then((r) => r.json()).then((d) => setNeeded(d.setupNeeded));
  }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setBusy(false);
      return;
    }

    setDone(true);

    // Auto sign in as admin
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    window.location.href = "/admin";
  };

  if (needed === null) return <p style={{ textAlign: "center", color: "var(--ivory-dim)", marginTop: 60 }}>Loading…</p>;

  if (needed === false) {
    return (
      <div style={{ maxWidth: 400, margin: "60px auto", textAlign: "center" }}>
        <h1 className="display" style={{ fontSize: "1.8rem" }}>Setup Complete</h1>
        <p style={{ color: "var(--ivory-dim)", marginTop: 12 }}>
          This platform is already configured. <a href="/auth/signin" style={{ color: "var(--gold)" }}>Sign in</a> to continue.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ maxWidth: 400, margin: "60px auto", textAlign: "center" }}>
        <h1 className="display" style={{ fontSize: "1.8rem" }}>🎉 You're all set!</h1>
        <p style={{ color: "var(--ivory-dim)", marginTop: 12 }}>Redirecting to admin dashboard…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1 className="display" style={{ fontSize: "2rem", textAlign: "center" }}>Welcome to Setup</h1>
      <p style={{ color: "var(--ivory-dim)", textAlign: "center", marginTop: 8 }}>
        Create your admin account to start running your directory platform.
      </p>

      <form className="panel" onSubmit={handleSubmit}>
        <label>Your name</label>
        <input value={form.name} onChange={update("name")} required placeholder="Admin name" />
        <label>Email</label>
        <input type="email" value={form.email} onChange={update("email")} required placeholder="admin@yourdomain.com" />
        <label>Password</label>
        <input type="password" value={form.password} onChange={update("password")} required minLength={6} placeholder="Min 6 characters" />
        {error && <p style={{ color: "var(--danger, #D45B5B)", fontSize: "0.85rem", marginTop: 8 }}>{error}</p>}
        <button disabled={busy} type="submit" style={{ width: "100%" }}>
          {busy ? "Creating…" : "Create Admin Account"}
        </button>
      </form>

      <div className="panel" style={{ marginTop: 16, fontSize: "0.82rem", color: "var(--ivory-dim)" }}>
        <strong style={{ color: "var(--ivory)" }}>What happens next:</strong>
        <ol style={{ paddingLeft: 18, marginTop: 8, lineHeight: 1.7 }}>
          <li>You'll be signed in as admin</li>
          <li>Run <code style={{ color: "var(--gold)" }}>npm run seed</code> to load demo data</li>
          <li>Customize <code style={{ color: "var(--gold)" }}>lib/config.js</code> with your branding</li>
          <li>Add your Stripe keys to <code style={{ color: "var(--gold)" }}>.env.local</code></li>
          <li>Deploy and start inviting businesses</li>
        </ol>
      </div>
    </div>
  );
}
