import { db, supabase } from '../lib/supabase';
import { Child, InsertChild } from '../lib/database.types';

export async function getUserFamily(userId: string): Promise<{ familyId: string; familyName: string | null } | null> {
  const { data: member } = await db.familyMembers()
    .select('family_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!member?.family_id) return null;

  const { data: family } = await db.families()
    .select('id, name')
    .eq('id', member.family_id)
    .maybeSingle();

  if (!family) return null;
  return { familyId: family.id, familyName: family.name };
}

export async function createFamily(name: string, userId: string, displayName?: string | null): Promise<string> {
  const { data: family, error: familyErr } = await db.families()
    .insert({ name: name.trim(), created_by: userId })
    .select('id')
    .single();

  if (familyErr) throw familyErr;

  const { error: memberErr } = await db.familyMembers()
    .insert({ family_id: family.id, user_id: userId, role: 'parent', display_name: displayName?.trim() || null });

  if (memberErr) throw memberErr;
  return family.id;
}

export async function createInvitation(familyId: string, email: string, invitedBy: string) {
  const { data, error } = await db.invitations()
    .insert({ family_id: familyId, invited_by: invitedBy, email: email.trim().toLowerCase() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInvitationByToken(token: string) {
  const { data } = await db.invitations()
    .select('*')
    .eq('token', token.trim())
    .eq('status', 'pending')
    .maybeSingle();

  if (!data) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  const { data: family } = await db.families()
    .select('name')
    .eq('id', data.family_id)
    .maybeSingle();

  return { ...data, familyName: family?.name ?? null };
}

export async function acceptInvitation(token: string, userId: string): Promise<string> {
  const invite = await getInvitationByToken(token);
  if (!invite) throw new Error('Invitation is invalid or has expired.');

  const { data: existing } = await db.familyMembers()
    .select('id')
    .eq('family_id', invite.family_id)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existing) {
    const { error: memberErr } = await db.familyMembers()
      .insert({ family_id: invite.family_id, user_id: userId, role: 'parent' });
    if (memberErr) throw memberErr;
  }

  await db.invitations().update({ status: 'accepted' }).eq('id', invite.id);
  return invite.family_id;
}

export async function getFamilyChildren(familyId: string): Promise<Child[]> {
  const { data } = await db.children()
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });

  return data ?? [];
}

export async function addChild(
  familyId: string,
  childData: Pick<InsertChild, 'full_name' | 'date_of_birth' | 'school_name' | 'notes'>
): Promise<Child> {
  const { data, error } = await db.children()
    .insert({ family_id: familyId, ...childData })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateChild(
  childId: string,
  childData: Partial<Pick<InsertChild, 'full_name' | 'date_of_birth' | 'school_name' | 'notes'>>
): Promise<Child> {
  const { data, error } = await db.children()
    .update(childData)
    .eq('id', childId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateParentProfile(userId: string, fullName: string) {
  const cleanName = fullName.trim();

  const { error: authErr } = await supabase.auth.updateUser({ data: { full_name: cleanName } });
  if (authErr) throw authErr;

  const { error: profileErr } = await db.profiles()
    .upsert({ id: userId, full_name: cleanName }, { onConflict: 'id' });

  if (profileErr) throw profileErr;
}
