import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserContext } from "@/lib/auth/context";
import { RatingStars } from "@/components/RatingStars";
import { relativeDate, initialsOf } from "@/lib/format";
import { getLocaleFromCookies } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";

export default async function WorkerReviewsPage() {
  const supabase = await createSupabaseServerClient();
  const { userId } = await getCurrentUserContext();
  const locale = await getLocaleFromCookies();
  if (!userId) return null;

  const { data: workerRow } = await supabase
    .from("workers")
    .select("id, rating_avg, reviews_count")
    .eq("profile_id", userId)
    .maybeSingle();

  if (!workerRow) {
    return (
      <p className="text-sm text-ink-500">Your worker profile isn&apos;t set up yet.</p>
    );
  }

  const { data } = await supabase
    .from("reviews")
    .select(
      "id, created_at, rating, body, employer:profiles!reviews_employer_profile_id_fkey(display_name)",
    )
    .eq("worker_id", workerRow.id)
    .order("created_at", { ascending: false });

  type Row = {
    id: string;
    created_at: string;
    rating: number;
    body: string;
    employer: { display_name: string } | null;
  };

  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-serif text-2xl text-ink-900">
          {t(locale, "myReviews")}
        </h1>
        <p className="text-sm text-ink-500">
          {workerRow.rating_avg.toFixed(1)} ★ · {workerRow.reviews_count}{" "}
          {t(locale, "reviewsCount")}
        </p>
      </header>

      <ul className="flex flex-col gap-2">
        {rows.length === 0 ? (
          <li className="rounded-xl border border-dashed border-clay-200 bg-cream-50 p-3 text-sm text-ink-500">
            {t(locale, "noReviewsYet")}
          </li>
        ) : (
          rows.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-clay-100 bg-cream-50 p-3"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-clay-100 text-xs font-medium text-clay-700">
                  {initialsOf(r.employer?.display_name ?? "?")}
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
    </div>
  );
}
