import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js 16 renamed middleware.ts → proxy.ts. This refreshes the Supabase
 * auth cookies on every request so Server Components see an up-to-date
 * session. NEVER move auth logic out of this file into a downstream guard —
 * each request must hit this path for the session to refresh correctly.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Re-validate the session against the Auth server.
  // PRD-NOTE: Never trust getSession() in protected contexts; always getUser().
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Match every request except static/asset files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
