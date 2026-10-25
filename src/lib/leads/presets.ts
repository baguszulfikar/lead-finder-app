// Seller presets. The customer picks the kind of service they sell, and the
// preset decides which signals make a business a good prospect for them.

export type PresetId = "digital" | "software" | "professional" | "facility";

export interface Preset {
  id: PresetId;
  label: string;
  description: string;
  /** Default WhatsApp opener; {nama} is replaced with the business name. */
  messageTemplate: string;
  weights: {
    /** Points when the business has NO website (a gap the seller can fill). */
    noWebsite: number;
    /** Points when the business HAS a website (already invests in digital). */
    hasWebsite: number;
    /** Max points for review volume (a proxy for size and ability to pay). */
    reviewVolume: number;
    /** Max points for a low rating (a reputation problem to solve). */
    lowRating: number;
    /** Max points for a high rating (a healthy, growing business). */
    highRating: number;
  };
}

export const PRESETS: Record<PresetId, Preset> = {
  digital: {
    id: "digital",
    label: "Digital & marketing",
    description: "Website, media sosial, iklan, SEO",
    messageTemplate:
      "Halo {nama}, saya lihat bisnis Anda di Google Maps. Kami membantu usaha lokal mendapat lebih banyak pelanggan lewat website dan media sosial. Boleh saya kirim contoh hasil kerja kami?",
    weights: { noWebsite: 35, hasWebsite: 0, reviewVolume: 30, lowRating: 15, highRating: 5 },
  },
  software: {
    id: "software",
    label: "Software (POS, booking)",
    description: "Kasir, reservasi, manajemen stok",
    messageTemplate:
      "Halo {nama}, usaha Anda terlihat ramai di Google Maps. Kami punya aplikasi kasir dan reservasi yang bisa menghemat waktu tim Anda. Boleh saya jelaskan singkat?",
    weights: { noWebsite: 5, hasWebsite: 10, reviewVolume: 45, lowRating: 0, highRating: 15 },
  },
  professional: {
    id: "professional",
    label: "Jasa profesional",
    description: "Akuntansi, pajak, perizinan, legal",
    messageTemplate:
      "Halo {nama}, kami membantu usaha seperti Anda mengurus pembukuan, pajak, dan perizinan supaya Anda bisa fokus berjualan. Boleh kami kirim info paket kami?",
    weights: { noWebsite: 5, hasWebsite: 10, reviewVolume: 40, lowRating: 0, highRating: 15 },
  },
  facility: {
    id: "facility",
    label: "Jasa fasilitas",
    description: "Kebersihan, pest control, perawatan AC",
    messageTemplate:
      "Halo {nama}, kami menyediakan jasa kebersihan dan perawatan tempat usaha untuk bisnis di sekitar Anda. Boleh kami tawarkan survei gratis?",
    weights: { noWebsite: 0, hasWebsite: 5, reviewVolume: 40, lowRating: 15, highRating: 5 },
  },
};

export const PRESET_LIST: Preset[] = Object.values(PRESETS);

export function isPresetId(value: unknown): value is PresetId {
  return typeof value === "string" && value in PRESETS;
}
