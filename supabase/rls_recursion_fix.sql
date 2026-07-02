-- ForThem RLS recursion fix
-- Run this in Supabase SQL Editor after rls_setup_fix.sql.
-- This fixes: infinite recursion detected in policy for relation "family_members".

-- The old same-family select policy recursively queried family_members from a family_members policy.
-- Keep family member reads simple for MVP: users can read their own membership rows.

drop policy if exists family_members_select_self_or_same_family on public.family_members;
drop policy if exists family_members_select_own on public.family_members;

create policy family_members_select_own
  on public.family_members
  for select
  using (user_id = auth.uid());

-- Keep setup insert policy simple: users can add themselves to a family they created.

drop policy if exists family_members_insert_self_for_created_family on public.family_members;

create policy family_members_insert_self_for_created_family
  on public.family_members
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.families f
      where f.id = family_members.family_id
        and f.created_by = auth.uid()
    )
  );

-- Families can be read by their creator or by a member. This references family_members,
-- but does not run inside a family_members policy, so it avoids recursion.

drop policy if exists families_select_member_or_creator on public.families;

create policy families_select_member_or_creator
  on public.families
  for select
  using (
    created_by = auth.uid()
    or exists (
      select 1
      from public.family_members fm
      where fm.family_id = families.id
        and fm.user_id = auth.uid()
    )
  );
