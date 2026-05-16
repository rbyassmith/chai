"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { createInitialProfile } from "./actions";

export function SignupForm() {
  const router = useRouter();
  const { t } = useLocale();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"employer" | "worker">("employer");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error: authErr } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authErr || !data.user) {
        setError(authErr?.message ?? "Could not create account.");
        return;
      }

      // Server action: insert the profiles row (and a worker stub if applicable)
      // under the user's now-active session.
      const res = await createInitialProfile({
        displayName: displayName.trim() || email.split("@")[0],
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
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-base outline-none focus:border-clay-400"
        />
      </label>

      <fieldset className="flex flex-col gap-1 text-sm">
        <legend className="text-ink-700">{t("chooseRole")}</legend>
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

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink-700">{t("email")}</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-base outline-none focus:border-clay-400"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-ink-700">{t("password")}</span>
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-clay-100 bg-cream-50 px-3 py-2 text-base outline-none focus:border-clay-400"
        />
      </label>

      {error ? (
        <p className="text-sm text-clay-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-clay-500 px-4 py-2.5 font-medium text-cream-50 transition-colors hover:bg-clay-600 disabled:opacity-60"
      >
        {t("createAccount")}
      </button>
    </form>
  );
}
