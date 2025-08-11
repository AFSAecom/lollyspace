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

## Automatic Promotions

Automatic promotion calculation is gated by the `PROMO_V2_ENABLED` feature flag. Set the flag on both the server and web client to enable it.

For staging, add the following to `.env.staging` and `web/.env`:

```bash
PROMO_V2_ENABLED=true
VITE_PROMO_V2_ENABLED=true
```

## Deployment

### Deploy on Vercel
Use the included `vercel.json` which builds the `web` package and rewrites all routes to `index.html` for single‑page app fallback. Import the repository on Vercel and deploy.

### Deploy on Netlify
`netlify.toml` configures a Vite build from the `web` directory and a `/*` to `/index.html` redirect. Connect the repo on Netlify and trigger a deploy.

### Docker
Build and run the container locally:

```bash
docker compose build
docker compose up -d
```

Verify the health endpoint:

```bash
curl http://localhost:8080/healthz
```

## Release

Tag and push the `v1.0.0` release:

- Navigate to **Actions ▸ Create Tag (manual) ▸ Run workflow**.
- Leave the version blank to default to `web/package.json` (currently `1.0.0`).
- After the workflow succeeds, monitor the **Release** job, which builds artifacts and creates the draft release with `web-dist-v1.0.0.zip` and the changelog.
