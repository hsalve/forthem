-- ForThem parenting plan storage + RLS
-- Run once in Supabase SQL Editor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'parenting-plans',
  'parenting-plans',
  false,
  20971520,
  array['application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = array['application/pdf'];

alter table public.parenting_plans enable row level security;

drop policy if exists parenting_plans_select_members on public.parenting_plans;
create policy parenting_plans_select_members
  on public.parenting_plans
  for select
  using (
    exists (
      select 1 from public.family_members fm
      where fm.family_id = parenting_plans.family_id
        and fm.user_id = auth.uid()
    )
  );

drop policy if exists parenting_plans_insert_members on public.parenting_plans;
create policy parenting_plans_insert_members
  on public.parenting_plans
  for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.family_members fm
      where fm.family_id = parenting_plans.family_id
        and fm.user_id = auth.uid()
    )
  );

drop policy if exists parenting_plans_delete_members on public.parenting_plans;
create policy parenting_plans_delete_members
  on public.parenting_plans
  for delete
  using (
    exists (
      select 1 from public.family_members fm
      where fm.family_id = parenting_plans.family_id
        and fm.user_id = auth.uid()
    )
  );

-- The first folder in every object path is family_id.
drop policy if exists parenting_plan_files_select_members on storage.objects;
create policy parenting_plan_files_select_members
  on storage.objects
  for select
  using (
    bucket_id = 'parenting-plans'
    and exists (
      select 1 from public.family_members fm
      where fm.family_id::text = (storage.foldername(name))[1]
        and fm.user_id = auth.uid()
    )
  );

drop policy if exists parenting_plan_files_insert_members on storage.objects;
create policy parenting_plan_files_insert_members
  on storage.objects
  for insert
  with check (
    bucket_id = 'parenting-plans'
    and exists (
      select 1 from public.family_members fm
      where fm.family_id::text = (storage.foldername(name))[1]
        and fm.user_id = auth.uid()
    )
  );

drop policy if exists parenting_plan_files_delete_members on storage.objects;
create policy parenting_plan_files_delete_members
  on storage.objects
  for delete
  using (
    bucket_id = 'parenting-plans'
    and exists (
      select 1 from public.family_members fm
      where fm.family_id::text = (storage.foldername(name))[1]
        and fm.user_id = auth.uid()
    )
  );
