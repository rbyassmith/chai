import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { RatingStars } from "@/components/RatingStars";
import { TrustBadge } from "@/components/TrustBadge";
import type { WorkerWithProfile } from "@/lib/supabase/types";
import { CATEGORY_LABELS_EN } from "@/lib/constants";
import { formatKes } from "@/lib/format";

export function WorkerCard({ worker }: { worker: WorkerWithProfile }) {
  return (
    <Link
      href={`/employer/workers/${worker.id}`}
      className="block rounded-2xl border border-clay-100 bg-cream-50 p-4 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-clay-400"
    >
      <div className="flex items-start gap-3">
        <Avatar name={worker.profile.display_name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-serif text-lg leading-tight text-ink-900">
                {worker.profile.display_name}
              </h3>
              <p className="text-xs text-ink-500">
                {CATEGORY_LABELS_EN[worker.category]} · {worker.neighborhood}
              </p>
            </div>
            <TrustBadge worker={worker} />
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-ink-700">
            {worker.headline}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-700">
            <span className="inline-flex items-center gap-1">
              <RatingStars value={worker.rating_avg} />
              <span className="text-ink-500">
                ({worker.reviews_count})
              </span>
            </span>
            <span>{worker.years_experience} yrs</span>
            <span className="text-ink-500">
              {formatKes(worker.pay_min_kes)} – {formatKes(worker.pay_max_kes)}/mo
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
