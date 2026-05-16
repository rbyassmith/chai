"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

export async function requestContact(workerId: string): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { ok: false, error: "Not signed in." };

  // Verify the caller is an employer (RLS would block insert otherwise, but
  // give a friendly error first).
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return { ok: false, error: "No profile." };
  if (profile.role !== "employer") {
    return { ok: false, error: "Only employers can request contact." };
  }

  const { error } = await supabase.from("contact_requests").insert({
    employer_profile_id: user.id,
    worker_id: workerId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/employer/workers/${workerId}`);
  revalidatePath("/employer/activity");
  return { ok: true };
}

export async function leaveReview(args: {
  workerId: string;
  rating: number;
  body: string;
}): Promise<Result> {
  const { workerId, rating, body } = args;
  if (rating < 1 || rating > 5) {
    return { ok: false, error: "Rating must be 1–5." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { ok: false, error: "Not signed in." };

  // PRD-NOTE (Section 8.2): Reviews require a prior contact_request from this
  // employer to this worker. Enforced here in app logic; DB-level enforcement
  // is deferred to production hardening.
  const { data: existing, error: lookupErr } = await supabase
    .from("contact_requests")
    .select("id")
    .eq("employer_profile_id", user.id)
    .eq("worker_id", workerId)
    .limit(1);
  if (lookupErr) return { ok: false, error: lookupErr.message };
  if (!existing || existing.length === 0) {
    return {
      ok: false,
      error: "You must request contact before leaving a review.",
    };
  }

  const { error } = await supabase.from("reviews").insert({
    worker_id: workerId,
    employer_profile_id: user.id,
    rating,
    body: body.trim(),
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/employer/workers/${workerId}`);
  revalidatePath("/employer/activity");
  return { ok: true };
}
