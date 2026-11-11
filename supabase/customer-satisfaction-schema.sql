create table public.ichikara_web_feedback_admins (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.ichikara_web_feedback_admins enable row level security;
grant select on public.ichikara_web_feedback_admins to authenticated;
create policy feedback_admin_self on public.ichikara_web_feedback_admins for select to authenticated using (user_id=(select auth.uid()));
create table public.ichikara_web_customer_feedback (
 id uuid primary key,
 company text not null check (length(company) between 1 and 160),
 respondent_name text not null check (length(respondent_name) between 1 and 160),
 interpreter_name text not null check (length(interpreter_name) between 1 and 160),
 assignment_date date not null,
 locale text not null check (locale in ('id','ja','en')),
 scores integer[] not null check (array_length(scores,1)=6 and 1<=all(scores) and 4>=all(scores)),
 rating integer not null check (rating between 1 and 5),
 criticism text not null check (length(criticism) between 1 and 4000),
 suggestions text not null check (length(suggestions) between 1 and 4000),
 email_status text not null default 'pending' check (email_status in ('pending','accepted','partial_failure')),
 email_results jsonb not null default '[]'::jsonb,
 submitted_at timestamptz not null default now()
);
create index ichikara_web_feedback_submitted_idx on public.ichikara_web_customer_feedback(submitted_at desc);
alter table public.ichikara_web_customer_feedback enable row level security;
revoke all on public.ichikara_web_customer_feedback from anon,authenticated;
grant select on public.ichikara_web_customer_feedback to authenticated;
grant all on public.ichikara_web_customer_feedback to service_role;
grant all on public.ichikara_web_feedback_admins to service_role;
create policy feedback_admin_read on public.ichikara_web_customer_feedback for select to authenticated using (exists(select 1 from public.ichikara_web_feedback_admins a where a.user_id=(select auth.uid())));
-- Preserve existing website-admin eligibility at rollout; future users require explicit assignment.
insert into public.ichikara_web_feedback_admins(user_id) select id from auth.users where is_anonymous=false on conflict do nothing;
