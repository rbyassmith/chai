/**
 * Service-role Supabase client. NEVER import this from a Client Component or
 * any file in app/(public-ish) routes that ships JS to the browser.
 * This is used by /scripts/seed.ts only.
 *
 * PRD-NOTE: If new server-side admin operations are added later (e.g. an
 * admin verification queue in Phase 3), import from here and keep the call
 * sites inside server-only modules.
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars",
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
