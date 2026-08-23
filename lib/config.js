// Site-wide configuration. Buyers customize this one file to white-label the platform.
// No code changes needed — just edit these values and deploy.

const siteConfig = {
  // Branding
  name: "The Ledger",
  tagline: "Trust + Visibility, never one for the other",
  description: "Trust-scored, transparently ranked business directories.",
  logo: "§", // text or emoji logo mark
  domain: process.env.NEXT_PUBLIC_DOMAIN || "theledger.app",

  // Pricing (change currency and amounts for your market)
  currency: process.env.NEXT_PUBLIC_CURRENCY || "USD",
  currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$",
  tiers: [
    { tier: 1, name: "Starter", price: 5, boost: 15, desc: "Basic visibility boost" },
    { tier: 2, name: "Growth", price: 15, boost: 30, desc: "2× visibility for growing businesses" },
    { tier: 3, name: "Pro", price: 30, boost: 45, desc: "Serious competitive advantage" },
    { tier: 4, name: "Leader", price: 50, boost: 60, desc: "Maximum visibility boost" },
  ],
  leadCost: Number(process.env.LEAD_COST_DEFAULT || "2"),

  // Colors (CSS custom properties)
  colors: {
    ink: "#0B1520",
    inkPanel: "#131F2E",
    inkLine: "#1E3348",
    gold: "#D4A843",
    ivory: "#F3EFE3",
    organic: "#6FA890",
    sponsored: "#E0A458",
  },

  // Features toggles
  features: {
    chat: true,
    referrals: true,
    embedBadge: true,
    payPerLead: true,
    subscriptions: true,
    googleAuth: !!process.env.GOOGLE_CLIENT_ID,
  },

  // Contact
  supportEmail: process.env.SUPPORT_EMAIL || "support@theledger.app",
};

export default siteConfig;
