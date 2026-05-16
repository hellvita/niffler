# Niffler

Personal finance tracker for daily expense and income entry, monthly overviews, and analytics.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and TanStack Query. Consumes a .NET REST API running on `http://localhost:5048`.

## Features

- **Day view** — enter and edit expenses per category and daily income for any date
- **Month view** — monthly totals, day-by-day breakdown, over-budget day highlighting
- **Analytics** — custom date range with pie, bar, and line charts; auto-bucketing by day / week / month
- **Settings** — manage initial budget, categories (add, rename, archive, merge), and daily limit history
- **Import** — guided 4-stage wizard for importing historical data from xlsx files
- **Export** — download a month's data as xlsx

## Getting Started

Make sure the .NET API is running on port 5048, then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15, App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Server state | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Auth | JWT stored in `httpOnly` cookie, proxied to .NET API |
