import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth/context";
import { Wordmark } from "@/components/Wordmark";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LoginForm } from "./LoginForm";
import { ServerT } from "@/components/ServerT";

export default async function LoginPage() {
  const { userId } = await getCurrentUserContext();
  if (userId) redirect("/");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 py-6">
      <div className="flex items-center justify-between">
        <Wordmark />
        <LanguageToggle />
      </div>
      <div className="mt-10">
        <h1 className="font-serif text-3xl text-ink-900">
          <ServerT k="tagline" />
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          <ServerT k="employerSubhead" />
        </p>
      </div>
      <div className="mt-8 rounded-2xl border border-clay-100 bg-cream-50 p-5 shadow-sm">
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-sm text-ink-500">
        <ServerT k="noAccount" />{" "}
        <Link
          href="/signup"
          className="font-medium text-clay-600 underline-offset-2 hover:underline"
        >
          <ServerT k="signUp" />
        </Link>
      </p>
    </div>
  );
}
