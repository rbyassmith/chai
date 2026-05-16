import { redirect } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth/context";
import { AppShell } from "@/components/AppShell";
import { RoleNav } from "@/components/RoleNav";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, profile } = await getCurrentUserContext();
  if (!userId) redirect("/login");
  if (!profile) redirect("/onboarding");
  if (profile.role !== "employer") redirect("/worker");

  return (
    <AppShell
      nav={
        <RoleNav
          items={[
            { href: "/employer", labelKey: "home" },
            { href: "/employer/browse", labelKey: "browse" },
            { href: "/employer/activity", labelKey: "myActivity" },
          ]}
        />
      }
    >
      {children}
    </AppShell>
  );
}
