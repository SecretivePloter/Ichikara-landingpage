-- Jalankan file ini bila tabel Career sebelumnya sudah ada.
-- Hanya membuat objek pendaftaran siswa, tanpa mengubah tabel atau file lain.

create table if not exists public.ichikara_web_course_enrollments (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'submitted' check (status in ('submitted', 'contacted', 'enrolled', 'cancelled')),
  full_name text not null,
  email text not null,
  phone text not null,
  place_of_birth text not null,
  birth_date date not null,
  address text not null,
  school_or_company text not null,
  aspiration text not null,
  photo_path text not null,
  card_xlsx_path text not null,
  access_token_hash text not null unique,
  access_expires_at timestamptz not null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ichikara_web_course_enrollments_email_idx
  on public.ichikara_web_course_enrollments (lower(email));
create index if not exists ichikara_web_course_enrollments_status_idx
  on public.ichikara_web_course_enrollments (status, submitted_at desc);

alter table public.ichikara_web_course_enrollments enable row level security;

do $$ begin
  create policy "Authenticated admin can read course enrollments"
    on public.ichikara_web_course_enrollments for select to authenticated using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Authenticated admin can update course enrollments"
    on public.ichikara_web_course_enrollments for update to authenticated using (true) with check (true);
exception when duplicate_object then null;
end $$;

create or replace function public.ichikara_web_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ichikara_web_course_enrollments_updated_at on public.ichikara_web_course_enrollments;
create trigger ichikara_web_course_enrollments_updated_at
before update on public.ichikara_web_course_enrollments
for each row execute function public.ichikara_web_set_updated_at();
