"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function LoginForm() {
  const router = useRouter();
  const { t } = useLocale();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        setError(err.message);
        return;
      }
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
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
          autoComplete="current-password"
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
        {t("signIn")}
      </button>
    </form>
  );
}
