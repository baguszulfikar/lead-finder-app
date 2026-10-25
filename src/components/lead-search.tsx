"use client";

import { useState } from "react";
import type { RankedLead } from "@/lib/leads/scoring";
import type { LeadSourceId } from "@/lib/leads/types";
import type { PresetId } from "@/lib/leads/presets";

interface Props {
  sources: { id: LeadSourceId; label: string; configured: boolean }[];
  presets: { id: PresetId; label: string; description: string }[];
  defaultSource: LeadSourceId;
}

function toCsv(leads: RankedLead[]): string {
  const header = ["Skor", "Nama", "Kategori", "Alamat", "Telepon", "Website", "Rating", "Ulasan", "WhatsApp", "Google Maps"];
  const cell = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const rows = leads.map((l) =>
    [l.score, l.name, l.category, l.address, l.phone, l.website, l.rating, l.reviewCount, l.whatsappUrl, l.mapsUrl]
      .map(cell)
      .join(","),
  );
  return [header.map(cell).join(","), ...rows].join("\n");
}

function downloadCsv(leads: RankedLead[], filename: string) {
  // BOM so Excel opens the UTF-8 file correctly.
  const blob = new Blob(["﻿" + toCsv(leads)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function scoreColor(score: number) {
  if (score >= 60) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
  if (score >= 35) return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
  return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
}

export function LeadSearch({ sources, presets, defaultSource }: Props) {
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("Jakarta Selatan");
  const [preset, setPreset] = useState<PresetId>(presets[0].id);
  const [source, setSource] = useState<LeadSourceId>(defaultSource);
  const [leads, setLeads] = useState<RankedLead[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, city, preset, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Pencarian gagal.");
      setLeads(data.leads);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pencarian gagal.");
      setLeads(null);
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-4 rounded-lg border border-zinc-200 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Cari bisnis</span>
          <input className={input} value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="mis. kafe, klinik gigi, laundry" required />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Kota / area</span>
          <input className={input} value={city} onChange={(e) => setCity(e.target.value)} required />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Jasa yang Anda jual</span>
          <select className={input} value={preset} onChange={(e) => setPreset(e.target.value as PresetId)}>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} ({p.description})
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Sumber data</span>
          <select className={input} value={source} onChange={(e) => setSource(e.target.value as LeadSourceId)}>
            {sources.map((s) => (
              <option key={s.id} value={s.id} disabled={!s.configured}>
                {s.label}
                {s.configured ? "" : " (belum diatur)"}
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2 lg:col-span-4">
          <button type="submit" disabled={loading} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
            {loading ? "Mencari…" : "Cari leads"}
          </button>
        </div>
      </form>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}

      {leads && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">{leads.length} leads, diurutkan dari yang paling potensial</h2>
            {leads.length > 0 && (
              <button
                onClick={() => downloadCsv(leads, `leads-${keyword}-${city}.csv`.replace(/\s+/g, "-").toLowerCase())}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Unduh CSV
              </button>
            )}
          </div>
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {leads.map((lead) => (
              <li key={`${lead.source}-${lead.sourceId}`} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                <span className={`inline-flex h-10 w-12 shrink-0 items-center justify-center rounded-md text-sm font-bold ${scoreColor(lead.score)}`}>
                  {lead.score}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-zinc-500">
                    {[lead.category, lead.address].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {lead.rating !== null ? `★ ${lead.rating} (${lead.reviewCount ?? 0} ulasan)` : "Belum ada rating"}
                    {lead.phone ? ` · ${lead.phone}` : ""}
                  </p>
                  <p className="text-xs text-zinc-500">{lead.reasons.join(" · ")}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {lead.whatsappUrl && (
                    <a href={lead.whatsappUrl} target="_blank" rel="noopener noreferrer" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
                      WhatsApp
                    </a>
                  )}
                  {lead.website && (
                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
                      Website
                    </a>
                  )}
                  {lead.mapsUrl && (
                    <a href={lead.mapsUrl} target="_blank" rel="noopener noreferrer" className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
                      Maps
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
