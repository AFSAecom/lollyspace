# Le Compas Olfactif

Monorepo containing the web client and Supabase backend for the fragrance sales platform.

## Getting Started

### Prerequisites
- Node.js 20+
- Supabase CLI

### Setup
```bash
npm install
cd web && npm install
```

Copy `.env.example` to `web/.env` and fill in:
```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ANALYTICS_KEY=your-analytics-key
```

For staging deployments, start from `.env.staging`:
```bash
cp .env.staging web/.env
```

### Development
```bash
cd web
npm run dev
```

## Supabase
Migrations reside in `supabase/migrations` and seeds in `supabase/seeds`.
Run `supabase db reset` to apply them locally.

## Playwright E2E
Run the end-to-end suite from the `web` package:
```bash
cd web
npm run test:e2e
```

This executes four scenarios:
1. Admin exports sales and commissions.
2. Advisor completes a sale and reduces stock.
3. Client searches for and purchases a product.
4. Referral purchase generates commissions and an admin pays them.

On failure, screenshots and videos are stored under `web/test-results/` in a folder named for the failing test.

## Documentation

- [Acceptance Testing Guide](docs/acceptance.md)
- [UAT Checklist v1](docs/uat_v1.md)
