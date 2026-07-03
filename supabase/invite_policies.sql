-- ForThem invitation policies
-- Run in Supabase SQL Editor.
-- Enables creating and accepting co-parent invitations.

alter table public.invitations enable row level security;

-- Family members can create invites for their co-parenting space.
drop policy if exists invitations_insert_family_members on public.invitations;
create policy invitations_insert_family_members
  on public.invitations
  for insert
  with check (
    invited_by = auth.uid()
    and exists (
      select 1
      from public.family_members fm
      where fm.family_id = invitations.family_id
        and fm.user_id = auth.uid()
    )
  );

-- Anyone signed in can check a pending invite token they received.
drop policy if exists invitations_select_pending_authenticated on public.invitations;
create policy invitations_select_pending_authenticated
  on public.invitations
  for select
  using (auth.role() = 'authenticated' and status = 'pending');

-- Anyone signed in can mark the invite accepted after joining.
drop policy if exists invitations_update_pending_authenticated on public.invitations;
create policy invitations_update_pending_authenticated
  on public.invitations
  for update
  using (auth.role() = 'authenticated' and status = 'pending')
  with check (auth.role() = 'authenticated');

-- Accepting an invite means adding yourself to the invited family.
drop policy if exists family_members_insert_self_from_invite on public.family_members;
create policy family_members_insert_self_from_invite
  on public.family_members
  for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.invitations i
      where i.family_id = family_members.family_id
        and i.status = 'pending'
        and i.expires_at > now()
    )
  );
