"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const DEMO_ACCOUNTS = [
  { key: "admin",    email: "admin@chai.demo",    labelKey: "demoAdmin"    as const, color: "bg-clay-500" },
  { key: "employer", email: "employer@chai.demo", labelKey: "demoEmployer" as const, color: "bg-forest-500" },
  { key: "worker",   email: "worker@chai.demo",   labelKey: "demoWorker"   as const, color: "bg-clay-400" },
];

const DEMO_PASSWORD = "chaidemo123";

/**
 * Floating demo switcher. Rendered globally by RootLayout when either:
 *   - NEXT_PUBLIC_DEMO_MODE === "true", or
 *   - the logged-in user's profile.is_admin === true.
 *
 * Performs a real signInWithPassword against the seeded accounts, then
 * navigates to the role's home.
 */
export function DemoSwitcher() {
  const router = useRouter();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [active, setActive] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function signInAs(email: string, key: string) {
    setError(null);
    setActive(key);
    start(async () => {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password: DEMO_PASSWORD,
      });
      setActive(null);
      if (err) {
        setError(err.message);
        return;
      }
      router.replace("/");
      router.refresh();
      setOpen(false);
    });
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="w-64 rounded-2xl border border-clay-200 bg-cream-50 p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-serif text-base text-clay-700">
              {t("demoMode")}
            </p>
            <button
              type="button"
              className="text-xs text-ink-500 hover:underline"
              onClick={() => setOpen(false)}
            >
              {t("demoClose")}
            </button>
          </div>
          <p className="mb-2 text-[11px] text-ink-500">
            {t("demoSignInAs")}:
          </p>
          <div className="flex flex-col gap-1.5">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.key}
                type="button"
                disabled={pending}
                onClick={() => signInAs(a.email, a.key)}
                className={`flex items-center justify-between rounded-lg ${a.color} px-3 py-2 text-sm text-cream-50 transition-opacity disabled:opacity-60`}
              >
                <span>{t(a.labelKey)}</span>
                <span className="text-[10px] opacity-80">
                  {active === a.key && pending ? t("demoSwitching") : a.email}
                </span>
              </button>
            ))}
          </div>
          {error ? (
            <p className="mt-2 text-xs text-clay-600">
              {error}. Did you run the seed script?
            </p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-clay-500 px-4 py-2 text-xs font-semibold text-cream-50 shadow-lg ring-1 ring-clay-700/30 hover:bg-clay-600"
        >
          {t("demoMode")}
        </button>
      )}
    </div>
  );
}
