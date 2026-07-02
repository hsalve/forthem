-- ForThem setup RLS fix
-- Run this in Supabase SQL Editor.
-- It allows an authenticated parent to create their co-parenting space,
-- add themselves as a family member, and add children during setup.

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.children enable row level security;
alter table public.profiles enable row level security;

-- profiles: user can manage their own profile

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_own'
  ) then
    create policy profiles_select_own
      on public.profiles
      for select
      using (id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_insert_own'
  ) then
    create policy profiles_insert_own
      on public.profiles
      for insert
      with check (id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own'
  ) then
    create policy profiles_update_own
      on public.profiles
      for update
      using (id = auth.uid())
      with check (id = auth.uid());
  end if;
end $$;

-- families: creator can insert; active members can read

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'families' and policyname = 'families_insert_creator'
  ) then
    create policy families_insert_creator
      on public.families
      for insert
      with check (created_by = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'families' and policyname = 'families_select_member_or_creator'
  ) then
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
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'families' and policyname = 'families_update_creator'
  ) then
    create policy families_update_creator
      on public.families
      for update
      using (created_by = auth.uid())
      with check (created_by = auth.uid());
  end if;
end $$;

-- family_members: users can add themselves to a family they created, and members can read family membership.

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'family_members' and policyname = 'family_members_insert_self_for_created_family'
  ) then
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
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'family_members' and policyname = 'family_members_select_self_or_same_family'
  ) then
    create policy family_members_select_self_or_same_family
      on public.family_members
      for select
      using (
        user_id = auth.uid()
        or exists (
          select 1
          from public.family_members mine
          where mine.family_id = family_members.family_id
            and mine.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- children: family members can read/add/update children in their family.

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'children' and policyname = 'children_select_family_members'
  ) then
    create policy children_select_family_members
      on public.children
      for select
      using (
        exists (
          select 1
          from public.family_members fm
          where fm.family_id = children.family_id
            and fm.user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'children' and policyname = 'children_insert_family_members'
  ) then
    create policy children_insert_family_members
      on public.children
      for insert
      with check (
        exists (
          select 1
          from public.family_members fm
          where fm.family_id = children.family_id
            and fm.user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'children' and policyname = 'children_update_family_members'
  ) then
    create policy children_update_family_members
      on public.children
      for update
      using (
        exists (
          select 1
          from public.family_members fm
          where fm.family_id = children.family_id
            and fm.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1
          from public.family_members fm
          where fm.family_id = children.family_id
            and fm.user_id = auth.uid()
        )
      );
  end if;
end $$;
