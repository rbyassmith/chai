import { computeTrustScore, trustBand } from "@/lib/trust";
import type { WorkerRow } from "@/lib/supabase/types";

export function TrustBadge({
  worker,
}: {
  worker: Pick<
    WorkerRow,
    | "id_verified"
    | "good_conduct_certificate"
    | "references_checked"
    | "chai_interviewed"
    | "rating_avg"
    | "years_experience"
  >;
}) {
  const score = computeTrustScore(worker);
  const band = trustBand(score);
  const cls =
    band === "highly_trusted"
      ? "bg-forest-500 text-cream-50"
      : band === "trusted"
        ? "bg-forest-100 text-forest-700"
        : "bg-cream-200 text-ink-700";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}
      title="Trust Score"
    >
      <span className="opacity-80">Trust</span>
      <span>{score}</span>
    </span>
  );
}
