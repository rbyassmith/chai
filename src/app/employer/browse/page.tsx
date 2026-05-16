import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  CATEGORIES,
  CATEGORY_LABELS_EN,
  NEIGHBORHOODS,
  SORT_OPTIONS,
  type Category,
  type SortOption,
} from "@/lib/constants";
import { WorkerCard } from "@/components/WorkerCard";
import { BrowseFilters } from "./BrowseFilters";
import { getLocaleFromCookies } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";
import type { WorkerWithProfile } from "@/lib/supabase/types";

type SearchParams = {
  q?: string;
  category?: string;
  neighborhood?: string | string[];
  verified?: string;
  sort?: string;
};

function parseHoods(v: string | string[] | undefined): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  // Allow CSV form too (?neighborhood=Westlands,Karen)
  if (v.includes(",")) return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [v];
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const locale = await getLocaleFromCookies();

  const category = (CATEGORIES as readonly string[]).includes(sp.category ?? "")
    ? (sp.category as Category)
    : null;
  const hoods = parseHoods(sp.neighborhood).filter((h) =>
    (NEIGHBORHOODS as readonly string[]).includes(h),
  );
  const verifiedOnly = sp.verified === "true";
  const sort: SortOption = (SORT_OPTIONS as readonly string[]).includes(
    sp.sort ?? "",
  )
    ? (sp.sort as SortOption)
    : "rating";
  const q = (sp.q ?? "").trim();

  let query = supabase
    .from("workers")
    .select("*, profile:profiles!workers_profile_id_fkey(id, display_name, role)");

  if (category) query = query.eq("category", category);
  if (hoods.length) query = query.in("neighborhood", hoods);
  if (verifiedOnly) {
    query = query
      .eq("id_verified", true)
      .eq("good_conduct_certificate", true)
      .eq("references_checked", true);
  }

  if (sort === "rating") {
    query = query.order("rating_avg", { ascending: false });
  } else if (sort === "experience") {
    query = query.order("years_experience", { ascending: false });
  } else {
    query = query.order("pay_min_kes", { ascending: true });
  }

  const { data, error } = await query;
  let workers = ((data ?? []) as unknown as WorkerWithProfile[]) ?? [];

  // Client-side text filter (over headline + bio + display_name) — small dataset.
  if (q) {
    const qq = q.toLowerCase();
    workers = workers.filter(
      (w) =>
        w.headline.toLowerCase().includes(qq) ||
        w.bio.toLowerCase().includes(qq) ||
        w.profile.display_name.toLowerCase().includes(qq) ||
        w.languages.some((l) => l.toLowerCase().includes(qq)) ||
        w.neighborhood.toLowerCase().includes(qq),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-serif text-2xl text-ink-900">
        {t(locale, "browse")}
      </h1>

      <BrowseFilters
        initial={{
          q,
          category,
          neighborhoods: hoods,
          verifiedOnly,
          sort,
        }}
        categories={CATEGORIES as unknown as string[]}
        categoryLabels={CATEGORY_LABELS_EN}
        neighborhoods={NEIGHBORHOODS as unknown as string[]}
      />

      {error ? (
        <p className="rounded-lg border border-clay-200 bg-clay-50 p-3 text-sm text-clay-700">
          {error.message}
        </p>
      ) : null}

      <p className="text-xs text-ink-500">
        {workers.length} result{workers.length === 1 ? "" : "s"}
      </p>

      <div className="flex flex-col gap-3">
        {workers.map((w) => (
          <WorkerCard key={w.id} worker={w} />
        ))}
        {workers.length === 0 && !error ? (
          <p className="rounded-xl border border-dashed border-clay-200 bg-cream-50 p-4 text-sm text-ink-500">
            No workers match your filters.
          </p>
        ) : null}
      </div>
    </div>
  );
}
