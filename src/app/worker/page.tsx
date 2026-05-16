import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserContext } from "@/lib/auth/context";
import { Avatar } from "@/components/Avatar";
import { TrustPanel } from "@/components/TrustPanel";
import { RatingStars } from "@/components/RatingStars";
import { CATEGORY_LABELS_EN } from "@/lib/constants";
import { payRangeLabel, relativeDate } from "@/lib/format";
import { getLocaleFromCookies } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";
import type {
  WorkerRow,
  WorkHistoryRow,
  ReviewRow,
} from "@/lib/supabase/types";

export default async function WorkerDashboard() {
  const supabase = await createSupabaseServerClient();
  const { userId, profile } = await getCurrentUserContext();
  const locale = await getLocaleFromCookies();
  if (!userId || !profile) redirect("/login");

  const { data: w } = await supabase
    .from("workers")
    .select("*, work_history(*)")
    .eq("profile_id", userId)
    .maybeSingle<WorkerRow & { work_history: WorkHistoryRow[] }>();

  // Latest few reviews for the dashboard preview.
  const { data: reviewsData } = w
    ? await supabase
        .from("reviews")
        .select("*")
        .eq("worker_id", w.id)
        .order("created_at", { ascending: false })
        .limit(3)
    : { data: [] as ReviewRow[] };

  if (!w) {
    return (
      <div className="rounded-xl border border-clay-200 bg-cream-50 p-4 text-sm text-ink-700">
        Your worker profile hasn&apos;t been created yet.{" "}
        <Link
          href="/worker/edit"
          className="font-medium text-clay-600 underline-offset-2 hover:underline"
        >
          Set it up
        </Link>
        .
      </div>
    );
  }

  const reviews = (reviewsData ?? []) as ReviewRow[];

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start gap-3">
        <Avatar name={profile.display_name} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl leading-tight text-ink-900">
            {profile.display_name}
          </h1>
          <p className="text-sm text-ink-700">
            {CATEGORY_LABELS_EN[w.category]} · {w.neighborhood}
          </p>
          <p className="mt-1 text-sm text-ink-500">{w.headline}</p>
        </div>
        <Link
          href="/worker/edit"
          className="rounded-full bg-clay-500 px-3 py-1.5 text-xs font-medium text-cream-50 hover:bg-clay-600"
        >
          {t(locale, "editProfile")}
        </Link>
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
        <p className="mt-3 text-xs uppercase tracking-wider text-ink-500">
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
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink-900">
            {t(locale, "reviews")}
          </h2>
          <Link
            href="/worker/reviews"
            className="text-xs text-clay-600 underline-offset-2 hover:underline"
          >
            {t(locale, "myReviews")} →
          </Link>
        </div>
        <ul className="mt-2 flex flex-col gap-2">
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
