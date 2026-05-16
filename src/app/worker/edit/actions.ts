"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CATEGORIES, NEIGHBORHOODS } from "@/lib/constants";

type Result = { ok: true } | { ok: false; error: string };

export async function saveWorkerProfile(args: {
  workerId: string;
  category: string;
  headline: string;
  bio: string;
  neighborhood: string;
  years_experience: number;
  pay_min_kes: number;
  pay_max_kes: number;
  languages: string[];
}): Promise<Result> {
  if (!(CATEGORIES as readonly string[]).includes(args.category)) {
    return { ok: false, error: "Invalid category." };
  }
  if (!(NEIGHBORHOODS as readonly string[]).includes(args.neighborhood)) {
    return { ok: false, error: "Invalid neighborhood." };
  }
  if (args.pay_min_kes < 0 || args.pay_max_kes < args.pay_min_kes) {
    return { ok: false, error: "Pay range invalid." };
  }
  if (args.years_experience < 0 || args.years_experience > 60) {
    return { ok: false, error: "Years of experience out of range." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("workers")
    .update({
      category: args.category,
      headline: args.headline.trim(),
      bio: args.bio.trim(),
      neighborhood: args.neighborhood,
      years_experience: args.years_experience,
      pay_min_kes: args.pay_min_kes,
      pay_max_kes: args.pay_max_kes,
      languages: args.languages,
    })
    .eq("id", args.workerId)
    .eq("profile_id", userData.user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/worker");
  revalidatePath("/worker/edit");
  return { ok: true };
}

export async function addWorkHistory(args: {
  workerId: string;
  role_title: string;
  start_year: number;
  end_year: number | null;
  description: string;
}): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase.from("work_history").insert({
    worker_id: args.workerId,
    role_title: args.role_title.trim(),
    start_year: args.start_year,
    end_year: args.end_year,
    description: args.description.trim(),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/worker");
  revalidatePath("/worker/edit");
  return { ok: true };
}

export async function deleteWorkHistory(id: string): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("work_history").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/worker");
  revalidatePath("/worker/edit");
  return { ok: true };
}
