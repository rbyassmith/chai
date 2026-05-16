import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/supabase/types";

export type CurrentUserContext = {
  userId: string | null;
  email: string | null;
  profile: ProfileRow | null;
};

/**
 * Returns the current user's auth identity + profile row (if any).
 * Memoized for the duration of a single request via React's `cache()`.
 * Safe to call from multiple components in the same render.
 */
export const getCurrentUserContext = cache(async (): Promise<CurrentUserContext> => {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return { userId: null, email: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: profile ?? null,
  };
});
