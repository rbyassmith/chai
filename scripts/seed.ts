/**
 * Chai seed script — PRD Section 9.
 *
 * Idempotent-ish: reads existing demo accounts by email and upserts their
 * profile/worker rows. Generated workers are inserted fresh every run after
 * wiping the public tables (auth.users are preserved).
 *
 * Usage:
 *   npm run seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load .env.local first (Next.js convention), fall back to .env.
loadEnv({ path: ".env.local" });
loadEnv();
import { faker } from "@faker-js/faker";
import {
  CATEGORIES,
  NEIGHBORHOODS,
  type Category,
} from "../src/lib/constants";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const admin = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_PASSWORD = "chaidemo123";

// --- Realistic-ish Kenyan name pools -------------------------------------
const FIRST_M = [
  "James", "Peter", "John", "Daniel", "Joseph", "Stephen", "Michael",
  "Samuel", "David", "Kevin", "Brian", "George", "Anthony", "Charles",
  "Patrick", "Eric", "Edwin", "Francis",
];
const FIRST_F = [
  "Mary", "Grace", "Faith", "Esther", "Mercy", "Ruth", "Janet", "Joyce",
  "Lillian", "Wanjiku", "Akinyi", "Njeri", "Wambui", "Anne", "Beatrice",
  "Catherine", "Sarah", "Christine",
];
const LAST = [
  "Otieno", "Mwangi", "Kamau", "Wanjiru", "Ouma", "Achieng", "Kiplagat",
  "Cheruiyot", "Njoroge", "Mutua", "Wekesa", "Owino", "Kariuki", "Onyango",
  "Mutiso", "Maina", "Karanja", "Korir",
];

function pickName(): { first: string; last: string } {
  const useF = Math.random() < 0.55;
  const first = (useF ? FIRST_F : FIRST_M)[
    Math.floor(Math.random() * (useF ? FIRST_F.length : FIRST_M.length))
  ];
  const last = LAST[Math.floor(Math.random() * LAST.length)];
  return { first, last };
}

// --- Worker shape --------------------------------------------------------
type CategorySpec = {
  count: number;
  payMin: [number, number];
  payMax: [number, number];
  headlines: string[];
  languages: string[][];
};

const SPEC: Record<Category, CategorySpec> = {
  driver: {
    count: 5,
    payMin: [30000, 40000],
    payMax: [50000, 65000],
    headlines: [
      "Reliable family driver, school runs & airport transfers",
      "Experienced driver — Westlands & CBD routes",
      "Defensive driver, manual & automatic, family-owned",
      "Driver with mechanic background",
      "10+ yrs driving expats safely across Nairobi",
    ],
    languages: [
      ["English", "Swahili"],
      ["English", "Swahili", "Kikuyu"],
      ["English", "Swahili", "Luo"],
      ["English", "Swahili"],
      ["English", "Swahili", "Kamba"],
    ],
  },
  house_help: {
    count: 5,
    payMin: [18000, 22000],
    payMax: [25000, 35000],
    headlines: [
      "Live-out house help, attentive with young kids",
      "Detailed cleaner, comfortable with delicate fabrics",
      "Reliable house help, references from expat households",
      "House help with strong ironing & laundry skills",
      "Cheerful house help, loves working with families",
    ],
    languages: [
      ["English", "Swahili"],
      ["English", "Swahili", "Kikuyu"],
      ["English", "Swahili", "Luhya"],
      ["Swahili", "Kamba"],
      ["English", "Swahili"],
    ],
  },
  cook: {
    count: 4,
    payMin: [25000, 30000],
    payMax: [40000, 55000],
    headlines: [
      "Cook trained in Kenyan, Indian & continental cuisine",
      "Family cook — meal planning + children's lunches",
      "Vegetarian-friendly cook, big on local produce",
      "Cook with 8 yrs in expat households",
    ],
    languages: [
      ["English", "Swahili"],
      ["English", "Swahili", "Kikuyu"],
      ["English", "Swahili"],
      ["English", "Swahili", "Luo"],
    ],
  },
  security: {
    count: 3,
    payMin: [18000, 22000],
    payMax: [25000, 32000],
    headlines: [
      "Gate security, alert and calm under pressure",
      "Trained security officer, ex-G4S",
      "Night-shift gate staff, sober & punctual",
    ],
    languages: [
      ["English", "Swahili", "Kalenjin"],
      ["English", "Swahili"],
      ["Swahili", "Luo"],
    ],
  },
  nanny: {
    count: 3,
    payMin: [20000, 25000],
    payMax: [30000, 40000],
    headlines: [
      "Loving nanny, infants & toddlers",
      "Nanny with early-childhood training",
      "Nanny experienced with twins & multi-child homes",
    ],
    languages: [
      ["English", "Swahili"],
      ["English", "Swahili", "Kikuyu"],
      ["English", "Swahili"],
    ],
  },
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Ensure a Supabase Auth user exists for the given email, return its id. */
async function upsertAuthUser(email: string): Promise<string> {
  // Try lookup
  const { data: list } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  const existing = list?.users.find((u) => u.email === email);
  if (existing) return existing.id;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(`Could not create auth user ${email}: ${error?.message}`);
  }
  return data.user.id;
}

