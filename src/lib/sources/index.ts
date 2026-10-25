import type { LeadSource, LeadSourceId } from "@/lib/leads/types";
import { googlePlacesSource } from "./google-places";
import { mockSource } from "./mock";
import { outscraperSource } from "./outscraper";

const SOURCES: Record<LeadSourceId, LeadSource> = {
  google: googlePlacesSource,
  outscraper: outscraperSource,
  mock: mockSource,
};

export function getSource(id: LeadSourceId): LeadSource {
  return SOURCES[id];
}

export function isSourceId(value: unknown): value is LeadSourceId {
  return typeof value === "string" && value in SOURCES;
}

/** Sources with their configured state, for the search form. */
export function listSources() {
  return Object.values(SOURCES).map((s) => ({
    id: s.id,
    label: s.label,
    configured: s.isConfigured(),
  }));
}

/** LEAD_SOURCE_DEFAULT if it is configured, else the first configured real source, else mock. */
export function defaultSourceId(): LeadSourceId {
  const preferred = process.env.LEAD_SOURCE_DEFAULT;
  if (isSourceId(preferred) && SOURCES[preferred].isConfigured()) return preferred;
  if (googlePlacesSource.isConfigured()) return "google";
  if (outscraperSource.isConfigured()) return "outscraper";
  return "mock";
}
