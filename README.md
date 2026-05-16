# Chai — Vetted household help in Nairobi (prototype)

Trust-first marketplace connecting Nairobi households with verified domestic
workers — drivers, house help, cooks, security, nannies.

This is a clickable, demo-worthy prototype built against the PRD in
`Chai-PRD.md`. It runs end-to-end with real Supabase Auth + Postgres but
deliberately skips everything in PRD Section 5 (payments, messaging, real
document upload, etc.).

## Stack

- **Next.js 16** (App Router, Turbopack, React 19)
- **TypeScript**, **Tailwind CSS v4**
- **Supabase** (Postgres + Auth) via `@supabase/ssr`
- **English + Swahili** toggle (lightweight dictionary, no i18n library)
- Mobile-first design (~390px viewport)

## Prerequisites

- Node 20+
- npm (this repo uses npm, not pnpm)
- A free **Supabase** project (instructions below)

## 1. Install

```bash
npm install
```

## 2. Create a Supabase project

If you don't already have one:

1. Go to <https://supabase.com> and sign up (or sign in).
2. Click **New project**.
   - **Name:** `chai-prototype` (anything is fine).
   - **Database password:** generate and save it somewhere; you won't need it for app development but Supabase requires it.
   - **Region:** pick the one closest to Nairobi (Frankfurt or South Africa).
3. Wait ~2 minutes for the project to provision.
4. **Disable email confirmation** (required for the demo):
   - In the Supabase dashboard, go to **Authentication → Sign In / Up → Email**.
   - Under **Email confirmations**, turn **"Confirm email"** OFF.
   - Save.
5. **Grab your keys:**
   - Go to **Project Settings → API**.
   - Copy the **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`.
   - Copy the **anon / public** key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Copy the **service_role** key (click "Reveal") → this is `SUPABASE_SERVICE_ROLE_KEY`. **Treat this like a password — never commit it.**

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and paste in the three values from step 2.5. Leave
`NEXT_PUBLIC_DEMO_MODE` set to `false` for now; you can flip it to `true`
later when doing a sales demo.

## 4. Run the database migration

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Open `supabase/migrations/0001_init.sql` from this repo, copy the entire contents.
3. Paste into the SQL editor and click **Run**.
4. Confirm the new tables exist in **Table Editor**: `profiles`, `workers`, `work_history`, `contact_requests`, `reviews`.

> Note: RLS is intentionally permissive for the prototype. Every policy marked
> `PROTOTYPE PERMISSIVE` (and any `// PRD-NOTE:` comment in the codebase) must
> be revisited before production traffic.

## 5. Seed the database

This creates three demo Supabase Auth users and ~20 realistic workers across
all categories, with mixed verification states.

```bash
npm run seed
```

You should see:

```
→ Wiping public.* tables…
→ Ensuring demo auth users…
→ Creating filler employer profiles for realistic reviews…
→ Creating demo worker (worker@chai.demo, house_help, Highly trusted)…
→ Generating ~20 workers across categories…
→ Seeding reviews & contact requests…
✅ Seed complete. Workers: 20
Demo logins (password = chaidemo123):
  • admin@chai.demo
  • employer@chai.demo
  • worker@chai.demo
```

The seed script can be re-run safely; it wipes the `public.*` tables (but
keeps the Supabase Auth users so passwords stay stable).

## 6. Start the app

```bash
npm run dev
```

Open <http://localhost:3000>.

- Logged-out users → `/login` with a link to `/signup`.
- After signup, you pick **employer** or **worker** and your profile persists.
- The demo logins above let you skip signup entirely.

## Demo Mode

The floating **"Demo Mode"** pill in the bottom-right lets a salesperson
fast-switch between the three seeded accounts in one tap. It is shown when
**either**:

- `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local` (recommended for live demos), **or**
- The logged-in user's `profile.is_admin` is `true` (only `admin@chai.demo`).

For a live demo:

