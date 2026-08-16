import { supabase } from './supabaseClient';

/** 같은 기업을 연속으로 볼 때는 기록하지 않고, 다른 기업으로 넘어갈 때만 기록한다. */
export async function logView(userId: string, ticker: string, companyName: string) {
  const { data: last, error: readError } = await supabase
    .from('activity_log')
    .select('ticker')
    .eq('user_id', userId)
    .eq('type', 'view')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (readError) {
    console.error('[Supabase] 최근 조회 기록 확인 실패:', readError.message);
    return;
  }

  if (last?.ticker === ticker) return;

  const { error: insertError } = await supabase
    .from('activity_log')
    .insert({ user_id: userId, type: 'view', ticker, company_name: companyName });

  if (insertError) {
    console.error('[Supabase] 조회 기록 저장 실패:', insertError.message);
  }
}

export async function logFavoriteAdded(userId: string, ticker: string, companyName: string) {
  const { error } = await supabase
    .from('activity_log')
    .insert({ user_id: userId, type: 'favorite', ticker, company_name: companyName });

  if (error) {
    console.error('[Supabase] 즐겨찾기 기록 저장 실패:', error.message);
  }
}
