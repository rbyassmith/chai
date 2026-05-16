-- Chai prototype — initial schema (PRD v0.1, Section 8).
--
-- Run this in the Supabase SQL editor (Project → SQL → New query) the very
-- first time you set up the project. It is idempotent enough to re-run on a
-- fresh DB but does NOT attempt to migrate from a prior shape — for the
-- prototype, just reset the project if you change the schema.
--
-- PRD-NOTE: RLS is intentionally permissive for the prototype so the demo
-- loop is friction-free. Every policy here marked "PROTOTYPE PERMISSIVE"
-- must be tightened (or removed) before any production traffic.

-- Required extensions ------------------------------------------------------
create extension if not exists "pgcrypto";

-- profiles -----------------------------------------------------------------
-- 1:1 with auth.users. Row is created either by the post-signup server action
-- (real users) or by the seed script (demo users).
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null check (role in ('employer', 'worker')),
  display_name  text not null,
  is_admin      boolean not null default false,
  neighborhood  text,
  created_at    timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

-- workers ------------------------------------------------------------------
create table if not exists public.workers (
  id                       uuid primary key default gen_random_uuid(),
  profile_id               uuid not null unique references public.profiles(id) on delete cascade,
  category                 text not null check (category in ('driver','house_help','cook','security','nanny')),
  headline                 text not null,
  bio                      text not null default '',
  neighborhood             text not null,
  years_experience         int  not null default 0,
  pay_min_kes              int  not null default 0,
  pay_max_kes              int  not null default 0,
  languages                text[] not null default '{}',
  id_verified              boolean not null default false,
  good_conduct_certificate boolean not null default false,
  references_checked       boolean not null default false,
  chai_interviewed         boolean not null default false,
  rating_avg               numeric(2,1) not null default 0,
  reviews_count            int not null default 0,
  placements_count         int not null default 0,
  created_at               timestamptz not null default now()
);

create index if not exists workers_category_idx     on public.workers(category);
create index if not exists workers_neighborhood_idx on public.workers(neighborhood);
create index if not exists workers_rating_idx       on public.workers(rating_avg desc);

