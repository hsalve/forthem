// ─────────────────────────────────────────────────────────────────────────────
// ForThem — Auth service
// All authentication logic lives here. Import these functions into screens
// and context — never call supabase.auth directly from UI components.
// ─────────────────────────────────────────────────────────────────────────────

import * as WebBrowser    from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase, db }   from './supabase';
import { Alert } from 'react-native/Libraries/Alert/Alert';

// Required by expo-web-browser: closes the in-app browser tab when the app
// is reopened via the OAuth redirect deep link.
WebBrowser.maybeCompleteAuthSession();

// ── Redirect URI ──────────────────────────────────────────────────────────────
// makeRedirectUri automatically returns the right URL for the environment:
//   Expo Go  → exp://192.168.x.x:8081/--/auth/callback
//   Standalone → forthemapp://auth/callback
//
// Both need to be added to Supabase Dashboard → Authentication → URL Configuration
// → Redirect URLs. See setup steps in SUPABASE_SETUP.md.

const REDIRECT_URI = makeRedirectUri({
  scheme: 'forthemapp',
  path:   'auth/callback',
});

// ── Google OAuth ──────────────────────────────────────────────────────────────

/**
 * Open Google sign-in in an in-app browser, then extract and persist the
 * session returned by Supabase's OAuth redirect.
 *
 * Throws if Supabase returns an error or if the OAuth URL is missing.
 * Returns silently if the user cancels or dismisses the browser.
 */
export async function signInWithGoogle(): Promise<void> {
  // 1. Ask Supabase for the Google OAuth URL.
  //    skipBrowserRedirect: true — we open it ourselves via expo-web-browser
  //    so we can intercept the redirect URL and extract tokens.

  const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: REDIRECT_URI,
    skipBrowserRedirect: true,
  },
});

throw new Error(data?.url ?? "No URL returned");

  if (error)     throw error;
  if (!data?.url) throw new Error('No OAuth URL returned from Supabase');

  // 2. Open the Google sign-in page. The browser closes automatically when
  //    the redirect URL is detected (because it matches REDIRECT_URI).
  const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);

  // User cancelled or dismissed the browser — not an error.
  if (result.type !== 'success') return;

  const callbackUrl = result.url;

  // 3a. PKCE flow (Supabase default): exchange the `code` query param for tokens.
  if (callbackUrl.includes('code=')) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(callbackUrl);
    if (exchangeError) throw exchangeError;
    return;
  }

  // 3b. Implicit flow fallback: tokens arrive directly in the URL hash fragment.
  if (callbackUrl.includes('access_token=')) {
    const fragment = callbackUrl.split('#')[1] ?? '';
    const params   = Object.fromEntries(new URLSearchParams(fragment));

    if (!params.access_token || !params.refresh_token) {
      throw new Error('OAuth callback missing tokens');
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token:  params.access_token,
      refresh_token: params.refresh_token,
    });
    if (sessionError) throw sessionError;
  }
}

// ── Sign out ──────────────────────────────────────────────────────────────────

/**
 * Sign the current user out and clear AsyncStorage session.
 * The AuthContext onAuthStateChange listener picks this up and routes
 * the user back to LoginScreen automatically.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ── Profile ───────────────────────────────────────────────────────────────────

/**
 * Ensure a profile row exists for `userId`.
 *
 * The SQL trigger `handle_new_user` creates a profile automatically when a
 * user signs up for the first time. This function is a client-side safety net
 * for cases where:
 *   - The trigger ran but the profile data is stale (name/avatar changed)
 *   - The trigger failed due to a race condition
 *
 * Uses upsert so it is safe to call on every sign-in.
 */
export async function ensureProfile(
  userId: string,
  meta: {
    full_name?:  string | null;
    avatar_url?: string | null;
  }
): Promise<void> {
  // Check if the profile already exists
  const { data: existing } = await db.profiles()
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!existing) {
    // New user — insert profile. The trigger should have done this already
    // but this is the safety net.
    const { error } = await db.profiles().insert({
      id:         userId,
      full_name:  meta.full_name  ?? null,
      avatar_url: meta.avatar_url ?? null,
    });
    // Silently ignore conflict (trigger may have already inserted)
    if (error && !error.message.includes('duplicate')) {
      console.warn('[ForThem] ensureProfile insert error:', error.message);
    }
  }
  // Profile exists — no update needed. A separate "edit profile" screen
  // will handle name/avatar changes.
}
