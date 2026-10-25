import type { Lead } from "./types";
import type { Preset } from "./presets";
import { fillTemplate, isLikelyWhatsApp, normalizeIdPhone, whatsappLink } from "./whatsapp";

export interface RankedLead extends Lead {
  score: number;
  /** Short reasons in Bahasa Indonesia, shown next to the score. */
  reasons: string[];
  whatsappUrl: string | null;
}

// Review count at which the review-volume signal is maxed out.
const REVIEW_SATURATION = 500;
// Every lead needs a way to be contacted; WhatsApp reach is worth this much.
const WHATSAPP_POINTS = 15;

export function scoreLead(lead: Lead, preset: Preset): RankedLead {
  const w = preset.weights;
  const reasons: string[] = [];
  let score = 0;

  const phone = normalizeIdPhone(lead.phone);
  if (isLikelyWhatsApp(phone)) {
    score += WHATSAPP_POINTS;
    reasons.push("Bisa dihubungi via WhatsApp");
  } else if (phone) {
    reasons.push("Hanya telepon kantor");
  } else {
    reasons.push("Tidak ada nomor telepon");
  }

  if (lead.website) {
    if (w.hasWebsite) {
      score += w.hasWebsite;
      reasons.push("Sudah punya website");
    }
  } else if (w.noWebsite) {
    score += w.noWebsite;
    reasons.push("Belum punya website");
  }

  const reviews = lead.reviewCount ?? 0;
  if (reviews > 0 && w.reviewVolume) {
    // Log scale: the jump from 10 to 100 reviews matters more than 400 to 500.
    const ratio = Math.min(1, Math.log10(reviews + 1) / Math.log10(REVIEW_SATURATION + 1));
    score += Math.round(ratio * w.reviewVolume);
    if (reviews >= 100) reasons.push(`Ramai (${reviews} ulasan)`);
  }

  const rating = lead.rating;
  if (rating !== null && reviews >= 5) {
    if (rating < 4.0 && w.lowRating) {
      // 4.0 scores 0, 3.0 or lower scores full points.
      score += Math.round(Math.min(1, 4.0 - rating) * w.lowRating);
      reasons.push(`Rating rendah (${rating.toFixed(1)})`);
    } else if (rating >= 4.5 && w.highRating) {
      score += w.highRating;
      reasons.push(`Rating bagus (${rating.toFixed(1)})`);
    }
  }

  if (!lead.isOperational) {
    score = 0;
    reasons.unshift("Tutup sementara / permanen");
  }

  return {
    ...lead,
    score: Math.min(100, score),
    reasons,
    whatsappUrl: whatsappLink(lead.phone, fillTemplate(preset.messageTemplate, lead.name)),
  };
}

export function rankLeads(leads: Lead[], preset: Preset): RankedLead[] {
  return leads
    .map((lead) => scoreLead(lead, preset))
    .sort((a, b) => b.score - a.score || (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
}
