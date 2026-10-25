// The common lead model. Every data source adapter maps its raw results
// into this shape, so search, ranking and outreach never care where a lead
// came from.

export type LeadSourceId = "google" | "outscraper" | "mock";

export interface Lead {
  /** Stable id within the source, e.g. a Google place_id. */
  sourceId: string;
  source: LeadSourceId;
  name: string;
  category: string | null;
  address: string | null;
  city: string | null;
  /** Phone as returned by the source, unnormalized. */
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  mapsUrl: string | null;
  lat: number | null;
  lng: number | null;
  /** False when the source says the place is closed (temporarily or permanently). */
  isOperational: boolean;
}

export interface SearchQuery {
  /** What to look for, e.g. "kafe", "klinik gigi", "laundry". */
  keyword: string;
  /** Where to look, e.g. "Jakarta Selatan". */
  city: string;
  limit?: number;
}

export interface LeadSource {
  id: LeadSourceId;
  /** Human label shown in the UI. */
  label: string;
  isConfigured(): boolean;
  search(query: SearchQuery): Promise<Lead[]>;
}
