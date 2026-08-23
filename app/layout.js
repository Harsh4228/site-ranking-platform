import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import Providers from "./Providers";
import SearchBar from "./SearchBar";
import AuthNav from "./AuthNav";
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <Providers>
          <header className="site-header">
            <a href="/" className="brand">
              <span className="brand-mark">⚡</span> GoSite
            </a>
            <SearchBar />
            <nav className="header-nav">
              <a href="/browse" className="nav-link">Browse</a>
              <AuthNav />
            </nav>
          </header>
          <main>{children}</main>
          <footer className="site-footer">
            GoSite — Trusted local business rankings. Rank Score = Trust + Visibility.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
