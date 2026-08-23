"use client";
import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const search = async (q) => {
    setQuery(q);
    if (q.length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }

    setBusy(true);
    setOpen(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch {}
    setBusy(false);
  };

  const total = results
    ? (results.indexes?.length || 0) + (results.listings?.length || 0)
    : 0;

  return (
    <div className="search-wrap">
      <input
        className="search-input"
        type="search"
        placeholder="Search indexes & listings…"
        value={query}
        onChange={(e) => search(e.target.value)}
        onFocus={() => query.length >= 2 && setOpen(true)}
      />
      {open && results && (
        <div className="search-dropdown">
          {total === 0 && !busy && (
            <div className="search-empty">No results for "{query}"</div>
          )}
          {busy && <div className="search-empty">Searching…</div>}

          {results.indexes?.length > 0 && (
            <div className="search-group">
              <div className="search-group-label">Indexes</div>
              {results.indexes.map((idx) => (
                <a
                  key={idx._id}
                  href={`/indexes/${idx.slug}`}
                  className="search-result"
                  onClick={() => setOpen(false)}
                >
                  <span className="search-result-name">{idx.name}</span>
                  <span className="search-result-meta">{idx.category} · {idx.city}</span>
                </a>
              ))}
            </div>
          )}

          {results.listings?.length > 0 && (
            <div className="search-group">
              <div className="search-group-label">Listings</div>
              {results.listings.map((l) => (
                <a
                  key={l._id}
                  href={`/listings/${l._id}`}
                  className="search-result"
                  onClick={() => setOpen(false)}
                >
                  <span className="search-result-name">{l.name}</span>
                  <span className="search-result-meta">
                    Rank {l.rankScore} · {l.reviewCount} reviews
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
      {open && <div className="search-overlay" onClick={() => setOpen(false)} />}
    </div>
  );
}
