import { getLocaleFromCookies } from "@/lib/i18n/server";
import { t, type DictKey } from "@/lib/i18n/dictionaries";

/**
 * Tiny server-side translator. Use in Server Components where pulling in the
 * Client-side `useLocale()` hook would force a 'use client' boundary.
 */
export async function ServerT({ k }: { k: DictKey }) {
  const locale = await getLocaleFromCookies();
  return <>{t(locale, k)}</>;
}
