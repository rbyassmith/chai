import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserContext } from "@/lib/auth/context";
import { EditWorkerForm } from "./EditWorkerForm";
import type { WorkerRow, WorkHistoryRow } from "@/lib/supabase/types";

export default async function WorkerEditPage() {
  const supabase = await createSupabaseServerClient();
  const { userId } = await getCurrentUserContext();
  if (!userId) redirect("/login");

  const { data: worker } = await supabase
    .from("workers")
    .select("*, work_history(*)")
    .eq("profile_id", userId)
    .maybeSingle<WorkerRow & { work_history: WorkHistoryRow[] }>();

  if (!worker) {
    return (
      <p className="rounded-xl border border-clay-200 bg-cream-50 p-4 text-sm text-ink-700">
        Worker profile not found.
      </p>
    );
  }

  return <EditWorkerForm worker={worker} history={worker.work_history ?? []} />;
}
