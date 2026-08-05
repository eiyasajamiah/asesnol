# Asesnol — Automated Trading Platform Website

Next.js website with bilingual support (Arabic / English), user registration, internal wallet, referral system, and profit-share calculation.

## Features

- **Bilingual** (AR / EN) via next-intl
- **Registration & Login** with secure session cookies
- **Referral system**: base 50% profit share + 20% per successful referral (max 100%)
- **Early bird**: first 50 users get 100% share for 30 days
- **Internal wallet**: deposit requests (manual approval by admin)
- **Demo performance** page with clear Demo labels
- **Risk disclaimer** pages

## Quick Start

```bash
cd asesnol-website
npm install
npm run dev
```

Open:
- Arabic: http://localhost:3000/ar
- English: http://localhost:3000/en

## Environment (optional)

Create `.env.local`:

```
SESSION_SECRET=your-long-random-secret
ADMIN_SECRET=your-admin-key
```

## Admin: Approve Deposits

List pending deposits:

```bash
curl -H "x-admin-key: your-admin-key" http://localhost:3000/api/admin/deposits
```

Approve a deposit:

```bash
curl -X POST -H "x-admin-key: your-admin-key" -H "Content-Type: application/json" \
  -d '{"depositId":"UUID-HERE","action":"approve"}' \
  http://localhost:3000/api/admin/deposits
```

Default admin key (dev only): `asesnol-admin-change-me`

## Data Storage

User and deposit data are stored as JSON files in `/data` (gitignored):
- data/users.json
- data/deposits.json

For production, migrate to PostgreSQL / Supabase.

## Profit Share Logic

| Referrals | Investor Share |
|-----------|----------------|
| 0         | 50%            |
| 1         | 70%            |
| 2         | 90%            |
| 3+        | 100%           |

Early bird (first 50 users, within 30 days of signup): 100% regardless of referrals.

## Next Steps

1. Add How-it-works / Pricing / FAQ pages
2. AI chat agent (Grok API)
3. Real payment gateway or crypto deposits
4. Admin dashboard UI
5. Connect live MT5 results
6. Deploy on Vercel + custom domain (asesnol.com / asesnol.ai)


## Admin Panel (UI)

Open: http://localhost:3000/ar/admin

Default key: `asesnol-admin-change-me`

Features:
- View & approve/reject deposit requests
- View all registered users, balances, referral counts

## AI Chat Agent

Open: http://localhost:3000/ar/chat

- Works offline with a built-in knowledge base (FAQ)
- To enable Grok: set `XAI_API_KEY` in `.env.local` and restart
- Get API key: https://console.x.ai
