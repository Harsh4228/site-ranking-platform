"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [refId, setRefId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("ref")) {
      setRefId(params.get("ref"));
      setMode("register");
    }
  }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    if (mode === "register") {
      const res = await fetch("/api/auth/register", {
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

      // Track referral if present
      if (refId && data.user?.id) {
        fetch("/api/referral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referrerId: refId, referredUserId: data.user.id }),
        }).catch(() => {});
      }
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setBusy(false);
    if (result?.error) {
      setError("Invalid email or password");
      return;
    }
    window.location.href = "/dashboard";
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1 className="display" style={{ fontSize: "1.8rem", textAlign: "center" }}>
        {mode === "login" ? "Sign In" : "Create Account"}
      </h1>
      <p style={{ color: "var(--ivory-dim)", textAlign: "center", marginTop: 8, fontSize: "0.9rem" }}>
        {mode === "login"
          ? "Sign in to manage your listings and track your rank."
          : "Create an account to list your business and start ranking."}
      </p>

      <form className="panel" onSubmit={handleSubmit}>
        {mode === "register" && (
          <>
            <label>Name</label>
            <input value={form.name} onChange={update("name")} required placeholder="Your name" />
          </>
        )}
        <label>Email</label>
        <input type="email" value={form.email} onChange={update("email")} required placeholder="you@example.com" />
        <label>Password</label>
        <input type="password" value={form.password} onChange={update("password")} required placeholder="••••••" minLength={6} />
        {error && <p style={{ color: "var(--danger, #D45B5B)", fontSize: "0.85rem", marginTop: 8 }}>{error}</p>}
        <button disabled={busy} type="submit" style={{ width: "100%" }}>
          {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 16, fontSize: "0.85rem", color: "var(--ivory-dim)" }}>
        {mode === "login" ? (
          <>
            Don't have an account?{" "}
            <button className="secondary" onClick={() => { setMode("register"); setError(null); }}
              style={{ display: "inline", padding: "4px 8px", marginTop: 0, fontSize: "0.85rem" }}>
              Register
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button className="secondary" onClick={() => { setMode("login"); setError(null); }}
              style={{ display: "inline", padding: "4px 8px", marginTop: 0, fontSize: "0.85rem" }}>
              Sign In
            </button>
          </>
        )}
      </p>
    </div>
  );
}
