import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth/context";
import { Wordmark } from "@/components/Wordmark";
import { OnboardingForm } from "./OnboardingForm";

/**
 * Fallback for users who exist in auth.users but have no profile row yet
 * (e.g. a seeded user that didn't get a profile, or a signup that errored
 * between auth.signUp and createInitialProfile). Lets them pick a role and
 * finishes their profile.
 */
export default async function OnboardingPage() {
  const { userId, email, profile } = await getCurrentUserContext();
  if (!userId) redirect("/login");
  if (profile) redirect("/");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 py-6">
      <Wordmark />
      <h1 className="mt-8 font-serif text-2xl text-ink-900">
        One more step
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Tell us how you&apos;ll use Chai. You can change this later.
      </p>
      <div className="mt-6 rounded-2xl border border-clay-100 bg-cream-50 p-5 shadow-sm">
        <OnboardingForm defaultName={email?.split("@")[0] ?? ""} />
      </div>
    </div>
  );
}
