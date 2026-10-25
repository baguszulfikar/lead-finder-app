# Client Finder (lead-finder-app)

Find sales leads for B2B service sellers in Indonesia from Google Maps listings,
rank them for the kind of service you sell, and reach out over WhatsApp.

Stack: Next.js (App Router, TypeScript) + Tailwind, Supabase, deployed on Vercel.
The UI is in Bahasa Indonesia.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional: works with sample data and no keys
npm run dev                  # http://localhost:3000
npm test                     # unit tests (vitest)
```

With no API keys the app uses the **Data contoh** (mock) source so you can try
the full flow: search, ranking, WhatsApp links and CSV export.

## How it fits together

```
src/lib/leads/types.ts      Lead: the common model every source maps into
src/lib/leads/presets.ts    4 seller presets (digital, software, professional, facility)
src/lib/leads/scoring.ts    0-100 score + reasons, per preset
src/lib/leads/whatsapp.ts   Indonesian phone normalization, wa.me links
src/lib/sources/            one adapter per data source
  google-places.ts          official Google Places API (New), Text Search
  outscraper.ts             scraping provider (separate account from Google Cloud)
  mock.ts                   deterministic sample data
src/app/api/search/route.ts POST /api/search: search -> rank -> (save)
src/lib/supabase/server.ts  saves searches + leads when Supabase is configured
supabase/migrations/        database schema
```

Adding a source (for example Apify or OpenStreetMap) means writing one adapter
that returns `Lead[]` and registering it in `src/lib/sources/index.ts`.

## Configuration

See `.env.example`. All keys are optional at this stage:

| Variable | Used for |
| --- | --- |
| `GOOGLE_PLACES_API_KEY` | Official Google Places source |
| `OUTSCRAPER_API_KEY` | Scraping source |
| `LEAD_SOURCE_DEFAULT` | Source selected by default in the form |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Saving searches (run `supabase/migrations/0001_init.sql` first) |

Scraping Google Maps through a provider is against Google's Terms of Service.
Keep the provider account separate from the Google Cloud project that holds the
official API key.
