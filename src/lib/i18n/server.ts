import { cookies } from "next/headers";
import { SUPPORTED_LOCALES, type Locale } from "./dictionaries";

export const LOCALE_COOKIE = "chai_locale";

export async function getLocaleFromCookies(): Promise<Locale> {
  const c = await cookies();
  const raw = c.get(LOCALE_COOKIE)?.value;
  if (raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
    return raw as Locale;
  }
  return "en";
}
