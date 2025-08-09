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

Create a `.env` file in `web/` with:
```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Development
```bash
cd web
npm run dev
```

## Supabase
Migrations reside in `supabase/migrations` and seeds in `supabase/seeds`.
Run `supabase db reset` to apply them locally.