-- work_history -------------------------------------------------------------
create table if not exists public.work_history (
  id          uuid primary key default gen_random_uuid(),
  worker_id   uuid not null references public.workers(id) on delete cascade,
  role_title  text not null,
  start_year  int  not null,
  end_year    int,           -- null = "present"
  description text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists work_history_worker_idx on public.work_history(worker_id);

-- contact_requests ---------------------------------------------------------
create table if not exists public.contact_requests (
  id                   uuid primary key default gen_random_uuid(),
  employer_profile_id  uuid not null references public.profiles(id) on delete cascade,
  worker_id            uuid not null references public.workers(id)  on delete cascade,
  status               text not null default 'sent' check (status in ('sent')),
  created_at           timestamptz not null default now()
);

create index if not exists contact_requests_employer_idx on public.contact_requests(employer_profile_id);
create index if not exists contact_requests_worker_idx   on public.contact_requests(worker_id);

-- reviews ------------------------------------------------------------------
-- PRD-NOTE: PRD Section 8.2 requires that a review can only be created by an
-- employer who has an existing contact_request for that worker. This is
-- enforced in app logic (see src/app/(employer)/workers/[id]/actions.ts).
-- DB-level enforcement (e.g. a trigger) is deferred to production hardening.
create table if not exists public.reviews (
  id                   uuid primary key default gen_random_uuid(),
  worker_id            uuid not null references public.workers(id)  on delete cascade,
  employer_profile_id  uuid not null references public.profiles(id) on delete cascade,
  rating               int  not null check (rating between 1 and 5),
  body                 text not null default '',
  created_at           timestamptz not null default now()
);

create index if not exists reviews_worker_idx   on public.reviews(worker_id);
create index if not exists reviews_employer_idx on public.reviews(employer_profile_id);

-- Trigger: keep workers.rating_avg + reviews_count in sync ------------------
create or replace function public.recompute_worker_rating(p_worker_id uuid)
returns void
language plpgsql
as $$
declare
  v_count int;
  v_avg   numeric(2,1);
begin
  select count(*)::int,
         coalesce(round(avg(rating)::numeric, 1), 0)
    into v_count, v_avg
    from public.reviews
   where worker_id = p_worker_id;

  update public.workers
     set reviews_count = v_count,
         rating_avg    = v_avg
   where id = p_worker_id;
end;
$$;

create or replace function public.reviews_after_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recompute_worker_rating(old.worker_id);
    return old;
  else
    perform public.recompute_worker_rating(new.worker_id);
    return new;
  end if;
end;
$$;

drop trigger if exists reviews_after_change_trg on public.reviews;
create trigger reviews_after_change_trg
after insert or update or delete on public.reviews
for each row execute function public.reviews_after_change();

-- RLS ----------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.workers          enable row level security;
alter table public.work_history     enable row level security;
alter table public.contact_requests enable row level security;
alter table public.reviews          enable row level security;

-- Drop & recreate policies (idempotent for re-runs)
drop policy if exists "profiles_read_all"            on public.profiles;
drop policy if exists "profiles_write_self"          on public.profiles;
drop policy if exists "profiles_update_self"         on public.profiles;
drop policy if exists "workers_read_all"             on public.workers;
drop policy if exists "workers_write_owner"          on public.workers;
drop policy if exists "workers_update_owner"         on public.workers;
drop policy if exists "work_history_read_all"        on public.work_history;
drop policy if exists "work_history_write_owner"     on public.work_history;
drop policy if exists "work_history_update_owner"    on public.work_history;
drop policy if exists "work_history_delete_owner"    on public.work_history;
drop policy if exists "contact_requests_read_party"  on public.contact_requests;
drop policy if exists "contact_requests_insert_self" on public.contact_requests;
drop policy if exists "reviews_read_all"             on public.reviews;
drop policy if exists "reviews_insert_self"          on public.reviews;

-- profiles
-- PROTOTYPE PERMISSIVE: everyone may read all profiles (display names + role).
-- PRD-NOTE: tighten before production — likely restrict full PII to owner only.
create policy "profiles_read_all"  on public.profiles for select using (true);
create policy "profiles_write_self" on public.profiles for insert
  with check (auth.uid() = id);
create policy "profiles_update_self" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- workers
-- PROTOTYPE PERMISSIVE: full worker rows are publicly readable. Production
-- should hide unverified workers from browse and restrict pay edits to owner.
create policy "workers_read_all" on public.workers for select using (true);
create policy "workers_write_owner" on public.workers for insert
  with check (auth.uid() = profile_id);
create policy "workers_update_owner" on public.workers for update
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- work_history
create policy "work_history_read_all" on public.work_history for select using (true);
create policy "work_history_write_owner" on public.work_history for insert
  with check (
    exists (
      select 1 from public.workers w
       where w.id = worker_id and w.profile_id = auth.uid()
    )
  );
create policy "work_history_update_owner" on public.work_history for update
  using (
    exists (
      select 1 from public.workers w
       where w.id = worker_id and w.profile_id = auth.uid()
    )
  );
create policy "work_history_delete_owner" on public.work_history for delete
  using (
    exists (
      select 1 from public.workers w
       where w.id = worker_id and w.profile_id = auth.uid()
    )
  );

-- contact_requests
-- PROTOTYPE PERMISSIVE: parties can read their own rows; employer can insert
-- on behalf of self. Worker cannot list employer info beyond display_name
-- joins. PRD-NOTE: tighten/lock down before production.
create policy "contact_requests_read_party" on public.contact_requests for select
  using (
    auth.uid() = employer_profile_id
    or exists (
      select 1 from public.workers w
       where w.id = worker_id and w.profile_id = auth.uid()
    )
  );
create policy "contact_requests_insert_self" on public.contact_requests for insert
  with check (auth.uid() = employer_profile_id);

-- reviews
-- PROTOTYPE PERMISSIVE: public read; insert only by the employer themselves.
-- PRD-NOTE: enforce "must have a prior contact_request" via trigger before
-- production. App layer enforces it for now.
create policy "reviews_read_all" on public.reviews for select using (true);
create policy "reviews_insert_self" on public.reviews for insert
  with check (auth.uid() = employer_profile_id);
