import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { logFavoriteAdded } from '../lib/activityLog';
import type { Profile } from '../types/profile';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; hasSession: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<Profile, 'name' | 'favorite_tickers'>>) => Promise<{ error: string | null }>;
  toggleFavorite: (ticker: string, companyName: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) {
    console.error('[Supabase] 프로필 조회 실패:', error.message);
    return null;
  }
  return data as Profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        setProfile(await fetchProfile(data.session.user.id));
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setProfile(await fetchProfile(newSession.user.id));
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp: AuthContextValue['signUp'] = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { error: error?.message ?? null, hasSession: Boolean(data.session) };
  };

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile: AuthContextValue['updateProfile'] = async (patch) => {
    if (!session?.user) return { error: '로그인이 필요해요.' };
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', session.user.id)
      .select()
      .single();
    if (error) return { error: error.message };
    setProfile(data as Profile);
    return { error: null };
  };

  const toggleFavorite: AuthContextValue['toggleFavorite'] = async (ticker, companyName) => {
    if (!session?.user || !profile) return { error: '로그인이 필요해요.' };
    const isAdding = !profile.favorite_tickers.includes(ticker);
    const next = isAdding
      ? [...profile.favorite_tickers, ticker]
      : profile.favorite_tickers.filter((t) => t !== ticker);

    const result = await updateProfile({ favorite_tickers: next });
    if (!result.error && isAdding) {
      logFavoriteAdded(session.user.id, ticker, companyName);
    }
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        toggleFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있어요.');
  return ctx;
}
