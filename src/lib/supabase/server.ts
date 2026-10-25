import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RankedLead } from "@/lib/leads/scoring";
import type { LeadSourceId, SearchQuery } from "@/lib/leads/types";
import type { PresetId } from "@/lib/leads/presets";

// Server-only client. Uses the service role key, so never import this from a
// client component. Until auth lands (stage 3), searches are saved without an
// owner; the tables have RLS enabled with no policies, so only the server can
// read or write them.

let client: SupabaseClient | null | undefined;

function getClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

/** Save a search and its ranked leads. No-op when Supabase is not configured. */
export async function saveSearch(
  query: SearchQuery,
  source: LeadSourceId,
  preset: PresetId,
  leads: RankedLead[],
): Promise<string | null> {
  const db = getClient();
  if (!db) return null;

  const { data: search, error } = await db
    .from("searches")
    .insert({ keyword: query.keyword, city: query.city, source, preset, result_count: leads.length })
    .select("id")
    .single();
  if (error) throw error;

  if (leads.length) {
    const rows = leads.map((l) => ({
      search_id: search.id,
      source: l.source,
      source_id: l.sourceId,
      name: l.name,
      category: l.category,
      address: l.address,
      city: l.city,
      phone: l.phone,
      website: l.website,
      rating: l.rating,
      review_count: l.reviewCount,
      maps_url: l.mapsUrl,
      lat: l.lat,
      lng: l.lng,
      is_operational: l.isOperational,
      score: l.score,
      reasons: l.reasons,
    }));
    const { error: leadsError } = await db.from("leads").insert(rows);
    if (leadsError) throw leadsError;
  }
  return search.id;
}
