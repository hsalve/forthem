// ─────────────────────────────────────────────────────────────────────────────
// ForThem — Family Context
// Provides family + children state to the whole app.
// RootNavigator reads familyId to decide whether to show SetupStack or MainTabs.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useAuth }                  from './AuthContext';
import { getUserFamily, getFamilyChildren } from '../services/familyService';
import { Child }                    from '../lib/database.types';

// ── Types ─────────────────────────────────────────────────────────────────────

type FamilyContextValue = {
  familyId:    string | null;
  familyName:  string | null;
  /** All children in the family, ordered by creation date */
  kids:        Child[];
  /** True while querying Supabase on mount or after refresh() */
  loading:     boolean;
  /** Call after creating/joining a family or adding a child to re-sync state */
  refresh:     () => Promise<void>;
};

// ── Context ───────────────────────────────────────────────────────────────────

const FamilyContext = createContext<FamilyContextValue>({
  familyId:   null,
  familyName: null,
  kids:       [],
  loading:    true,
  refresh:    async () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [familyId,   setFamilyId]   = useState<string | null>(null);
  const [familyName, setFamilyName] = useState<string | null>(null);
  const [kids,       setKids]       = useState<Child[]>([]);
  const [loading,    setLoading]    = useState(true);

  const loadFamily = useCallback(async () => {
    if (!user) {
      // Signed out — clear everything
      setFamilyId(null);
      setFamilyName(null);
      setKids([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await getUserFamily(user.id);

      if (result) {
        setFamilyId(result.familyId);
        setFamilyName(result.familyName);

        const children = await getFamilyChildren(result.familyId);
        setKids(children);
      } else {
        setFamilyId(null);
        setFamilyName(null);
        setKids([]);
      }
    } catch (e) {
      console.error('[ForThem] FamilyContext loadFamily error:', e);
      setFamilyId(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);   // re-run only when the user changes

  // Load on mount and whenever the signed-in user changes
  useEffect(() => { loadFamily(); }, [loadFamily]);

  return (
    <FamilyContext.Provider value={{
      familyId, familyName, kids, loading, refresh: loadFamily,
    }}>
      {children}
    </FamilyContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useFamily(): FamilyContextValue {
  return useContext(FamilyContext);
}
