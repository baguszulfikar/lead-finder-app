import type { Lead, LeadSource, SearchQuery } from "@/lib/leads/types";

// Google Places API (New), Text Search.
// https://developers.google.com/maps/documentation/places/web-service/text-search
const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";

// Only request the fields we use: Places bills by field mask tier.
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.primaryTypeDisplayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.location",
  "places.businessStatus",
  "nextPageToken",
].join(",");

const PAGE_SIZE = 20;

interface GooglePlace {
  id: string;
  displayName?: { text: string };
  primaryTypeDisplayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  location?: { latitude: number; longitude: number };
  businessStatus?: string;
}

export function mapGooglePlace(place: GooglePlace, city: string): Lead {
  return {
    sourceId: place.id,
    source: "google",
    name: place.displayName?.text ?? "(tanpa nama)",
    category: place.primaryTypeDisplayName?.text ?? null,
    address: place.formattedAddress ?? null,
    city,
    phone: place.internationalPhoneNumber ?? place.nationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? null,
    mapsUrl: place.googleMapsUri ?? null,
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
    isOperational: !place.businessStatus || place.businessStatus === "OPERATIONAL",
  };
}

export const googlePlacesSource: LeadSource = {
  id: "google",
  label: "Google Places API (resmi)",
  isConfigured: () => !!process.env.GOOGLE_PLACES_API_KEY,

  async search({ keyword, city, limit = 60 }: SearchQuery): Promise<Lead[]> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY belum diisi");

    const leads: Lead[] = [];
    let pageToken: string | undefined;
    // Text Search returns at most 60 results across 3 pages.
    do {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": FIELD_MASK,
        },
        body: JSON.stringify({
          textQuery: `${keyword} di ${city}`,
          languageCode: "id",
          regionCode: "ID",
          pageSize: PAGE_SIZE,
          pageToken,
        }),
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`Google Places error ${res.status}: ${await res.text()}`);
      }
      const data: { places?: GooglePlace[]; nextPageToken?: string } = await res.json();
      for (const place of data.places ?? []) leads.push(mapGooglePlace(place, city));
      pageToken = data.nextPageToken;
    } while (pageToken && leads.length < limit);

    return leads.slice(0, limit);
  },
};
