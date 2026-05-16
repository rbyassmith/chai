"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { computeTrustScore, trustBand } from "@/lib/trust";
import type { WorkerRow } from "@/lib/supabase/types";

type Props = {
  worker: Pick<
    WorkerRow,
    | "id_verified"
    | "good_conduct_certificate"
    | "references_checked"
    | "chai_interviewed"
    | "rating_avg"
    | "years_experience"
  >;
};

export function TrustPanel({ worker }: Props) {
  const { t } = useLocale();
  const score = computeTrustScore(worker);
  const band = trustBand(score);

  const bandLabel =
    band === "highly_trusted"
      ? t("bandHighlyTrusted")
      : band === "trusted"
        ? t("bandTrusted")
        : t("bandBuilding");

  const bandColor =
    band === "highly_trusted"
      ? "bg-forest-500 text-cream-50"
      : band === "trusted"
        ? "bg-forest-200 text-forest-700"
        : "bg-cream-200 text-ink-700";

  const items: Array<{ ok: boolean; label: string; desc: string }> = [
    {
      ok: worker.id_verified,
      label: t("vIdLabel"),
      desc: t("vIdDesc"),
    },
    {
      ok: worker.good_conduct_certificate,
      label: t("vGoodConductLabel"),
      desc: t("vGoodConductDesc"),
    },
    {
      ok: worker.references_checked,
      label: t("vReferencesLabel"),
      desc: t("vReferencesDesc"),
    },
    {
      ok: worker.chai_interviewed,
      label: t("vInterviewedLabel"),
      desc: t("vInterviewedDesc"),
    },
  ];

  return (
    <section className="rounded-2xl border border-clay-100 bg-cream-50 p-4 shadow-sm">
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500">
            {t("verifiedByChai")}
          </p>
          <p className="font-serif text-lg text-ink-900">{bandLabel}</p>
        </div>
        <div
          className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 ${bandColor}`}
          title={t("trustScore")}
        >
          <span className="text-[10px] uppercase tracking-wider opacity-80">
            {t("trustScore")}
          </span>
          <span className="font-serif text-2xl leading-none">{score}</span>
        </div>
      </header>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li
            key={it.label}
            className="flex items-start gap-2 text-sm text-ink-700"
          >
            <span
              aria-hidden
              className={`mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold ${it.ok ? "bg-forest-500 text-cream-50" : "bg-cream-200 text-ink-500"}`}
            >
              {it.ok ? "✓" : "–"}
            </span>
            <span>
              <span
                className={`font-medium ${it.ok ? "text-ink-900" : "text-ink-500"}`}
              >
                {it.label}
              </span>
              <span className="block text-xs text-ink-500">{it.desc}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
