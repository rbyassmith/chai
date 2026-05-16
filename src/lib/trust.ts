import type { WorkerRow } from "@/lib/supabase/types";

/**
 * Trust Score — PRD Section 8.3 (deterministic, illustrative).
 *
 *   +25 id_verified
 *   +25 good_conduct_certificate
 *   +20 references_checked
 *   +15 chai_interviewed
 *   +  min(rating_avg, 5) / 5  * 10
 *   +  min(years_experience, 10) / 10 * 5
 *
 * Result is rounded and clamped to 0–100.
 */
export function computeTrustScore(
  w: Pick<
    WorkerRow,
    | "id_verified"
    | "good_conduct_certificate"
    | "references_checked"
    | "chai_interviewed"
    | "rating_avg"
    | "years_experience"
  >,
): number {
  let score = 0;
  if (w.id_verified) score += 25;
  if (w.good_conduct_certificate) score += 25;
  if (w.references_checked) score += 20;
  if (w.chai_interviewed) score += 15;
  score += (Math.min(w.rating_avg ?? 0, 5) / 5) * 10;
  score += (Math.min(w.years_experience ?? 0, 10) / 10) * 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export type TrustBand = "highly_trusted" | "trusted" | "building";

export function trustBand(score: number): TrustBand {
  if (score >= 85) return "highly_trusted";
  if (score >= 65) return "trusted";
  return "building";
}
