// ─────────────────────────────────────────────────────────────────────────────
// ForThem — Family Service
// All database operations for families, children, and invitations.
// Never call supabase directly from screens — use these functions.
// ─────────────────────────────────────────────────────────────────────────────

import { db } from '../lib/supabase';
import { Child, InsertChild } from '../lib/database.types';

// ── Family ────────────────────────────────────────────────────────────────────

/** Returns the family the current user belongs to, or null. */
export async function getUserFamily(
  userId: string
): Promise<{ familyId: string; familyName: string | null } | null> {
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

/**
 * Create a new family and add the creator as a parent member.
 * Returns the new familyId.
 */
export async function createFamily(
  name:         string,
  userId:       string,
  displayName?: string
): Promise<string> {
  // 1. Insert the family row
  const { data: family, error: familyErr } = await db.families()
    .insert({ name: name.trim(), created_by: userId })
    .select('id')
    .single();

  if (familyErr) throw familyErr;

  // 2. Add the creator as a member
  const { error: memberErr } = await db.familyMembers()
    .insert({
      family_id:    family.id,
      user_id:      userId,
      role:         'parent',
      display_name: displayName?.trim() || null,
    });

  if (memberErr) throw memberErr;

  return family.id;
}

// ── Invitations ───────────────────────────────────────────────────────────────

/**
 * Create an invitation for the co-parent.
 * Returns the invitation including the generated token.
 */
export async function createInvitation(
  familyId:  string,
  email:     string,
  invitedBy: string
) {
  const { data, error } = await db.invitations()
    .insert({ family_id: familyId, invited_by: invitedBy, email: email.trim().toLowerCase() })
    .select()
    .single();

  if (error) throw error;
  return data;  // data.token = the shareable token
}

/**
 * Look up an invitation by token.
 * Returns the invitation + family name, or null if not found/expired.
 */
export async function getInvitationByToken(token: string) {
  const { data } = await db.invitations()
    .select('*')
    .eq('token', token.trim())
    .eq('status', 'pending')
    .maybeSingle();

  if (!data) return null;

  // Check expiry client-side as a belt-and-suspenders check
  if (new Date(data.expires_at) < new Date()) return null;

  // Fetch family name separately
  const { data: family } = await db.families()
    .select('name')
    .eq('id', data.family_id)
    .maybeSingle();

  return { ...data, familyName: family?.name ?? null };
}

/**
 * Accept an invitation: add user to the family, mark invitation accepted.
 * Returns the familyId they joined.
 */
export async function acceptInvitation(
  token:  string,
  userId: string
): Promise<string> {
  const invite = await getInvitationByToken(token);
  if (!invite) throw new Error('Invitation is invalid or has expired.');

  // Check user isn't already in this family
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

  // Mark invitation accepted
  await db.invitations()
    .update({ status: 'accepted' })
    .eq('id', invite.id);

  return invite.family_id;
}

// ── Children ──────────────────────────────────────────────────────────────────

/** Fetch all children in a family, ordered oldest first. */
export async function getFamilyChildren(familyId: string): Promise<Child[]> {
  const { data } = await db.children()
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });

  return data ?? [];
}

/** Add a child to a family. Returns the new child row. */
export async function addChild(
  familyId: string,
  childData: Pick<InsertChild, 'full_name' | 'date_of_birth' | 'school_name'>
): Promise<Child> {
  const { data, error } = await db.children()
    .insert({ family_id: familyId, ...childData })
    .select()
    .single();

  if (error) throw error;
  return data;
}
