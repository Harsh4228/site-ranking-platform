"use client";
import { useState } from "react";

export default function ListingActions({ listing }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submitReview = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/listings/${listing._id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: Number(rating), comment }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    setComment("");
    window.location.reload();
  };

  // A paid lead click — cost is a placeholder flat rate for this demo (Path B pricing).
  const contactViaWhatsapp = async () => {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: listing._id }),
    });
    if (listing.whatsapp) {
      window.open(`https://wa.me/${listing.whatsapp.replace(/[^0-9]/g, "")}`, "_blank");
    }
    window.location.reload();
  };

  return (
    <>
      <button onClick={contactViaWhatsapp} style={{ marginTop: 20 }}>
        Contact via WhatsApp
      </button>

      <form className="panel" onSubmit={submitReview}>
        <h3 className="display" style={{ fontSize: "1.1rem" }}>Leave a review</h3>
        <label>Rating</label>
        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n} star{n === 1 ? "" : "s"}</option>
          ))}
        </select>
        <label>Comment</label>
        <textarea rows="2" value={comment} onChange={(e) => setComment(e.target.value)} />
        {error && <p style={{ color: "var(--sponsored)", fontSize: "0.85rem" }}>{error}</p>}
        <button disabled={busy} type="submit">{busy ? "Submitting…" : "Submit review"}</button>
      </form>
    </>
  );
}
