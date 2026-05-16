"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

/**
 * Called right after a successful `auth.signUp()` from the client. Creates the
 * profiles row, and (if role = worker) a minimal workers row the user can edit
 * from /worker/edit.
 *
 * PRD-NOTE: This trusts the client-passed role + displayName because we're
 * inside the user's session (auth.uid() must match the inserted profile.id).
 * RLS enforces that the row can only be inserted for `auth.uid()`.
 */
export async function createInitialProfile(args: {
  displayName: string;
  role: "employer" | "worker";
}): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return { ok: false, error: "Not signed in." };
  }
  const user = userData.user;

  const { error: profErr } = await supabase.from("profiles").insert({
    id: user.id,
    role: args.role,
    display_name: args.displayName,
    is_admin: false,
  });
  if (profErr) {
    return { ok: false, error: profErr.message };
  }

  if (args.role === "worker") {
    const { error: workerErr } = await supabase.from("workers").insert({
      profile_id: user.id,
      category: "house_help",
      headline: `${args.displayName} — household help`,
      bio: "",
      neighborhood: "Westlands",
      years_experience: 0,
      pay_min_kes: 18000,
      pay_max_kes: 25000,
      languages: ["English", "Swahili"],
    });
    if (workerErr) {
      return { ok: false, error: workerErr.message };
    }
  }

  return { ok: true };
}
