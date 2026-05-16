"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function SignOutButton() {
  const router = useRouter();
  const { t } = useLocale();
  const [pending, start] = useTransition();

  function signOut() {
    start(async () => {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="text-xs text-ink-500 underline-offset-2 hover:underline disabled:opacity-50"
    >
      {t("signOut")}
    </button>
  );
}
