import type { Lead, LeadSource, SearchQuery } from "@/lib/leads/types";

// Sample data so the app runs locally without any API key. Results are
// deterministic for a given query, which keeps screenshots and tests stable.

const PREFIXES = ["Warung", "Kedai", "Toko", "Rumah", "Pusat", "Studio", "Griya", "Sentra"];
const SUFFIXES = ["Makmur", "Sejahtera", "Barokah", "Jaya", "Nusantara", "Sentosa", "Mandiri", "Indah"];
const STREETS = ["Jl. Sudirman", "Jl. Gatot Subroto", "Jl. Kemang Raya", "Jl. Fatmawati", "Jl. Tebet Raya"];

function seededRandom(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export const mockSource: LeadSource = {
  id: "mock",
  label: "Data contoh (tanpa API key)",
  isConfigured: () => true,

  async search({ keyword, city, limit = 20 }: SearchQuery): Promise<Lead[]> {
    const rand = seededRandom(`${keyword}|${city}`.toLowerCase());
    const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
    const count = Math.min(limit, 20);

    return Array.from({ length: count }, (_, i) => {
      const name = `${pick(PREFIXES)} ${keyword} ${pick(SUFFIXES)}`;
      const phoneKind = rand();
      const phone =
        phoneKind < 0.6
          ? `0812-${String(Math.floor(rand() * 1e4)).padStart(4, "0")}-${String(Math.floor(rand() * 1e4)).padStart(4, "0")}`
          : phoneKind < 0.85
            ? `(021) ${String(Math.floor(rand() * 1e7)).padStart(7, "0")}`
            : null;
      const reviewCount = Math.floor(rand() ** 2 * 1200);
      return {
        sourceId: `mock-${i}`,
        source: "mock",
        name,
        category: keyword,
        address: `${pick(STREETS)} No. ${1 + Math.floor(rand() * 200)}, ${city}`,
        city,
        phone,
        website: rand() < 0.35 ? `https://example.com/${i}` : null,
        rating: reviewCount ? Math.round((3 + rand() * 2) * 10) / 10 : null,
        reviewCount,
        mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${city}`)}`,
        lat: null,
        lng: null,
        isOperational: rand() > 0.05,
      } satisfies Lead;
    });
  },
};
