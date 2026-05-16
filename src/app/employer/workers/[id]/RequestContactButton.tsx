"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { requestContact } from "./actions";

export function RequestContactButton({
  workerId,
  alreadyRequested,
}: {
  workerId: string;
  alreadyRequested: boolean;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(alreadyRequested);
  const [error, setError] = useState<string | null>(null);

  function click() {
    setError(null);
    start(async () => {
      const res = await requestContact(workerId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone(true);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl bg-clay-500 p-3 shadow-lg ring-1 ring-clay-700/20">
      {done ? (
        <div className="text-center text-sm text-cream-50">
          <p className="font-medium">{t("requestSent")}</p>
          <button
            type="button"
            onClick={click}
            disabled={pending}
            className="mt-1 text-[11px] underline-offset-2 hover:underline disabled:opacity-60"
          >
            {t("requestContactAgain")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={click}
          disabled={pending}
          className="block w-full rounded-xl bg-cream-50 py-3 font-medium text-clay-700 transition-colors hover:bg-cream-100 disabled:opacity-60"
        >
          {t("requestContact")}
        </button>
      )}
      {error ? (
        <p className="mt-1 text-center text-xs text-cream-100">{error}</p>
      ) : null}
    </div>
  );
}
