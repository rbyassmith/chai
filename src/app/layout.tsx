import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { getLocaleFromCookies } from "@/lib/i18n/server";
import { DemoSwitcher } from "@/components/DemoSwitcher";
import { getCurrentUserContext } from "@/lib/auth/context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  title: "Chai — Vetted household help in Nairobi",
  description:
    "Trust-first marketplace connecting Nairobi households with verified domestic workers — drivers, house help, cooks, security, nannies.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocaleFromCookies();
  const { profile } = await getCurrentUserContext();
  const demoModeEnv = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const showDemoSwitcher = demoModeEnv || Boolean(profile?.is_admin);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink-900">
        <LocaleProvider locale={locale}>
          {children}
          {showDemoSwitcher ? <DemoSwitcher /> : null}
        </LocaleProvider>
      </body>
    </html>
  );
}
