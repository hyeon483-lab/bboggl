import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import type { ActivityLogRow } from '../types/activity';

export function useRecentActivity(limit = 10) {
  const { user } = useAuth();
  const [items, setItems] = useState<ActivityLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('[Supabase] 활동 내역 조회 실패:', error.message);
        }
        setItems((data as ActivityLogRow[] | null) ?? []);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, limit]);

  return { items, loading };
}
