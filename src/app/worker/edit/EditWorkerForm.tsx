"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CATEGORIES,
  CATEGORY_LABELS_EN,
  LANGUAGES,
  NEIGHBORHOODS,
  type Category,
} from "@/lib/constants";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { WorkerRow, WorkHistoryRow } from "@/lib/supabase/types";
import {
  addWorkHistory,
  deleteWorkHistory,
  saveWorkerProfile,
} from "./actions";

export function EditWorkerForm({
  worker,
  history,
}: {
  worker: WorkerRow;
  history: WorkHistoryRow[];
}) {
  const router = useRouter();
  const { t } = useLocale();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [category, setCategory] = useState<Category>(worker.category);
  const [headline, setHeadline] = useState(worker.headline);
  const [bio, setBio] = useState(worker.bio);
  const [neighborhood, setNeighborhood] = useState(worker.neighborhood);
  const [years, setYears] = useState(worker.years_experience);
  const [payMin, setPayMin] = useState(worker.pay_min_kes);
  const [payMax, setPayMax] = useState(worker.pay_max_kes);
  const [languages, setLanguages] = useState<string[]>(worker.languages);

  function toggleLang(l: string) {
    setLanguages((cur) =>
      cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l],
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await saveWorkerProfile({
        workerId: worker.id,
        category,
        headline,
        bio,
        neighborhood,
        years_experience: Number(years) || 0,
        pay_min_kes: Number(payMin) || 0,
        pay_max_kes: Number(payMax) || 0,
        languages,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <h1 className="font-serif text-2xl text-ink-900">
          {t("editProfile")}
        </h1>

        <Field label={t("category")}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-base outline-none focus:border-clay-400"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS_EN[c]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Headline">
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-base outline-none focus:border-clay-400"
          />
        </Field>

        <Field label={t("bio")}>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-base outline-none focus:border-clay-400"
          />
        </Field>

        <Field label={t("neighborhood")}>
          <select
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="w-full rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-base outline-none focus:border-clay-400"
          >
            {NEIGHBORHOODS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("yearsExperience")}>
          <input
            type="number"
            min={0}
            max={60}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-base outline-none focus:border-clay-400"
          />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label={t("payRangeMin")}>
            <input
              type="number"
              min={0}
              value={payMin}
              onChange={(e) => setPayMin(Number(e.target.value))}
              className="w-full rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-base outline-none focus:border-clay-400"
            />
          </Field>
          <Field label={t("payRangeMax")}>
            <input
              type="number"
              min={0}
              value={payMax}
              onChange={(e) => setPayMax(Number(e.target.value))}
              className="w-full rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-base outline-none focus:border-clay-400"
            />
          </Field>
        </div>

        <Field label={t("languages")}>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGES.map((l) => {
              const on = languages.includes(l);
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleLang(l)}
                  className={`rounded-full px-3 py-1 text-xs ${on ? "bg-forest-500 text-cream-50" : "border border-clay-100 bg-cream-50 text-ink-700"}`}
                  aria-pressed={on}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </Field>

        {error ? (
          <p className="text-sm text-clay-600">{error}</p>
        ) : saved ? (
          <p className="text-sm text-forest-500">{t("saved")}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-full bg-clay-500 px-5 py-2 font-medium text-cream-50 hover:bg-clay-600 disabled:opacity-60"
        >
          {t("save")}
        </button>
      </form>

      <WorkHistoryEditor workerId={worker.id} initial={history} />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-ink-700">{label}</span>
      {children}
    </label>
  );
}

function WorkHistoryEditor({
  workerId,
  initial,
}: {
  workerId: string;
  initial: WorkHistoryRow[];
}) {
  const router = useRouter();
  const { t } = useLocale();
  const [, start] = useTransition();
  const [items, setItems] = useState<WorkHistoryRow[]>(initial);
  const [adding, setAdding] = useState(false);
  const [roleTitle, setRoleTitle] = useState("");
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear() - 1);
  const [endYear, setEndYear] = useState<string>("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await addWorkHistory({
        workerId,
        role_title: roleTitle,
        start_year: startYear,
        end_year: endYear ? Number(endYear) : null,
        description: desc,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRoleTitle("");
      setDesc("");
      setEndYear("");
      setAdding(false);
      router.refresh();
    });
  }

  function onDelete(id: string) {
    start(async () => {
      const res = await deleteWorkHistory(id);
      if (res.ok) {
        setItems((cur) => cur.filter((x) => x.id !== id));
        router.refresh();
      }
    });
  }

  return (
    <section>
      <h2 className="font-serif text-xl text-ink-900">{t("workHistory")}</h2>
      <ul className="mt-2 flex flex-col gap-2">
        {items.map((h) => (
          <li
            key={h.id}
            className="flex items-start gap-2 rounded-xl border border-clay-100 bg-cream-50 p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-medium text-ink-900">{h.role_title}</p>
                <p className="text-xs text-ink-500">
                  {h.start_year} – {h.end_year ?? t("present")}
                </p>
              </div>
              {h.description ? (
                <p className="mt-1 text-sm text-ink-700">{h.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDelete(h.id)}
              className="text-xs text-clay-600 hover:underline"
            >
              {t("remove")}
            </button>
          </li>
        ))}
      </ul>

      {adding ? (
        <form
          onSubmit={onAdd}
          className="mt-3 flex flex-col gap-2 rounded-xl border border-clay-100 bg-cream-50 p-3"
        >
          <input
            type="text"
            required
            placeholder={t("roleTitle")}
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            className="rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-clay-400"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              required
              placeholder={t("startYear")}
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              className="rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-clay-400"
            />
            <input
              type="number"
              placeholder={t("endYear")}
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              className="rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-clay-400"
            />
          </div>
          <textarea
            placeholder={t("description")}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            className="rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-clay-400"
          />
          {error ? <p className="text-xs text-clay-600">{error}</p> : null}
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-full bg-clay-500 px-3 py-1.5 text-xs text-cream-50 hover:bg-clay-600"
            >
              {t("save")}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-full border border-clay-200 px-3 py-1.5 text-xs text-ink-700"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 rounded-full border border-clay-300 px-4 py-1.5 text-xs text-clay-600 hover:bg-cream-100"
        >
          + {t("addEntry")}
        </button>
      )}
    </section>
  );
}
