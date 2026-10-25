import { describe, expect, it } from "vitest";
import { PRESETS } from "./presets";
import { rankLeads, scoreLead } from "./scoring";
import type { Lead } from "./types";

const base: Lead = {
  sourceId: "x",
  source: "mock",
  name: "Kafe Contoh",
  category: "Kafe",
  address: null,
  city: "Jakarta",
  phone: "0812-0000-0000",
  website: null,
  rating: 4.2,
  reviewCount: 200,
  mapsUrl: null,
  lat: null,
  lng: null,
  isOperational: true,
};

describe("scoreLead", () => {
  it("ranks a busy business without a website first for digital sellers", () => {
    const withSite = { ...base, sourceId: "a", website: "https://kafe.id" };
    const without = { ...base, sourceId: "b" };
    const ranked = rankLeads([withSite, without], PRESETS.digital);
    expect(ranked[0].sourceId).toBe("b");
    expect(ranked[0].reasons).toContain("Belum punya website");
  });

  it("zeroes closed businesses", () => {
    expect(scoreLead({ ...base, isOperational: false }, PRESETS.software).score).toBe(0);
  });

  it("adds a prefilled WhatsApp link", () => {
    const lead = scoreLead(base, PRESETS.digital);
    expect(lead.whatsappUrl).toMatch(/^https:\/\/wa\.me\/6281200000000\?text=Halo%20Kafe%20Contoh/);
  });

  it("stays within 0-100", () => {
    for (const preset of Object.values(PRESETS)) {
      const s = scoreLead({ ...base, reviewCount: 100000, rating: 1 }, preset).score;
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });
});