```bash
# in .env.local
NEXT_PUBLIC_DEMO_MODE=true
```

Restart `npm run dev` after changing env vars.

## Project structure

```
src/
  app/
    page.tsx                       # root role-aware redirector
    login/, signup/, onboarding/   # auth flows
    employer/                      # employer-only routes (guarded in layout)
      page.tsx                     # home
      browse/                      # search + filter
      workers/[id]/                # worker detail + request contact + review
      activity/                    # my requests + reviews
    worker/                        # worker-only routes (guarded in layout)
      page.tsx                     # dashboard
      edit/                        # edit profile + work history
      interest/                    # incoming contact requests
      reviews/                     # reviews received
    api/locale/                    # POST to set language cookie
  components/                      # shared UI (Avatar, TrustPanel, etc.)
  lib/
    supabase/                      # browser/server/service clients + types
    auth/context.ts                # current-user lookup (memoized per request)
    i18n/                          # en + sw dictionaries
    trust.ts                       # Trust Score formula (PRD 8.3)
    format.ts, constants.ts
  proxy.ts                         # Next.js 16 middleware → proxy.ts; refreshes Supabase session
supabase/migrations/0001_init.sql  # schema + RLS
scripts/seed.ts                    # seed (~20 workers + 3 demo accounts)
```

## Common tasks

| Task | Command |
|---|---|
| Start dev server | `npm run dev` |
| Type-check | `npm run typecheck` |
| Lint | `npm run lint` |
| Seed / reseed | `npm run seed` |
| Production build | `npm run build && npm start` |

## Mobile demo checklist (~390px)

To verify the build looks production-grade on a phone-sized viewport:

1. Open Chrome/Safari devtools → device toolbar → **iPhone 13 mini** (375 × 812) or any ~390px width.
2. Visit `/` while logged out → you should land on `/login` with the wordmark + serif headline rendered cleanly.
3. Sign in as `employer@chai.demo` (via the form or Demo Mode).
4. Verify employer **home**:
   - Welcome headline + subhead readable.
   - Search bar fits one row, not wrapping.
   - Five category chips fit in a 3-column grid with emoji + label.
   - "Recently verified" worker cards stack vertically; trust badges + ratings render.
5. Tap a worker → verify the **profile detail** page:
   - Avatar + name + role line render at the top.
   - **Trust panel** with score badge is fully visible.
   - 3-up stat grid (`years_experience`, rating, placements) fits without horizontal scroll.
   - **Request contact** button is sticky to the bottom of the viewport and doesn't overlap content.
6. Tap **Request contact** → confirmation copy appears; **Leave a review** form unlocks below.
7. Submit a review → it appears in the list immediately.
8. Open **My activity** → both your contact request and the review you just left are listed.
9. Switch language: tap **EN/SW** in the header → page refreshes in Swahili; switch back.
10. Open **Demo Mode** (bottom-right) → tap **Demo Worker** → routed to `/worker`:
    - Worker dashboard shows the demo worker's profile, Trust panel ("Highly trusted"), and 3-up stats.
    - **Edit profile** → form fields are tappable, work-history entries can be added and removed.
    - **Incoming interest** → shows the request you sent as the employer.
    - **My reviews** → shows your seeded review(s) plus the one you just submitted.
11. Sign out from the header → you return to `/login`.
12. From `/signup`, create a brand-new account, refresh the page → your profile **persists**.

If all 12 checks pass, the prototype is demo-ready.

## Where production hardening is deferred

Search the codebase for `PRD-NOTE` — these are the spots flagged in code as
needing tightening before real traffic. The biggest two are:

- **RLS**: all "PROTOTYPE PERMISSIVE" policies in `supabase/migrations/0001_init.sql`.
- **Review gating**: enforced in app logic (`src/app/employer/workers/[id]/actions.ts`); a DB-level trigger should enforce it before production.

## License

Private / internal prototype.
