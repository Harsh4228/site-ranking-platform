import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import Providers from "./Providers";
import SearchBar from "./SearchBar";
import AuthNav from "./AuthNav";
import Tracker from "./Tracker";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "GoSite — Find Trusted Local Businesses",
  description: "GoSite — Find and rank trusted local businesses near you. Real reviews, transparent scoring.",
  openGraph: {
    title: "GoSite — Find Trusted Local Businesses",
    description: "Find and rank trusted local businesses near you.",
    type: "website",
  },
  other: {
    "google-adsense-account": "ca-pub-3162935620653640",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3162935620653640"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <Providers>
          <header className="site-header">
            <a href="/" className="brand">
              <span className="brand-mark">⚡</span> GoSite
            </a>
            <SearchBar />
            <nav className="header-nav">
              <a href="/browse" className="nav-link">Browse</a>
              <a href="/tools" className="nav-link">Free Tools</a>
              <a href="/buy" className="nav-link" style={{ color: "var(--gold)" }}>Buy Template</a>
              <AuthNav />
            </nav>
          </header>
          <Tracker />
          <main>{children}</main>
          <footer className="site-footer">
            GoSite — Trusted local business rankings. <a href="/buy" style={{ color: "var(--gold)" }}>Buy this template — $99</a>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
