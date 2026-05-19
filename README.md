# Niffler

Personal finance tracker for daily expense and income entry, monthly overviews, and analytics.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and TanStack Query. Consumes a .NET REST API backend.

## Features

- **Day view** — enter and edit expenses per category and daily income for any date
- **Month view** — monthly totals, day-by-day breakdown, over-budget day highlighting
- **Analytics** — custom date range with pie, bar, and line charts; auto-bucketing by day / week / month
- **Settings** — manage initial budget, categories (add, rename, archive, merge), and daily limit history
- **Import** — guided 4-stage wizard for importing historical data from xlsx files
- **Export** — download a month's data as xlsx, or export all months at once as a ZIP archive (one file per month) or a single combined xlsx

## Prerequisites

- Node.js 20+
- The .NET backend API running on `http://localhost:5048` (see the backend project for setup)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.local.example` to `.env.local` if you need to override the backend URL:

```env
BACKEND_URL=http://localhost:5048
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit and component tests (Vitest, watch mode) |
| `npm run test:run` | Run unit and component tests once |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |

## Testing

### Unit and component tests (Vitest + React Testing Library)

```bash
npm run test:run
```

Tests live in `__tests__/`. MSW intercepts all fetch calls so no running server is needed.

### End-to-end tests (Playwright)

E2E tests require the full stack (Next.js + .NET backend) to be running.

```bash
# Both servers on localhost
npm run test:e2e

# Servers running on a different host (e.g. WSL2 accessing Windows)
PLAYWRIGHT_BASE_URL=http://192.168.240.1:3000 \
PLAYWRIGHT_BACKEND_URL=http://192.168.240.1:5048 \
npm run test:e2e
```

E2E tests live in `e2e/`. The `authenticated` fixture automatically registers a throwaway user and injects auth cookies before each test.

## Project Structure

```
app/                  Next.js App Router pages and API routes
  (app)/              Authenticated app routes (day, month, analytics, settings, import)
  (auth)/             Unauthenticated routes (login, register)
  api/
    auth/             Register / login / logout API route handlers
    proxy/            Transparent proxy to the .NET backend (adds auth cookie)
components/           React components organised by feature
  auth/
  day/
  month/
  analytics/
  settings/
  import/
  shared/             Reusable UI (DateNavigator, ConfirmDialog, …)
lib/
  api/                Typed fetch wrappers for every backend endpoint
  hooks/              TanStack Query hooks (useCategories, useDaySummary, …)
  utils/              Pure utility functions (date aggregation, chart helpers, …)
  validation/         Zod schemas shared between forms and API handlers
__tests__/            Unit and component tests (mirrors src structure)
e2e/                  Playwright end-to-end tests
src/test/             Test infrastructure (MSW handlers, render helpers, setup)
```

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Server state | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Auth | JWT in `httpOnly` cookie, proxied to .NET API |
| Unit/component tests | Vitest + React Testing Library + MSW |
| E2E tests | Playwright |
