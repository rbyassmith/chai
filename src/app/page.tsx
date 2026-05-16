import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth/context";

/**
 * Splash / role-aware landing.
 * Logged-in users are routed to their role's home; logged-out users land on /login.
 */
export default async function Root() {
  const { profile, userId } = await getCurrentUserContext();
  if (!userId) redirect("/login");
  if (!profile) redirect("/onboarding");
  if (profile.role === "worker") redirect("/worker");
  redirect("/employer");
}
