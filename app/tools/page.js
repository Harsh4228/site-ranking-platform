export async function generateMetadata() {
  return {
    title: "Free Business Tools — GoSite",
    description: "Free tools for Indian businesses: Invoice Generator, GST Calculator, QR Code Generator, and more.",
  };
}

export default function ToolsPage() {
  const tools = [
    { name: "Business Link Page", desc: "Create a beautiful one-page business card with WhatsApp, links, and contact info. Like Linktree for businesses.", href: "/tools/bizlink", icon: "⚡", tag: "Most popular" },
    { name: "WhatsApp Link Generator", desc: "Create a click-to-chat link with pre-filled message + QR code. Perfect for business cards and social bios.", href: "/tools/whatsapp-link", icon: "💬", tag: "Free" },
    { name: "Invoice Generator", desc: "Create professional GST invoices in seconds. Print or save as PDF.", href: "/tools/invoice", icon: "📄", tag: "Free" },
    { name: "GST Calculator", desc: "Calculate GST with CGST/SGST breakup. Inclusive and exclusive modes.", href: "/tools/gst", icon: "🧮", tag: "Free" },
  ];

  return (
    <>
      <h1 className="display hero-title">Free Business Tools</h1>
      <p className="hero-sub">
        Essential tools for Indian businesses and freelancers. No signup required. 100% free.
      </p>

      <div className="l-features" style={{ marginTop: 32 }}>
        {tools.map((tool) => (
          <a key={tool.name} href={tool.href} className="l-feature" style={{ textDecoration: "none", position: "relative" }}>
            {tool.tag && (
              <span style={{
                position: "absolute", top: 12, right: 12, fontSize: "0.65rem",
                background: tool.tag === "Most popular" ? "var(--gold)" : "var(--ink-line)",
                color: tool.tag === "Most popular" ? "var(--ink)" : "var(--ivory-dim)",
                padding: "2px 8px", borderRadius: 999, fontWeight: 600
              }}>{tool.tag}</span>
            )}
            <div className="l-feature-icon">{tool.icon}</div>
            <h3>{tool.name}</h3>
            <p>{tool.desc}</p>
          </a>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 32, textAlign: "center" }}>
        <h3 className="display" style={{ fontSize: "1.1rem" }}>Want more customers?</h3>
        <p style={{ color: "var(--ivory-dim)", marginTop: 8 }}>
          List your business on GoSite for free. Get found by customers searching for your services.
        </p>
        <a href="/promote" className="l-btn-primary" style={{ marginTop: 12, display: "inline-block" }}>
          Promote your business — free
        </a>
      </div>
    </>
  );
}
