# lollyspace

## Local Development

1. Install dependencies and start the dev server:
   ```bash
   cd web
   npm install
   npm run dev
   ```
2. Run database migrations with Supabase:
   ```bash
   supabase db reset --use-migrations
   ```

## Environment Variables

Create a `.env` file in the repository root with the following keys:

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
DATABASE_URL=
VERCEL_ORG_ID=
VERCEL_PROJECT_ID=
```
