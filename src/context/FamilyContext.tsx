import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getUserFamily, getFamilyChildren } from '../services/familyService';
import { Child } from '../lib/database.types';

type FamilyContextValue = {
  familyId: string | null;
  familyName: string | null;
  kids: Child[];
  children: Child[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const FamilyContext = createContext<FamilyContextValue>({
  familyId: null,
  familyName: null,
  kids: [],
  children: [],
  loading: true,
  refresh: async () => {},
});

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyName, setFamilyName] = useState<string | null>(null);
  const [kids, setKids] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFamily = useCallback(async () => {
    if (!user) {
      setFamilyId(null);
      setFamilyName(null);
      setKids([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await getUserFamily(user.id);
      if (!result) {
        setFamilyId(null);
        setFamilyName(null);
        setKids([]);
        return;
      }

      setFamilyId(result.familyId);
      setFamilyName(result.familyName);
      setKids(await getFamilyChildren(result.familyId));
    } catch (e) {
      console.error('[ForThem] FamilyContext loadFamily error:', e);
      setFamilyId(null);
      setFamilyName(null);
      setKids([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadFamily(); }, [loadFamily]);

  return (
    <FamilyContext.Provider value={{ familyId, familyName, kids, children: kids, loading, refresh: loadFamily }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily(): FamilyContextValue {
  return useContext(FamilyContext);
}
