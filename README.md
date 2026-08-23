# The Ledger — White-Label Business Directory Platform

**Launch a ranked local business directory in any city, any niche, in under 10 minutes.**

A complete, production-ready SaaS platform where businesses get ranked by a transparent formula:
**Rank Score = Trust Score (earned from reviews) + Visibility Score (paid subscriptions or leads).**

Payment moves visibility — never the underlying trust. This is what makes businesses pay to stay visible, and what makes customers trust the ranking.

---

## What You Get

### For Business Owners (Your Customers)
- **Free listing** in any directory index
- **Owner dashboard** with views, clicks, CTR, rank history, competitor insights
- **Two ways to boost visibility**: monthly subscription ($5–$50) or pay-per-WhatsApp-lead
- **Embeddable rank badge** for their own website
- **Review collection** that directly improves their Trust Score
- **Referral program**: invite 3 businesses, get a free visibility boost

### For You (Platform Admin)
- **Admin dashboard** with total revenue, users, listings, subscriptions
- **Stripe payments** built in — subscriptions activate instantly after checkout
- **White-label config** — change name, colors, pricing, currency in one file
- **Setup wizard** — first visit creates your admin account
- **Cron job** for subscription expiry, rank snapshots, and lead decay
- **28 API routes** all validated, rate-limited, and production-hardened

### Revenue Streams
1. **Subscription tiers** — businesses pay $5–$50/mo for visibility boost
2. **Pay-per-lead** — charge per WhatsApp contact click
3. **Index creation fees** — charge to create new directory categories (optional)
4. **Sell the code itself** — white-label means anyone can deploy for their market

---

## Quick Start

```bash
git clone <your-repo>
cd site-ranking-platform
npm install
cp .env.local.example .env.local  # edit with your MongoDB + Stripe keys
npm run seed                       # load demo data (8 indexes, 33 businesses, 378 reviews)
npm run dev                        # http://localhost:3000
```

Visit `/setup` to create your admin account on first launch.

## Deploy to Vercel (One Click)

1. Push to GitHub
2. Import in [vercel.com/new](https://vercel.com/new)
3. Add environment variables (see `.env.local.example`)
4. Deploy — live in 60 seconds

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string (Atlas recommended) |
| `NEXTAUTH_SECRET` | Yes | Random string for JWT signing |
| `NEXTAUTH_URL` | Yes | Your deployed URL |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (test or live) |
| `STRIPE_WEBHOOK_SECRET` | For production | Stripe webhook signing secret |
| `LEAD_COST_DEFAULT` | No | Default lead cost (default: 2) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth secret |

## White-Label Customization

Edit `lib/config.js` to change:
- Site name, tagline, logo
- Subscription tier names and prices
- Currency (USD, INR, EUR, etc.)
- Feature toggles (chat, referrals, embed badge)
- Color scheme

No code changes needed — just edit the config and redeploy.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run seed` | Load demo data (33 businesses across 5 Indian cities) |
| `npm run cron` | Run daily: expire subscriptions, snapshot ranks, decay leads |

## Tech Stack

- **Next.js 14** (App Router)
- **MongoDB** + Mongoose
- **NextAuth** (email/password + Google OAuth)
- **Stripe** Checkout + Webhooks
- **No external CSS framework** — custom dark theme, fully responsive

## Pages & Routes (28 total)

| Page | Description |
|---|---|
| `/` | Marketing landing page with hero, features, pricing |
| `/auth/signin` | Sign in / Register |
| `/setup` | First-time admin setup wizard |
| `/dashboard` | Owner dashboard with analytics + insights |
| `/admin` | Admin dashboard (revenue, users, listings) |
| `/browse` | Browse by city and category |
| `/browse/city/[city]` | All indexes in a city |
| `/browse/category/[cat]` | All indexes in a category |
| `/indexes/[slug]` | Leaderboard + join form + chat |
| `/listings/[id]` | Business profile + reviews + subscription + embed |

## License

Commercial license included. You may deploy, modify, and resell.
