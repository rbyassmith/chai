import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { LanguageToggle } from "@/components/LanguageToggle";
import { SignOutButton } from "@/components/SignOutButton";
import { getCurrentUserContext } from "@/lib/auth/context";

/**
 * Top app bar + content container. Mobile-first: max width 480px,
 * comfortable horizontal padding, sticky header with brand + lang toggle.
 */
export async function AppShell({
  children,
  nav,
}: {
  children: React.ReactNode;
  nav?: React.ReactNode;
}) {
  const { profile } = await getCurrentUserContext();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col sm:max-w-[560px] md:max-w-[640px]">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-clay-100 bg-cream-50/85 px-4 py-3 backdrop-blur">
        <Wordmark href={profile ? (profile.role === "worker" ? "/worker" : "/employer") : "/"} />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          {profile ? <SignOutButton /> : (
            <Link
              href="/login"
              className="text-xs text-clay-600 underline-offset-2 hover:underline"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>
      {nav ? (
        <div className="border-b border-clay-100 bg-cream-50/70 px-4 py-2">
          {nav}
        </div>
      ) : null}
      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
    </div>
  );
}
