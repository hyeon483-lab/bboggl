const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const BUCKET = 'Corporate analysis data (upload)';

export type CardType = 'company_decoder' | 'price_decoder' | 'story_reader';

/** 카드 업로드 파일명은 티커에서 특수문자를 뺀 형태를 쓴다 (예: BRK-B → BRKB 파일). */
function cardFileName(ticker: string, type: CardType) {
  return `${ticker.replace(/[^A-Za-z0-9]/g, '')}_${type}_card.html`;
}

function cardUrl(ticker: string, type: CardType) {
  return `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(BUCKET)}/${encodeURIComponent(
    cardFileName(ticker, type),
  )}`;
}

/**
 * 분석 카드는 스킬이 매번 새로 생성해 업로드하는 독립된 HTML(자체 <style> 포함, 880~980px 안팎의
 * 데스크톱 폭 기준 디자인)이라 우리가 소스를 직접 고칠 수 없고, 티커마다 마크업/클래스명도 제각각이다
 * (company_decoder/price_decoder/story_reader 세 스킬이 매번 새로 생성하므로 공유되는 클래스 계약이
 * 없다). 그래서 특정 클래스명을 겨냥한 CSS만으로는 다음 티커에서 또 깨질 수 있다.
 *
 * 시행착오로 확인한 것:
 * - 카드 대부분은 스킬이 자체적으로 넣어둔 반응형 규칙(예: flex-wrap + min-width, 640px 그리드
 *   브레이크포인트)만으로 이미 잘 접힌다. 예전에 넣었던 `* { min-width: 0 !important }`는 이 내장
 *   flex-wrap 로직을 깨서(각 flex 아이템이 줄바꿈 대신 끝없이 쪼그라들어 글자 단위로 줄바꿈되는
 *   증상, 예: META의 "돈 버는 구조" 흐름도) 오히려 있던 반응형을 망가뜨렸다 — 삭제했다.
 * - 실제로 카드 자체에 대응이 없는 경우는 다열(多列) <table>이다. 연도별 재무 테이블처럼 6~7개
 *   열이 있으면 폰트를 아무리 줄여도 262px 안에 안 들어가고, 스크롤 컨테이너가 없어 화면 밖으로
 *   잘려 보인다(META에서 확인). 그래서 모든 table을 가로 스크롤 가능한 wrapper로 감싸는 스크립트를
 *   주입한다 — 넘치지 않는 테이블은 아무 영향이 없고, 넘치는 테이블만 (잘리는 대신) 스와이프로 볼
 *   수 있게 된다.
 */
function withMobileOverrides(html: string): string {
  const mobileStyle = `<style>
@media (max-width: 600px) {
  html, body { overflow-x: hidden !important; }
  body { padding-left: 6px !important; padding-right: 6px !important; }
  .card, .conclusion { max-width: 100% !important; box-sizing: border-box !important; }
  .card { padding: 18px 8px 26px !important; }
  /* 카드마다 마크업이 제각각이라, section 태그 자체에 좌우 padding을 박아둔 경우가 있다
     (예: O 카드의 section{padding:24px 32px}) — 카드 바깥 padding과 이중으로 겹치므로
     태그 단위로 좌우만 안전하게 0으로 만든다. 상하 padding/margin은 건드리지 않는다. */
  section { padding-left: 0 !important; padding-right: 0 !important; }
  .hero p, .conclusion p { font-size: 17px !important; line-height: 1.5 !important; }
  .conclusion { padding: 12px !important; }
  h1 { font-size: 19px !important; }
  h2 { font-size: 16px !important; }
  .grid2, .grid3, .diffgrid { grid-template-columns: 1fr !important; gap: 10px !important; }
  /* .chart 막대는 자식 .bar가 인라인 height:XX%로 그려지므로 부모 높이를 auto로 바꾸면 안 된다 —
     너비만 줄이고(줄바꿈 없이 좁게 압축) 높이는 고정값을 유지한다. */
  .chart { height: 130px !important; padding: 0 !important; gap: 8px !important; }
  .bar-row { flex-wrap: wrap !important; }
  .bar-label { width: 76px !important; font-size: 10.5px !important; }
  .bar-val { width: 46px !important; font-size: 10.5px !important; }
  img, svg { max-width: 100% !important; height: auto !important; }
  table { font-size: 10.5px !important; }
  th, td { padding: 4px 4px !important; }
  .__mscroll {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
    margin: 10px -2px !important;
    padding: 0 2px 6px !important;
  }
  .__mscroll table { margin: 0 !important; }
  .__mscroll::-webkit-scrollbar { height: 5px; }
  .__mscroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.25); border-radius: 3px; }
  .__mhint {
    display: block;
    font-size: 10.5px;
    color: var(--ink2, #898781);
    text-align: right;
    margin-top: -6px;
    margin-bottom: 8px;
  }
}
</style>
<script>
(function () {
  function fit() {
    if (document.documentElement.clientWidth > 600) return;
    document.querySelectorAll('table').forEach(function (t) {
      if (t.closest('.__mscroll')) return;
      var box = document.createElement('div');
      box.className = '__mscroll';
      t.parentNode.insertBefore(box, t);
      box.appendChild(t);
      if (t.scrollWidth > box.clientWidth + 2) {
        var hint = document.createElement('small');
        hint.className = '__mhint';
        hint.textContent = '↔ 좌우로 스크롤해서 더 볼 수 있어요';
        box.parentNode.insertBefore(hint, box.nextSibling);
      }
    });
  }
  if (document.readyState === 'complete') fit();
  else window.addEventListener('load', fit);
})();
</script>`;

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
