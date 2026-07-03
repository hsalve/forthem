-- ForThem calendar event policies
-- Run in Supabase SQL Editor.
-- Enables family members to create and read calendar events.

alter table public.calendar_events enable row level security;

drop policy if exists calendar_events_select_family_members on public.calendar_events;
create policy calendar_events_select_family_members
  on public.calendar_events
  for select
  using (
    exists (
      select 1
      from public.family_members fm
      where fm.family_id = calendar_events.family_id
        and fm.user_id = auth.uid()
    )
  );

drop policy if exists calendar_events_insert_family_members on public.calendar_events;
create policy calendar_events_insert_family_members
  on public.calendar_events
  for insert
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.family_members fm
      where fm.family_id = calendar_events.family_id
        and fm.user_id = auth.uid()
    )
  );

drop policy if exists calendar_events_update_family_members on public.calendar_events;
create policy calendar_events_update_family_members
  on public.calendar_events
  for update
  using (
    exists (
      select 1
      from public.family_members fm
      where fm.family_id = calendar_events.family_id
        and fm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.family_members fm
      where fm.family_id = calendar_events.family_id
        and fm.user_id = auth.uid()
    )
  );

drop policy if exists calendar_events_delete_family_members on public.calendar_events;
create policy calendar_events_delete_family_members
  on public.calendar_events
  for delete
  using (
    exists (
      select 1
      from public.family_members fm
      where fm.family_id = calendar_events.family_id
        and fm.user_id = auth.uid()
    )
  );
