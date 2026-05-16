"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Category, SortOption } from "@/lib/constants";

type Initial = {
  q: string;
  category: Category | null;
  neighborhoods: string[];
  verifiedOnly: boolean;
  sort: SortOption;
};

export function BrowseFilters({
  initial,
  categories,
  categoryLabels,
  neighborhoods,
}: {
  initial: Initial;
  categories: string[];
  categoryLabels: Record<string, string>;
  neighborhoods: string[];
}) {
  const router = useRouter();
  const search = useSearchParams();
  const { t } = useLocale();
  const [, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(initial.q);

  function apply(next: Partial<Initial>) {
    const params = new URLSearchParams(search.toString());

    const merged: Initial = { ...initial, ...next };

    // q
    if (merged.q) params.set("q", merged.q);
    else params.delete("q");

    // category
    if (merged.category) params.set("category", merged.category);
    else params.delete("category");

    // neighborhoods (CSV in URL)
    params.delete("neighborhood");
    if (merged.neighborhoods.length) {
      params.set("neighborhood", merged.neighborhoods.join(","));
    }

    // verified
    if (merged.verifiedOnly) params.set("verified", "true");
    else params.delete("verified");

    // sort
    if (merged.sort && merged.sort !== "rating") params.set("sort", merged.sort);
    else params.delete("sort");

    start(() => router.push(`/employer/browse?${params.toString()}`));
  }

  function toggleHood(h: string) {
    const set = new Set(initial.neighborhoods);
    if (set.has(h)) set.delete(h);
    else set.add(h);
    apply({ neighborhoods: [...set] });
  }

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q });
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="flex-1 rounded-full border border-clay-100 bg-cream-50 px-4 py-2 text-sm outline-none focus:border-clay-400"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-full border border-clay-200 bg-cream-50 px-3 py-2 text-xs text-ink-700 hover:bg-cream-200"
          aria-expanded={open}
        >
          Filters {open ? "▲" : "▼"}
        </button>
      </form>

      <div className="-mx-1 flex flex-nowrap items-center gap-1 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => apply({ category: null })}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${initial.category === null ? "bg-clay-500 text-cream-50" : "bg-cream-50 text-ink-700 border border-clay-100"}`}
        >
          {t("allCategories")}
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() =>
              apply({ category: (initial.category === c ? null : (c as Category)) })
            }
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${initial.category === c ? "bg-clay-500 text-cream-50" : "bg-cream-50 text-ink-700 border border-clay-100"}`}
          >
            {categoryLabels[c]}
          </button>
        ))}
      </div>

      {open ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-clay-100 bg-cream-50 p-3">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-ink-500">
              {t("filterNeighborhood")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {neighborhoods.map((h) => {
                const on = initial.neighborhoods.includes(h);
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => toggleHood(h)}
                    className={`rounded-full px-3 py-1 text-xs ${on ? "bg-forest-500 text-cream-50" : "border border-clay-100 bg-cream-50 text-ink-700"}`}
                    aria-pressed={on}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center justify-between gap-2 text-sm">
            <span className="text-ink-700">{t("filterVerifiedOnly")}</span>
            <input
              type="checkbox"
              checked={initial.verifiedOnly}
              onChange={(e) => apply({ verifiedOnly: e.target.checked })}
              className="h-5 w-5 accent-clay-500"
            />
          </label>

          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-ink-500">
              {t("sortBy")}
            </p>
            <div className="flex gap-1.5">
              {(
                [
                  ["rating", t("sortRating")],
                  ["experience", t("sortExperience")],
                  ["pay_asc", t("sortPayAsc")],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => apply({ sort: k })}
                  className={`flex-1 rounded-full px-3 py-1.5 text-xs ${initial.sort === k ? "bg-clay-500 text-cream-50" : "border border-clay-100 bg-cream-50 text-ink-700"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setQ("");
              apply({
                q: "",
                category: null,
                neighborhoods: [],
                verifiedOnly: false,
                sort: "rating",
              });
            }}
            className="self-end text-xs text-ink-500 underline-offset-2 hover:underline"
          >
            {t("clearFilters")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
