import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserContext } from "@/lib/auth/context";
import { Avatar } from "@/components/Avatar";
import { TrustPanel } from "@/components/TrustPanel";
import { RatingStars } from "@/components/RatingStars";
import { CATEGORY_LABELS_EN } from "@/lib/constants";
import { payRangeLabel, relativeDate, initialsOf } from "@/lib/format";
import { RequestContactButton } from "./RequestContactButton";
import { ReviewForm } from "./ReviewForm";
import { getLocaleFromCookies } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";
import type {
  WorkerRow,
  WorkHistoryRow,
  ProfileRow,
  ReviewRow,
} from "@/lib/supabase/types";

type Joined = WorkerRow & {
  profile: Pick<ProfileRow, "id" | "display_name">;
  work_history: WorkHistoryRow[];
  reviews: (ReviewRow & {
    employer: Pick<ProfileRow, "display_name"> | null;
  })[];
};

export default async function WorkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const locale = await getLocaleFromCookies();
  const { userId } = await getCurrentUserContext();

  const { data: w } = await supabase
    .from("workers")
    .select(
      `
      *,
      profile:profiles!workers_profile_id_fkey(id, display_name),
      work_history(*),
      reviews(*, employer:profiles!reviews_employer_profile_id_fkey(display_name))
    `,
    )
    .eq("id", id)
    .maybeSingle<Joined>();

  if (!w) notFound();

  // Has this employer already requested contact?
  let hasContactRequest = false;
  if (userId) {
    const { data } = await supabase
      .from("contact_requests")
      .select("id")
      .eq("employer_profile_id", userId)
      .eq("worker_id", w.id)
      .limit(1);
    hasContactRequest = (data?.length ?? 0) > 0;
  }

  const reviews = [...(w.reviews ?? [])].sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  );
  const history = [...(w.work_history ?? [])].sort(
    (a, b) => (b.end_year ?? 9999) - (a.end_year ?? 9999) || b.start_year - a.start_year,
  );

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/employer/browse"
        className="text-xs text-clay-600 underline-offset-2 hover:underline"
      >
        ← {t(locale, "backToBrowse")}
      </Link>

      <header className="flex items-start gap-4">
        <Avatar name={w.profile.display_name} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl leading-tight text-ink-900">
            {w.profile.display_name}
          </h1>
          <p className="text-sm text-ink-700">
            {CATEGORY_LABELS_EN[w.category]} · {w.neighborhood}
          </p>
          <p className="mt-1 text-sm text-ink-500">{w.headline}</p>
        </div>
      </header>

      <TrustPanel worker={w} />

      <section className="grid grid-cols-3 gap-2 text-center">
        <Stat
          label={t(locale, "yearsExperienceShort")}
          value={w.years_experience.toString()}
        />
        <Stat
          label={t(locale, "reviews")}
          value={`${w.rating_avg.toFixed(1)} (${w.reviews_count})`}
        />
        <Stat
          label={t(locale, "placementsShort")}
          value={w.placements_count.toString()}
        />
      </section>

      <section className="rounded-2xl border border-clay-100 bg-cream-50 p-4">
        <p className="text-xs uppercase tracking-wider text-ink-500">
          {t(locale, "expectedPay")}
        </p>
        <p className="mt-1 font-serif text-xl text-ink-900">
          {payRangeLabel(w.pay_min_kes, w.pay_max_kes)}
        </p>
      </section>

      <section className="rounded-2xl border border-clay-100 bg-cream-50 p-4">
        <p className="text-xs uppercase tracking-wider text-ink-500">
          {t(locale, "languages")}
        </p>
        <p className="mt-1 text-sm text-ink-900">{w.languages.join(", ")}</p>
      </section>

      {w.bio ? (
        <section>
          <h2 className="font-serif text-xl text-ink-900">
            {t(locale, "about")}
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm text-ink-700">
            {w.bio}
          </p>
        </section>
      ) : null}

      <section>
        <h2 className="font-serif text-xl text-ink-900">
          {t(locale, "workHistory")}
        </h2>
        <ol className="mt-2 flex flex-col gap-3">
          {history.length === 0 ? (
            <li className="text-sm text-ink-500">—</li>
          ) : (
            history.map((h) => (
              <li
                key={h.id}
                className="rounded-xl border border-clay-100 bg-cream-50 p-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-medium text-ink-900">{h.role_title}</p>
                  <p className="text-xs text-ink-500">
                    {h.start_year} – {h.end_year ?? t(locale, "present")}
                  </p>
                </div>
                {h.description ? (
                  <p className="mt-1 text-sm text-ink-700">{h.description}</p>
                ) : null}
              </li>
            ))
          )}
        </ol>
      </section>

      <div className="sticky bottom-3 z-20">
        <RequestContactButton
          workerId={w.id}
          alreadyRequested={hasContactRequest}
        />
      </div>

      <section>
        <h2 className="font-serif text-xl text-ink-900">
          {t(locale, "reviews")}{" "}
          <span className="text-sm text-ink-500">({reviews.length})</span>
        </h2>

        <div className="mt-3">
          {hasContactRequest ? (
            <ReviewForm workerId={w.id} />
          ) : (
            <p className="rounded-xl border border-dashed border-clay-200 bg-cream-50 p-3 text-xs text-ink-500">
              {t(locale, "mustRequestFirst")}
            </p>
          )}
        </div>

        <ul className="mt-4 flex flex-col gap-3">
          {reviews.length === 0 ? (
            <li className="text-sm text-ink-500">
              {t(locale, "noReviewsYet")}
            </li>
          ) : (
            reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-clay-100 bg-cream-50 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-clay-100 text-xs font-medium text-clay-700">
                    {initialsOf(r.employer?.display_name ?? "Anon")}
                  </span>
                  <span className="text-sm text-ink-900">
                    {r.employer?.display_name ?? "Anonymous"}
                  </span>
                  <RatingStars value={r.rating} />
                  <span className="ml-auto text-[11px] text-ink-500">
                    {relativeDate(r.created_at)}
                  </span>
                </div>
                {r.body ? (
                  <p className="mt-1 text-sm text-ink-700">{r.body}</p>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-clay-100 bg-cream-50 p-3">
      <p className="font-serif text-lg text-ink-900">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-ink-500">
        {label}
      </p>
    </div>
  );
}
