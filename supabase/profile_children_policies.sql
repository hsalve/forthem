-- ForThem profile/children policy updates
-- Run in Supabase SQL Editor.
-- Enables child deletion and co-parenting space rename for active family members.

-- Allow family members to rename the co-parenting space.
drop policy if exists families_update_creator on public.families;
drop policy if exists families_update_family_members on public.families;

create policy families_update_family_members
  on public.families
  for update
  using (
    exists (
      select 1
      from public.family_members fm
      where fm.family_id = families.id
        and fm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.family_members fm
      where fm.family_id = families.id
        and fm.user_id = auth.uid()
    )
  );

-- Allow family members to delete child profiles in their co-parenting space.
drop policy if exists children_delete_family_members on public.children;

create policy children_delete_family_members
  on public.children
  for delete
  using (
    exists (
      select 1
      from public.family_members fm
      where fm.family_id = children.family_id
        and fm.user_id = auth.uid()
    )
  );
