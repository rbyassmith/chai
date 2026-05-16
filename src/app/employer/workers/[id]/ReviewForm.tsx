"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { leaveReview } from "./actions";

export function ReviewForm({ workerId }: { workerId: string }) {
  const router = useRouter();
  const { t } = useLocale();
  const [pending, start] = useTransition();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await leaveReview({ workerId, rating, body });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone(true);
      setBody("");
      router.refresh();
    });
  }

  if (done) {
    return (
      <div className="rounded-xl border border-forest-200 bg-forest-50 p-3 text-sm text-forest-700">
        {t("reviewSubmitted")}{" "}
        <button
          type="button"
          onClick={() => setDone(false)}
          className="underline-offset-2 hover:underline"
        >
          + another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 rounded-xl border border-clay-100 bg-cream-50 p-3"
    >
      <p className="font-serif text-base text-ink-900">{t("leaveReview")}</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => setRating(n)}
            className={`text-2xl leading-none ${n <= rating ? "text-clay-500" : "text-ink-300"}`}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-xs text-ink-500">{rating}/5</span>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("yourReview")}
        rows={3}
        className="rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-clay-400"
      />
      {error ? <p className="text-xs text-clay-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-full bg-clay-500 px-4 py-1.5 text-sm font-medium text-cream-50 disabled:opacity-60"
      >
        {t("submitReview")}
      </button>
    </form>
  );
}
