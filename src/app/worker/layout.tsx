import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth/context";
import { AppShell } from "@/components/AppShell";
import { RoleNav } from "@/components/RoleNav";

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, profile } = await getCurrentUserContext();
  if (!userId) redirect("/login");
  if (!profile) redirect("/onboarding");
  if (profile.role !== "worker") redirect("/employer");

  return (
    <AppShell
      nav={
        <RoleNav
          items={[
            { href: "/worker", labelKey: "dashboard" },
            { href: "/worker/edit", labelKey: "editProfile" },
            { href: "/worker/interest", labelKey: "incomingInterest" },
            { href: "/worker/reviews", labelKey: "myReviews" },
          ]}
        />
      }
    >
      {children}
    </AppShell>
  );
}
