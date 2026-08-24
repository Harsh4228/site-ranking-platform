"use client";

export default function ShareButtons({ name, listingId }) {
  const base = typeof window !== "undefined" ? window.location.origin : "https://gosite.lol";
  const url = `${base}/listings/${listingId}`;
  const text = `Check out ${name} on GoSite — ranked by real reviews!`;

  const share = (platform) => {
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    alert("Link copied!");
  };

  return (
    <div className="share-buttons">
      <span className="share-label">Share:</span>
      <button onClick={() => share("whatsapp")} className="share-btn" title="WhatsApp">📱</button>
      <button onClick={() => share("twitter")} className="share-btn" title="Twitter/X">𝕏</button>
      <button onClick={() => share("facebook")} className="share-btn" title="Facebook">📘</button>
      <button onClick={() => share("linkedin")} className="share-btn" title="LinkedIn">💼</button>
      <button onClick={copyLink} className="share-btn" title="Copy link">🔗</button>
    </div>
  );
}
