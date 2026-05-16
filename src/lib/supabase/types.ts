/**
 * Hand-typed database row types. Mirrors /supabase/migrations/0001_init.sql.
 * Kept here so we don't depend on `supabase gen types` for the prototype.
 */

import type { Category } from "@/lib/constants";

export type ProfileRow = {
  id: string;
  role: "employer" | "worker";
  display_name: string;
  is_admin: boolean;
  neighborhood: string | null;
  created_at: string;
};

export type WorkerRow = {
  id: string;
  profile_id: string;
  category: Category;
  headline: string;
  bio: string;
  neighborhood: string;
  years_experience: number;
  pay_min_kes: number;
  pay_max_kes: number;
  languages: string[];
  id_verified: boolean;
  good_conduct_certificate: boolean;
  references_checked: boolean;
  chai_interviewed: boolean;
  rating_avg: number;
  reviews_count: number;
  placements_count: number;
  created_at: string;
};

export type WorkerWithProfile = WorkerRow & {
  profile: Pick<ProfileRow, "id" | "display_name" | "role">;
};

export type WorkHistoryRow = {
  id: string;
  worker_id: string;
  role_title: string;
  start_year: number;
  end_year: number | null;
  description: string;
  created_at: string;
};

export type ContactRequestRow = {
  id: string;
  employer_profile_id: string;
  worker_id: string;
  status: "sent";
  created_at: string;
};

export type ReviewRow = {
  id: string;
  worker_id: string;
  employer_profile_id: string;
  rating: number;
  body: string;
  created_at: string;
};
