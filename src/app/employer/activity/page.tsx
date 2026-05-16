import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserContext } from "@/lib/auth/context";
import { Avatar } from "@/components/Avatar";
import { RatingStars } from "@/components/RatingStars";
import { relativeDate } from "@/lib/format";
import { getLocaleFromCookies } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";

export default async function EmployerActivity() {
  const supabase = await createSupabaseServerClient();
  const { userId } = await getCurrentUserContext();
  const locale = await getLocaleFromCookies();
  if (!userId) return null;

  const [requestsRes, reviewsRes] = await Promise.all([
    supabase
      .from("contact_requests")
      .select(
        "id, created_at, worker:workers!contact_requests_worker_id_fkey(id, category, neighborhood, profile:profiles!workers_profile_id_fkey(display_name))",
      )
      .eq("employer_profile_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("reviews")
      .select(
        "id, created_at, rating, body, worker:workers!reviews_worker_id_fkey(id, profile:profiles!workers_profile_id_fkey(display_name))",
      )
      .eq("employer_profile_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  type ReqRow = {
    id: string;
    created_at: string;
    worker: {
      id: string;
      category: string;
      neighborhood: string;
      profile: { display_name: string } | null;
    } | null;
  };
  type RevRow = {
    id: string;
    created_at: string;
    rating: number;
    body: string;
    worker: {
      id: string;
      profile: { display_name: string } | null;
    } | null;
  };

  const requests = (requestsRes.data ?? []) as unknown as ReqRow[];
  const reviews = (reviewsRes.data ?? []) as unknown as RevRow[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-ink-900">
        {t(locale, "myActivity")}
      </h1>

      <section>
        <h2 className="font-serif text-lg text-ink-900">
          {t(locale, "requestedOn")}
        </h2>
        <ul className="mt-2 flex flex-col gap-2">
          {requests.length === 0 ? (
            <li className="rounded-xl border border-dashed border-clay-200 bg-cream-50 p-3 text-sm text-ink-500">
              {t(locale, "noContactRequests")}
            </li>
          ) : (
            requests.map((r) => {
              if (!r.worker) return null;
              return (
                <li key={r.id}>
                  <Link
                    href={`/employer/workers/${r.worker.id}`}
                    className="flex items-center gap-3 rounded-xl border border-clay-100 bg-cream-50 p-3"
                  >
                    <Avatar
                      name={r.worker.profile?.display_name ?? "?"}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">
                        {r.worker.profile?.display_name ?? "—"}
                      </p>
                      <p className="text-xs text-ink-500">
                        {r.worker.category} · {r.worker.neighborhood}
                      </p>
                    </div>
                    <span className="text-[11px] text-ink-500">
                      {relativeDate(r.created_at)}
                    </span>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-lg text-ink-900">
          {t(locale, "reviewedOn")}
        </h2>
        <ul className="mt-2 flex flex-col gap-2">
          {reviews.length === 0 ? (
            <li className="rounded-xl border border-dashed border-clay-200 bg-cream-50 p-3 text-sm text-ink-500">
              {t(locale, "noReviewsLeft")}
            </li>
          ) : (
            reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-clay-100 bg-cream-50 p-3"
              >
                <div className="flex items-center gap-2">
                  <Link
                    href={r.worker?.id ? `/employer/workers/${r.worker.id}` : "#"}
                    className="text-sm font-medium text-ink-900 hover:underline"
                  >
                    {r.worker?.profile?.display_name ?? "—"}
                  </Link>
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
