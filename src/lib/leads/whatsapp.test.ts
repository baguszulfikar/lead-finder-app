import { describe, expect, it } from "vitest";
import { isLikelyWhatsApp, normalizeIdPhone, whatsappLink } from "./whatsapp";

describe("normalizeIdPhone", () => {
  it.each([
    ["0812-3456-7890", "6281234567890"],
    ["+62 812 3456 7890", "6281234567890"],
    ["0062 812 3456 7890", "6281234567890"],
    ["812 3456 7890", "6281234567890"],
    ["(021) 5551234", "62215551234"],
  ])("%s -> %s", (raw, expected) => {
    expect(normalizeIdPhone(raw)).toBe(expected);
  });

  it("rejects empty and foreign numbers", () => {
    expect(normalizeIdPhone(null)).toBeNull();
    expect(normalizeIdPhone("")).toBeNull();
    expect(normalizeIdPhone("+1 415 555 0100")).toBeNull();
    expect(normalizeIdPhone("123")).toBeNull();
  });
});

describe("whatsappLink", () => {
  it("builds a wa.me link with an encoded message for mobiles", () => {
    expect(whatsappLink("0812-3456-7890", "Halo Kafe A&B")).toBe(
      "https://wa.me/6281234567890?text=Halo%20Kafe%20A%26B",
    );
  });

  it("skips landlines", () => {
    expect(isLikelyWhatsApp(normalizeIdPhone("(021) 5551234"))).toBe(false);
    expect(whatsappLink("(021) 5551234")).toBeNull();
  });
});
