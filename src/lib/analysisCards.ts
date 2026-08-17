const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET = 'Corporate analysis data (upload)';

export type CardType = 'company_decoder' | 'price_decoder' | 'story_reader';

function cardFileName(ticker: string, type: CardType) {
  return `${ticker}_${type}_card.html`;
}

function cardUrl(ticker: string, type: CardType) {
  return `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(BUCKET)}/${encodeURIComponent(
    cardFileName(ticker, type),
  )}`;
}

/** 해당 티커의 분석 카드 HTML을 가져온다. 아직 업로드되지 않았으면 null. */
export async function fetchAnalysisCard(ticker: string, type: CardType): Promise<string | null> {
  try {
    const res = await fetch(cardUrl(ticker, type));
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}
