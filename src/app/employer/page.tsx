import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WorkerCard } from "@/components/WorkerCard";
import { CATEGORIES, CATEGORY_LABELS_EN, type Category } from "@/lib/constants";
import { ServerT } from "@/components/ServerT";
import { getLocaleFromCookies } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";
import type { WorkerWithProfile } from "@/lib/supabase/types";

const CATEGORY_EMOJI: Record<Category, string> = {
  driver: "🚗",
  house_help: "🧺",
  cook: "🍲",
  security: "🛡️",
  nanny: "🧒",
};

export default async function EmployerHome() {
  const supabase = await createSupabaseServerClient();
  const locale = await getLocaleFromCookies();

  const { data: workers } = await supabase
    .from("workers")
    .select("*, profile:profiles!workers_profile_id_fkey(id, display_name, role)")
    .order("created_at", { ascending: false })
    .limit(6);

  const list = (workers ?? []) as unknown as WorkerWithProfile[];

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="font-serif text-3xl leading-tight text-ink-900">
          <ServerT k="employerWelcome" />
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          <ServerT k="employerSubhead" />
        </p>
      </section>

      <section>
        <form
          action="/employer/browse"
          method="get"
          className="flex items-center gap-2"
        >
          <input
            type="text"
            name="q"
            placeholder={t(locale, "searchPlaceholder")}
            className="flex-1 rounded-full border border-clay-100 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-clay-400"
          />
          <button
            type="submit"
            className="rounded-full bg-clay-500 px-4 py-2.5 text-sm font-medium text-cream-50 hover:bg-clay-600"
          >
            {t(locale, "browse")}
          </button>
        </form>
      </section>

      <section>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/employer/browse?category=${c}`}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-clay-100 bg-cream-50 px-2 py-3 text-center shadow-sm hover:shadow-md"
            >
              <span aria-hidden className="text-2xl">
                {CATEGORY_EMOJI[c]}
              </span>
              <span className="text-xs text-ink-700">
                {CATEGORY_LABELS_EN[c]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-end justify-between">
          <h2 className="font-serif text-xl text-ink-900">
            <ServerT k="recommendedTitle" />
          </h2>
          <Link
            href="/employer/browse"
            className="text-xs text-clay-600 underline-offset-2 hover:underline"
          >
            <ServerT k="browseAll" /> →
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {list.length === 0 ? (
            <p className="rounded-xl border border-dashed border-clay-200 bg-cream-50 p-4 text-sm text-ink-500">
              No workers yet. Run the seed script (see README).
            </p>
          ) : (
            list.map((w) => <WorkerCard key={w.id} worker={w} />)
          )}
        </div>
      </section>
    </div>
  );
}
