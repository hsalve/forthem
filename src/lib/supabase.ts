// ─────────────────────────────────────────────────────────────────────────────
// ForThem — Supabase Client
// Single instance. Import `supabase` everywhere — never call createClient again.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from './database.types';

// ── Environment ───────────────────────────────────────────────────────────────

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[ForThem] Missing Supabase env vars.\n' +
    'Copy .env.example → .env and fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

// ── Client ────────────────────────────────────────────────────────────────────

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage:           AsyncStorage,
      autoRefreshToken:  true,
      persistSession:    true,
      detectSessionInUrl:false,   // Required for React Native — no browser URL
    },
  }
);

// ── Typed table helpers ───────────────────────────────────────────────────────
// Convenience aliases so every call site has autocomplete on columns/filters.

export const db = {
  profiles:        () => supabase.from('profiles'),
  families:        () => supabase.from('families'),
  familyMembers:   () => supabase.from('family_members'),
  children:        () => supabase.from('children'),
  invitations:     () => supabase.from('invitations'),
  parentingPlans:  () => supabase.from('parenting_plans'),
  custodySchedule: () => supabase.from('custody_schedule'),
  calendarEvents:  () => supabase.from('calendar_events'),
  swaps:           () => supabase.from('swaps'),
  expenses:        () => supabase.from('expenses'),
  documents:       () => supabase.from('documents'),
} as const;

// ── Storage helpers ───────────────────────────────────────────────────────────

export const storage = {
  documents: supabase.storage.from('documents'),
  receipts:  supabase.storage.from('receipts'),
  avatars:   supabase.storage.from('avatars'),
} as const;

// ── Auth helpers ──────────────────────────────────────────────────────────────

/** Returns the currently signed-in user, or null. */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Returns the current session, or null. */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/** Sign out and clear local session. */
export async function signOut() {
  return supabase.auth.signOut();
}

// ── Usage examples ────────────────────────────────────────────────────────────
// These are documentation-only — delete before production.
//
// Fetch all swaps for the current user's family:
//   const { data, error } = await db.swaps()
//     .select('*')
//     .order('created_at', { ascending: false });
//
// Insert an expense:
//   const { data, error } = await db.expenses()
//     .insert({ family_id, paid_by, title, amount, category })
//     .select()
//     .single();
//
// Update a swap status:
//   const { error } = await db.swaps()
//     .update({ status: 'approved', responded_by: userId, responded_at: new Date().toISOString() })
//     .eq('id', swapId);
//
// Upload a document:
//   const { data, error } = await storage.documents.upload(path, file);
//   const { data: { publicUrl } } = storage.documents.getPublicUrl(path);
