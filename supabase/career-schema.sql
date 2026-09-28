-- PT. Ichikara Career
-- Jalankan satu kali di Supabase SQL Editor oleh pemilik project.
-- Seluruh objek baru memakai prefix ichikara_web_ agar tidak menyentuh sistem absensi.

create table if not exists public.ichikara_web_applications (
  id uuid primary key default gen_random_uuid(),
  job_code text not null default 'japanese-interpreter',
  status text not null default 'submitted' check (status in ('submitted', 'screening', 'interview', 'accepted', 'rejected', 'withdrawn')),
  full_name text not null,
  email text not null,
  phone text not null,
  payload jsonb not null,
  photo_path text not null,
  cv_docx_path text,
  cv_pdf_path text,
  access_token_hash text not null unique,
  access_expires_at timestamptz not null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ichikara_web_applications_email_idx
  on public.ichikara_web_applications (lower(email));
create index if not exists ichikara_web_applications_status_idx
  on public.ichikara_web_applications (status, submitted_at desc);

alter table public.ichikara_web_applications enable row level security;

-- Kandidat tidak pernah mengakses tabel langsung. Endpoint Vercel memakai service-role key.
create policy "Authenticated admin can read career applications"
  on public.ichikara_web_applications
  for select to authenticated using (true);

create policy "Authenticated admin can update career applications"
  on public.ichikara_web_applications
  for update to authenticated using (true) with check (true);

-- Storage harus PRIVATE. Buat bucket ini dari Dashboard Supabase, lalu jalankan kebijakan berikut.
insert into storage.buckets (id, name, public)
values ('ichikara-web-recruitment', 'ichikara-web-recruitment', false)
on conflict (id) do update set public = false;

create policy "Authenticated admin manages recruitment files"
  on storage.objects for all to authenticated
  using (bucket_id = 'ichikara-web-recruitment')
  with check (bucket_id = 'ichikara-web-recruitment');

-- Trigger timestamp tanpa mengubah tabel lain di project yang sama.
create or replace function public.ichikara_web_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ichikara_web_applications_updated_at on public.ichikara_web_applications;
create trigger ichikara_web_applications_updated_at
before update on public.ichikara_web_applications
for each row execute function public.ichikara_web_set_updated_at();
