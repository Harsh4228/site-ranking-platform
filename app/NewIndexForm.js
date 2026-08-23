"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewIndexForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", category: "", city: "", sizeLimit: 20 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/indexes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    router.push(`/indexes/${data.index.slug}`);
    router.refresh();
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h3 className="display" style={{ fontSize: "1.1rem" }}>Start a new index</h3>
      <label>Index name</label>
      <input placeholder="Best Plumbers" value={form.name} onChange={update("name")} required />
      <label>Category</label>
      <input placeholder="Plumbing" value={form.category} onChange={update("category")} required />
      <label>City</label>
      <input placeholder="Mumbai" value={form.city} onChange={update("city")} required />
      <label>Size limit</label>
      <input type="number" min="1" value={form.sizeLimit} onChange={update("sizeLimit")} />
      {error && <p style={{ color: "var(--sponsored)", fontSize: "0.85rem" }}>{error}</p>}
      <button disabled={busy} type="submit">{busy ? "Creating…" : "Create index"}</button>
    </form>
  );
}
