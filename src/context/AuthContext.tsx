// ─────────────────────────────────────────────────────────────────────────────
// ForThem — Auth Context
// Wrap the app in <AuthProvider> once (in RootNavigator).
// Access session/user/signOut anywhere via useAuth().
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase }      from '../lib/supabase';
import { signOut as authSignOut, ensureProfile } from '../lib/auth';

// ── Types ─────────────────────────────────────────────────────────────────────

type AuthContextValue = {
  /** Current Supabase session, or null if not signed in */
  session:      Session | null;
  /** Convenience shorthand for session?.user */
  user:         User    | null;
  /** True while we're checking AsyncStorage for a persisted session on mount */
  loading:      boolean;
  /** Sign the current user out */
  signOut:      () => Promise<void>;
  /** True while signOut is in progress */
  signingOut:   boolean;
};

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  session:    null,
  user:       null,
  loading:    true,
  signOut:    async () => {},
  signingOut: false,
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session,    setSession]    = useState<Session | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    // ── 1. Restore persisted session from AsyncStorage ──────────────────────
    // This runs once on mount. If the user had an active session from a
    // previous app launch it will be restored here without a sign-in prompt.
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.warn('[ForThem] getSession error:', error.message);
      setSession(session);
      setLoading(false);
    });

    // ── 2. Subscribe to future auth state changes ───────────────────────────
    // This fires on: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        setSession(newSession);
        setLoading(false);

        if (event === 'SIGNED_IN' && newSession?.user) {
          // Ensure the profile row exists (safety net on top of the SQL trigger).
          const { user } = newSession;
          await ensureProfile(user.id, {
            full_name:  user.user_metadata?.full_name  ?? user.email ?? null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
          });
        }
      }
    );

    // Cleanup subscription when the component unmounts
    return () => { subscription.unsubscribe(); };
  }, []);

  // ── Sign out ───────────────────────────────────────────────────────────────

  const signOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await authSignOut();
      // onAuthStateChange fires with SIGNED_OUT → setSession(null) → nav updates
    } catch (error: any) {
      console.error('[ForThem] signOut error:', error.message);
    } finally {
      setSigningOut(false);
    }
  }, []);

  // ── Value ──────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider value={{
      session,
      user:       session?.user ?? null,
      loading,
      signOut,
      signingOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useAuth — access the current auth state from any component.
 *
 * Usage:
 *   const { user, signOut, loading } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
