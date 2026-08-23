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
  title: "The Ledger — Ranked Local Directories",
  description: "Trust-scored, transparently ranked business directories. Rank Score = Trust Score (earned) + Visibility Score (paid).",
  openGraph: {
    title: "The Ledger — Ranked Local Directories",
    description: "Trust-scored, transparently ranked business directories.",
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
              <span className="brand-mark">§</span> The Ledger
            </a>
            <SearchBar />
            <nav className="header-nav">
              <a href="/browse" className="nav-link">Browse</a>
              <AuthNav />
            </nav>
          </header>
          <main>{children}</main>
          <footer className="site-footer">
            Rank Score = Trust Score (earned) + Visibility Score (paid). Sponsored placement is always labeled.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
