"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/dictionaries";

export function LanguageToggle() {
  const { locale } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setLocale(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex overflow-hidden rounded-full border border-clay-100 bg-cream-50 text-xs"
    >
      {(["en", "sw"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          disabled={pending}
          className={`px-2.5 py-1 transition-colors ${l === locale ? "bg-clay-500 text-cream-50" : "text-ink-700 hover:bg-cream-200"}`}
          aria-pressed={l === locale}
        >
          {l === "en" ? "EN" : "SW"}
        </button>
      ))}
    </div>
  );
}