async function wipe() {
  // Delete in FK order. profiles cascade to workers/work_history/reviews/contact_requests.
  // But we keep auth.users so the demo accounts persist.
  await admin.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("contact_requests").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("work_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("workers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  // Wipe non-demo profiles only; the demo profiles are upserted next.
  await admin.from("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
}

async function upsertProfile(args: {
  id: string;
  role: "employer" | "worker";
  display_name: string;
  is_admin?: boolean;
  neighborhood?: string | null;
}) {
  const { error } = await admin.from("profiles").upsert({
    id: args.id,
    role: args.role,
    display_name: args.display_name,
    is_admin: args.is_admin ?? false,
    neighborhood: args.neighborhood ?? null,
  });
  if (error) throw error;
}

async function insertWorker(args: {
  profile_id: string;
  category: Category;
  display_name: string;
  highlyTrusted?: boolean;
  fixedHeadline?: string;
}) {
  const spec = SPEC[args.category];
  const headline = args.fixedHeadline ?? pick(spec.headlines);
  const languages = pick(spec.languages);
  const neighborhood = pick(NEIGHBORHOODS as unknown as string[]);
  const years = args.highlyTrusted ? randInt(6, 18) : randInt(1, 12);

  // Verification states: highly trusted = all true; otherwise mixed (~half all true).
  const allTrue = args.highlyTrusted || Math.random() < 0.5;
  const verif = allTrue
    ? {
        id_verified: true,
        good_conduct_certificate: true,
        references_checked: true,
        chai_interviewed: true,
      }
    : {
        id_verified: Math.random() < 0.85,
        good_conduct_certificate: Math.random() < 0.55,
        references_checked: Math.random() < 0.7,
        chai_interviewed: Math.random() < 0.45,
      };

  const payMin = randInt(spec.payMin[0], spec.payMin[1]);
  const payMax = randInt(spec.payMax[0], spec.payMax[1]);

  const bio = faker.lorem.paragraph({ min: 2, max: 4 });
  const placements = randInt(1, 25);

  const { data: w, error } = await admin
    .from("workers")
    .insert({
      profile_id: args.profile_id,
      category: args.category,
      headline,
      bio,
      neighborhood,
      years_experience: years,
      pay_min_kes: payMin,
      pay_max_kes: payMax,
      languages,
      placements_count: placements,
      ...verif,
    })
    .select("id")
    .single();
  if (error || !w) throw error ?? new Error("worker insert failed");

  // 2–4 work history entries
  const histN = randInt(2, 4);
  const currentYear = new Date().getFullYear();
  let endYearCursor: number | null = null;
  let startCursor = currentYear - 1;
  for (let i = 0; i < histN; i++) {
    const span = randInt(1, 4);
    const start = startCursor - span;
    const end = i === 0 ? null : endYearCursor;
    const { error: hErr } = await admin.from("work_history").insert({
      worker_id: w.id,
      role_title: titleFor(args.category, i),
      start_year: start,
      end_year: end,
      description: faker.lorem.sentence({ min: 8, max: 16 }),
    });
    if (hErr) throw hErr;
    endYearCursor = startCursor;
    startCursor = start - 1;
  }

  return w.id as string;
}

function titleFor(category: Category, idx: number): string {
  const pool: Record<Category, string[]> = {
    driver: [
      "Family driver",
      "School-run driver",
      "Executive driver",
      "Long-haul driver",
    ],
    house_help: [
      "House help",
      "Live-out house help",
      "Senior house help",
      "House manager",
    ],
    cook: ["Family cook", "Sous cook", "Head cook", "Catering assistant"],
    security: ["Gate security", "Night security", "Estate security", "Watchman"],
    nanny: ["Family nanny", "Toddler nanny", "Newborn nanny", "Au pair"],
  };
  return pool[category][idx % pool[category].length];
}

async function ensureEmployerProfile(args: {
  email: string;
  display_name: string;
  neighborhood: string;
  is_admin?: boolean;
}) {
  const id = await upsertAuthUser(args.email);
  await upsertProfile({
    id,
    role: "employer",
    display_name: args.display_name,
    is_admin: args.is_admin ?? false,
    neighborhood: args.neighborhood,
  });
  return id;
}

async function addReviewsForWorker(
  workerId: string,
  reviewerProfileIds: string[],
) {
  const n = randInt(2, 6);
  // Skew positive (3–5), with occasional 3s/4s.
  for (let i = 0; i < n; i++) {
    const reviewer = pick(reviewerProfileIds);
    // Ensure contact_request exists (required for review per PRD)
    await admin.from("contact_requests").insert({
      employer_profile_id: reviewer,
      worker_id: workerId,
    });
    const rating = Math.random() < 0.7 ? 5 : Math.random() < 0.6 ? 4 : 3;
    await admin.from("reviews").insert({
      worker_id: workerId,
      employer_profile_id: reviewer,
      rating,
      body: faker.lorem.sentences(randInt(1, 3)),
    });
  }
}

async function main() {
  console.log("→ Wiping public.* tables…");
  await wipe();

  console.log("→ Ensuring demo auth users…");
  const adminId = await ensureEmployerProfile({
    email: "admin@chai.demo",
    display_name: "Robert (Admin)",
    neighborhood: "Westlands",
    is_admin: true,
  });
  const employerDemoId = await ensureEmployerProfile({
    email: "employer@chai.demo",
    display_name: "Sarah M.",
    neighborhood: "Lavington",
  });
  const workerDemoAuthId = await upsertAuthUser("worker@chai.demo");

  console.log("→ Creating filler employer profiles for realistic reviews…");
  const fillerEmployerIds: string[] = [];
  for (let i = 0; i < 6; i++) {
    const { first, last } = pickName();
    const dummyEmail = `seed_employer_${i}_${Date.now()}@chai.seed`;
    const id = await upsertAuthUser(dummyEmail);
    await upsertProfile({
      id,
      role: "employer",
      display_name: `${first} ${last[0]}.`,
      neighborhood: pick(NEIGHBORHOODS as unknown as string[]),
    });
    fillerEmployerIds.push(id);
  }
  const allReviewerIds = [adminId, employerDemoId, ...fillerEmployerIds];

  console.log("→ Creating demo worker (worker@chai.demo, house_help, Highly trusted)…");
  await upsertProfile({
    id: workerDemoAuthId,
    role: "worker",
    display_name: "Grace Wanjiru",
  });
  const demoWorkerId = await insertWorker({
    profile_id: workerDemoAuthId,
    category: "house_help",
    display_name: "Grace Wanjiru",
    highlyTrusted: true,
    fixedHeadline: "Trusted house help, 9 yrs with expat families in Westlands",
  });

  console.log("→ Generating ~20 workers across categories…");
  const allWorkerIds: string[] = [demoWorkerId];

  for (const cat of CATEGORIES) {
    const target = SPEC[cat].count;
    // Demo worker already counts for house_help; reduce remaining target by 1.
    const remaining = cat === "house_help" ? target - 1 : target;
    for (let i = 0; i < remaining; i++) {
      const { first, last } = pickName();
      const display = `${first} ${last[0]}.`;
      const email = `seed_worker_${cat}_${i}_${Date.now()}@chai.seed`;
      const authId = await upsertAuthUser(email);
      await upsertProfile({
        id: authId,
        role: "worker",
        display_name: display,
      });
      // Mark ~half of each category as highly trusted (besides the demo worker).
      const highlyTrusted = Math.random() < 0.5;
      const wid = await insertWorker({
        profile_id: authId,
        category: cat,
        display_name: display,
        highlyTrusted,
      });
      allWorkerIds.push(wid);
    }
  }

  console.log("→ Seeding reviews & contact requests…");
  for (const wid of allWorkerIds) {
    await addReviewsForWorker(wid, allReviewerIds);
  }

  // Final stats
  const { count } = await admin
    .from("workers")
    .select("*", { count: "exact", head: true });
  console.log(`✅ Seed complete. Workers: ${count ?? "?"}`);
  console.log("Demo logins (password = chaidemo123):");
  console.log("  • admin@chai.demo");
  console.log("  • employer@chai.demo");
  console.log("  • worker@chai.demo");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
