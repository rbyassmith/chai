import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserContext } from "@/lib/auth/context";
import { Avatar } from "@/components/Avatar";
import { relativeDate } from "@/lib/format";
import { getLocaleFromCookies } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";

export default async function WorkerInterestPage() {
  const supabase = await createSupabaseServerClient();
  const { userId } = await getCurrentUserContext();
  const locale = await getLocaleFromCookies();
  if (!userId) return null;

  // Resolve my worker.id then list contact_requests for that worker.
  const { data: workerRow } = await supabase
    .from("workers")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (!workerRow) {
    return (
      <p className="text-sm text-ink-500">Your worker profile isn&apos;t set up yet.</p>
    );
  }

  const { data } = await supabase
    .from("contact_requests")
    .select(
      "id, created_at, employer:profiles!contact_requests_employer_profile_id_fkey(display_name, neighborhood)",
    )
    .eq("worker_id", workerRow.id)
    .order("created_at", { ascending: false });

  type Row = {
    id: string;
    created_at: string;
    employer: { display_name: string; neighborhood: string | null } | null;
  };

  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-serif text-2xl text-ink-900">
        {t(locale, "incomingInterest")}
      </h1>
      <ul className="flex flex-col gap-2">
        {rows.length === 0 ? (
          <li className="rounded-xl border border-dashed border-clay-200 bg-cream-50 p-3 text-sm text-ink-500">
            {t(locale, "noIncoming")}
          </li>
        ) : (
          rows.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-xl border border-clay-100 bg-cream-50 p-3"
            >
              <Avatar name={r.employer?.display_name ?? "?"} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">
                  {r.employer?.display_name ?? "Anonymous"}
                </p>
                {r.employer?.neighborhood ? (
                  <p className="text-xs text-ink-500">
                    {r.employer.neighborhood}
                  </p>
                ) : null}
              </div>
              <span className="text-[11px] text-ink-500">
                {relativeDate(r.created_at)}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
