import * as WebBrowser    from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase, db }   from './supabase';

WebBrowser.maybeCompleteAuthSession();

const REDIRECT_URI = makeRedirectUri({
  scheme: 'forthemapp',
  path:   'auth/callback',
});

// ── Email / Password ──────────────────────────────────────────────────────────

/**
 * Create a new account with email + password.
 * Supabase sends a confirmation email automatically (configure in Dashboard).
 * The `handle_new_user` SQL trigger creates the profile row immediately.
 */
export async function signUpWithEmail(
  fullName: string,
  email:    string,
  password: string
): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },   // stored in auth.users.raw_user_meta_data
    },
  });
  if (error) throw error;
}

/**
 * Sign in with an existing email + password.
 * On success, supabase persists the session in AsyncStorage automatically.
 * AuthContext picks up SIGNED_IN via onAuthStateChange.
 */
export async function signInWithEmail(
  email:    string,
  password: string
): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/**
 * Send a password-reset email. Supabase emails a link that deep-links back
 * into the app (requires the forthemapp:// redirect URL to be set in Dashboard).
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: REDIRECT_URI,
  });
  if (error) throw error;
}

// ── Google OAuth ──────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<void> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: REDIRECT_URI, skipBrowserRedirect: true },
  });

  if (error)     throw error;
  if (!data?.url) throw new Error('No OAuth URL returned from Supabase');

  const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);

  if (result.type !== 'success') return;

  const url = result.url;

  if (url.includes('code=')) {
    const { error: err } = await supabase.auth.exchangeCodeForSession(url);
    if (err) throw err;
    return;
  }

  if (url.includes('access_token=')) {
    const fragment = url.split('#')[1] ?? '';
    const params   = Object.fromEntries(new URLSearchParams(fragment));
    const { error: err } = await supabase.auth.setSession({
      access_token:  params.access_token,
      refresh_token: params.refresh_token,
    });
    if (err) throw err;
  }
}

// ── Sign out ──────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ── Profile safety net ────────────────────────────────────────────────────────

export async function ensureProfile(
  userId: string,
  meta: { full_name?: string | null; avatar_url?: string | null }
): Promise<void> {
  const { data } = await db.profiles()
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!data) {
    await db.profiles().insert({
      id:         userId,
      full_name:  meta.full_name  ?? null,
      avatar_url: meta.avatar_url ?? null,
    });
  }
}
