// Indonesian phone normalization and wa.me links.

/**
 * Normalize an Indonesian phone number to international digits ("62...").
 * Returns null when there is nothing usable.
 */
export function normalizeIdPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0062")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (digits.startsWith("8")) digits = "62" + digits;
  if (!digits.startsWith("62")) return null;
  // 62 + at least 7 subscriber digits; Indonesian numbers top out around 13 after 62.
  if (digits.length < 9 || digits.length > 15) return null;
  return digits;
}

/**
 * Mobile numbers (62 8xx) can usually receive WhatsApp. Landlines such as
 * 021 (Jakarta) usually cannot, unless the business uses WhatsApp Business
 * on a landline, which is rare.
 */
export function isLikelyWhatsApp(normalized: string | null): boolean {
  return !!normalized && normalized.startsWith("628");
}

export function fillTemplate(template: string, businessName: string): string {
  return template.replaceAll("{nama}", businessName);
}

/** Build a wa.me link, or null when the phone is unlikely to be on WhatsApp. */
export function whatsappLink(rawPhone: string | null, message?: string): string | null {
  const phone = normalizeIdPhone(rawPhone);
  if (!isLikelyWhatsApp(phone)) return null;
  const base = `https://wa.me/${phone}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
