import { LeadSearch } from "@/components/lead-search";
import { PRESET_LIST } from "@/lib/leads/presets";
import { defaultSourceId, listSources } from "@/lib/sources";

// Source availability depends on env vars, so render per request.
export const dynamic = "force-dynamic";

export default function Home() {
  const presets = PRESET_LIST.map(({ id, label, description }) => ({ id, label, description }));
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Client Finder</h1>
        <p className="text-zinc-500">Temukan calon klien dari Google Maps, lalu hubungi lewat WhatsApp.</p>
      </header>
      <LeadSearch sources={listSources()} presets={presets} defaultSource={defaultSourceId()} />
    </main>
  );
}
