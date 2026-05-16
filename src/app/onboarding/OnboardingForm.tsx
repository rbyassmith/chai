"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { createInitialProfile } from "../signup/actions";

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const { t } = useLocale();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(defaultName);
  const [role, setRole] = useState<"employer" | "worker">("employer");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await createInitialProfile({
        displayName: displayName.trim() || defaultName,
        role,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink-700">{t("displayName")}</span>
        <input
          type="text"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-base outline-none focus:border-clay-400"
        />
      </label>
      <fieldset>
        <legend className="text-sm text-ink-700">{t("chooseRole")}</legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {(["employer", "worker"] as const).map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRole(r)}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${role === r ? "border-clay-500 bg-clay-50 text-clay-700" : "border-clay-100 bg-cream-50 text-ink-700"}`}
              aria-pressed={role === r}
            >
              {r === "employer" ? t("roleEmployer") : t("roleWorker")}
            </button>
          ))}
        </div>
      </fieldset>
      {error ? <p className="text-sm text-clay-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-clay-500 px-4 py-2.5 font-medium text-cream-50 hover:bg-clay-600 disabled:opacity-60"
      >
        {t("save")}
      </button>
    </form>
  );
}
