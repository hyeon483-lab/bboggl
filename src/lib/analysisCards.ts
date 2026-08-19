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

/**
 * 분석 카드는 스킬이 매번 새로 생성해 업로드하는 독립된 HTML(자체 <style> 포함, 980px 안팎의
 * 데스크톱 폭 기준 디자인)이라 우리가 소스를 직접 고칠 수 없다. 좁은 화면(iframe 자체 폭 기준)에서
 * 큰 헤드라인 문장이 몇 단어만에 줄바꿈되고, 2~3단 그리드나 막대그래프 라벨이 카드 폭을 넘어가
 * 잘려 보이는 문제가 있어 — 카드 공통 디자인 시스템(company-decoder/story-reader/price-decoder
 * 스킬이 공유하는 클래스명)을 겨냥한 모바일 오버라이드 스타일을 카드 HTML에 주입해 넣는다.
 */
function withMobileOverrides(html: string): string {
  const mobileStyle = `<style>
@media (max-width: 600px) {
  * { min-width: 0 !important; }
  html, body { overflow-x: hidden !important; }
  .card, .conclusion { max-width: 100% !important; box-sizing: border-box !important; }
  .card { padding: 18px 16px 26px !important; overflow-x: auto !important; }
  .hero p, .conclusion p { font-size: 17px !important; line-height: 1.5 !important; }
  .conclusion { padding: 16px !important; }
  h1 { font-size: 19px !important; }
  h2 { font-size: 16px !important; }
  .grid2, .grid3, .diffgrid { grid-template-columns: 1fr !important; gap: 10px !important; }
  /* .chart 막대는 자식 .bar가 인라인 height:XX%로 그려지므로 부모 높이를 auto로 바꾸면 안 된다 —
     너비만 줄이고(줄바꿈 없이 좁게 압축) 높이는 고정값을 유지한다. */
  .chart { height: 130px !important; padding: 0 !important; gap: 8px !important; }
  .bar-row { flex-wrap: wrap !important; }
  .bar-label { width: 76px !important; font-size: 10.5px !important; }
  .bar-val { width: 46px !important; font-size: 10.5px !important; }
  table { font-size: 10.5px !important; }
  th, td { padding: 4px 4px !important; }
}
</style>`;

  return html.includes('</head>') ? html.replace('</head>', `${mobileStyle}</head>`) : mobileStyle + html;
}

/** 해당 티커의 분석 카드 HTML을 가져온다. 아직 업로드되지 않았으면 null. */
export async function fetchAnalysisCard(ticker: string, type: CardType): Promise<string | null> {
  try {
    const res = await fetch(cardUrl(ticker, type));
    if (!res.ok) return null;
    return withMobileOverrides(await res.text());
  } catch {
    return null;
  }
}
