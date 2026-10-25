import type { Lead, LeadSource, SearchQuery } from "@/lib/leads/types";

// Outscraper Google Maps search (scraping provider). Runs on a separate
// account from Google Cloud, so the official API key is never at risk.
// https://app.outscraper.com/api-docs#tag/Google-Maps/paths/~1maps~1search-v3/get
const ENDPOINT = "https://api.app.outscraper.com/maps/search-v3";

interface OutscraperPlace {
  place_id?: string;
  google_id?: string;
  name?: string;
  type?: string;
  category?: string;
  full_address?: string;
  city?: string;
  phone?: string;
  site?: string;
  rating?: number;
  reviews?: number;
  location_link?: string;
  latitude?: number;
  longitude?: number;
  business_status?: string;
}

export function mapOutscraperPlace(place: OutscraperPlace, city: string): Lead {
  return {
    sourceId: place.place_id ?? place.google_id ?? `${place.name}-${place.full_address}`,
    source: "outscraper",
    name: place.name ?? "(tanpa nama)",
    category: place.type ?? place.category ?? null,
    address: place.full_address ?? null,
    city: place.city ?? city,
    phone: place.phone ?? null,
    website: place.site ?? null,
    rating: place.rating ?? null,
    reviewCount: place.reviews ?? null,
    mapsUrl: place.location_link ?? null,
    lat: place.latitude ?? null,
    lng: place.longitude ?? null,
    isOperational: !place.business_status || place.business_status === "OPERATIONAL",
  };
}

export const outscraperSource: LeadSource = {
  id: "outscraper",
  label: "Outscraper (scraping)",
  isConfigured: () => !!process.env.OUTSCRAPER_API_KEY,

  async search({ keyword, city, limit = 60 }: SearchQuery): Promise<Lead[]> {
    const apiKey = process.env.OUTSCRAPER_API_KEY;
    if (!apiKey) throw new Error("OUTSCRAPER_API_KEY belum diisi");

    const params = new URLSearchParams({
      query: `${keyword}, ${city}, Indonesia`,
      limit: String(limit),
      language: "id",
      region: "ID",
      async: "false",
    });
    const res = await fetch(`${ENDPOINT}?${params}`, {
      headers: { "X-API-KEY": apiKey },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Outscraper error ${res.status}: ${await res.text()}`);
    }
    // One result list per query; we send a single query.
    const data: { data?: OutscraperPlace[][] } = await res.json();
    return (data.data?.[0] ?? []).map((p) => mapOutscraperPlace(p, city));
  },
};
