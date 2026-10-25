import { NextResponse } from "next/server";
import { isPresetId, PRESETS } from "@/lib/leads/presets";
import { rankLeads } from "@/lib/leads/scoring";
import { getSource, isSourceId } from "@/lib/sources";
import { saveSearch } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const keyword = typeof body?.keyword === "string" ? body.keyword.trim() : "";
  const city = typeof body?.city === "string" ? body.city.trim() : "";
  const limit = Math.min(Math.max(Number(body?.limit) || 20, 1), 60);

  if (!keyword || !city) {
    return NextResponse.json({ error: "Isi kata kunci dan kota." }, { status: 400 });
  }
  const sourceId: unknown = body?.source;
  const presetId: unknown = body?.preset;
  if (!isSourceId(sourceId)) {
    return NextResponse.json({ error: "Sumber data tidak dikenal." }, { status: 400 });
  }
  if (!isPresetId(presetId)) {
    return NextResponse.json({ error: "Jenis jasa tidak dikenal." }, { status: 400 });
  }

  const source = getSource(sourceId);
  if (!source.isConfigured()) {
    return NextResponse.json(
      { error: `${source.label} belum dikonfigurasi (API key kosong).` },
      { status: 400 },
    );
  }

  const query = { keyword, city, limit };
  try {
    const leads = rankLeads(await source.search(query), PRESETS[presetId]);
    let searchId: string | null = null;
    try {
      searchId = await saveSearch(query, source.id, presetId, leads);
    } catch (err) {
      // Saving is best effort: the user still gets results.
      console.error("saveSearch failed", err);
    }
    return NextResponse.json({ leads, searchId });
  } catch (err) {
    console.error("search failed", err);
    return NextResponse.json({ error: "Pencarian gagal. Coba lagi sebentar." }, { status: 502 });
  }
}
