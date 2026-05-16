"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Use sparingly — most data access in this app
 * happens through Server Components and Server Actions. The main legit use
 * case is the Demo Mode switcher's `signInWithPassword` call.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
