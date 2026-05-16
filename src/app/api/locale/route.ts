import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "@/lib/i18n/server";
import { SUPPORTED_LOCALES } from "@/lib/i18n/dictionaries";

/**
 * POST /api/locale
 * Body: { locale: 'en' | 'sw' }
 * Sets the locale cookie. Used by the in-page language toggle.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const locale = body?.locale;
  if (!SUPPORTED_LOCALES.includes(locale)) {
    return NextResponse.json({ error: "invalid locale" }, { status: 400 });
  }
  const c = await cookies();
  c.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return NextResponse.json({ ok: true });
}
