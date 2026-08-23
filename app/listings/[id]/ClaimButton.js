"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function ClaimButton({ listingId, ownerId }) {
  const { data: session } = useSession();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // Already claimed or user is the owner
  if (ownerId) return null;
  if (!session) return null;

  const claim = async () => {
    setBusy(true);
    const res = await fetch(`/api/listings/${listingId}/claim`, { method: "POST" });
    setBusy(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => window.location.reload(), 600);
    }
  };

  if (done) return <p style={{ color: "var(--organic)", fontSize: "0.85rem" }}>Claimed! This listing is now on your dashboard.</p>;

  return (
    <button className="secondary" onClick={claim} disabled={busy} style={{ marginTop: 12 }}>
      {busy ? "Claiming…" : "🏷️ Claim this listing — it's yours"}
    </button>
  );
}
