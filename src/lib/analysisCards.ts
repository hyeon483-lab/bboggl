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
 * 카드는 자체 <style>에 `:root { --ink: ...; }` 식으로 색상 변수를 선언한다 — 일반 문서에 넣을 걸
 * 전제로 만들어진 관행이다. 그런데 이 스타일시트가 Shadow Root 안에 들어가면 `:root`는 그 안의
 * 어떤 요소와도 매칭되지 않는다(진짜 document.documentElement와도, 섀도 트리 안 요소와도 매칭 안
 * 됨) — 스펙상 `:root`는 섀도 트리 스코프에서 그냥 죽은 선택자다. 그 결과 `var(--ink)`가 전부
 * 빈 값으로 풀려서, 예를 들어 `background: var(--ink)` + `color:#fff`인 hero 섹션이 배경은
 * 투명, 글자는 흰색이 되어 흰 바탕 위에서 통째로 안 보이게 된다(VST company_decoder 카드에서
 * 실측). 섀도 트리 전체에 변수를 뿌리는 스펙상 올바른 선택자는 `:host`이므로, 카드 HTML을 쓰기
 * 전에 `:root`를 `:host`로 치환한다.
 */
function fixShadowRootVars(html: string): string {
  return html.replace(/:root(?![\w-])/g, ':host');
}

/** 해당 티커의 분석 카드 HTML을 가져온다. 아직 업로드되지 않았으면 null. */
export async function fetchAnalysisCard(ticker: string, type: CardType): Promise<string | null> {
  try {
    const res = await fetch(cardUrl(ticker, type));
    if (!res.ok) return null;
    return fixShadowRootVars(await res.text());
  } catch {
    return null;
  }
}

/**
 * 분석 카드는 스킬이 매번 새로 생성해 업로드하는 독립된 HTML(자체 <style> 포함, 880~980px 안팎의
 * 데스크톱 폭 기준 디자인)이라 우리가 소스를 직접 고칠 수 없고, 티커마다 마크업/클래스명도 제각각이다
 * (company_decoder/price_decoder/story_reader 세 스킬이 매번 새로 생성하므로 공유되는 클래스 계약이
 * 없다). 그래서 특정 클래스명을 겨냥한 CSS만으로는 다음 티커에서 또 깨질 수 있다.
 *
 * 예전엔 이 카드를 <iframe srcDoc>으로 격리해서 그렸다 — 데스크톱 CSS와 충돌 없이 안전했지만,
 * 구글 애드센스 심사에서 "가치가 낮은 콘텐츠"로 반려된 원인 중 하나였다: srcdoc iframe 안의
 * 텍스트는 검색엔진이 부모 페이지 본문으로 강하게 귀속시키지 않는다(안정적인 URL이 없으니까).
 * 이제는 Shadow DOM(open)으로 바꿨다 — 같은 스타일 격리 효과를 내면서도, 구글이 공식적으로
 * "open shadow DOM은 렌더링된 페이지의 일부로 인덱싱한다"고 밝힌 방식이라 본문으로 인정받는다.
 * Shadow DOM은 innerHTML로 넣으면 <script>가 실행되지 않으므로, 모바일 대응 로직은 CSS는
 * 그대로 주입하고 JS 부분만 아래 normalizeCard()로 옮겨 마운트 후 직접 호출한다.
 *
 * 시행착오로 확인한 것:
 * - 카드 대부분은 스킬이 자체적으로 넣어둔 반응형 규칙(예: flex-wrap + min-width, 640px 그리드
 *   브레이크포인트)만으로 이미 잘 접힌다. 예전에 넣었던 `* { min-width: 0 !important }`는 이 내장
 *   flex-wrap 로직을 깨서(각 flex 아이템이 줄바꿈 대신 끝없이 쪼그라들어 글자 단위로 줄바꿈되는
 *   증상, 예: META의 "돈 버는 구조" 흐름도) 오히려 있던 반응형을 망가뜨렸다 — 삭제했다.
 * - 실제로 카드 자체에 대응이 없는 경우는 다열(多列) <table>이다. 연도별 재무 테이블처럼 6~7개
 *   열이 있으면 폰트를 아무리 줄여도 262px 안에 안 들어가고, 스크롤 컨테이너가 없어 화면 밖으로
 *   잘려 보인다(META에서 확인). 그래서 모든 table을 가로 스크롤 가능한 wrapper로 감싼다 —
 *   넘치지 않는 테이블은 아무 영향이 없고, 넘치는 테이블만 (잘리는 대신) 스와이프로 볼 수 있게 된다.
 * - 30개 종목 × 3종 카드를 전부 자동 렌더링해서 실측했더니(사람이 눈으로 하나씩 넘겨보지 않고),
 *   초기에 생성된 카드 일부(KO, AVGO)는 바깥 래퍼 클래스명이 `.card`가 아니라 `.sheet`였다 —
 *   그 카드들만 데스크톱 padding(44px씩)이 그대로 남아 본문이 카드 폭의 76%로 눌려 있었다.
 *   클래스명은 스킬이 실행마다 새로 짓기 때문에 다음 카드는 또 다른 이름을 쓸 수 있다. 그래서
 *   이름을 더 나열하는 대신, "루트의 첫 번째 자식 = 그 카드의 바깥 래퍼"라는 구조적 사실 하나에
 *   기대는 로직으로 클래스명과 무관하게 항상 잡히게 했다.
 * - `.chart`라는 이름도 카드마다 완전히 다른 두 컴포넌트를 가리킨다: (A) 세로 막대 그래프 —
 *   자식 `.bar`가 인라인 `style="height:XX%"`로 그려지므로 부모에 고정 높이가 반드시 있어야
 *   퍼센트가 풀린다. (B) 가로 막대 목록(`.bar-row`를 세로로 쌓은 것) — 원래 CSS에 고정 높이가
 *   없고 행 개수만큼 자연스럽게 늘어나야 한다. `.chart { height: 130px }`를 무조건 걸면 (B)
 *   유형에서 4번째 행부터 카드 박스 밖으로 넘쳐 아래 문단과 텍스트가 겹쳐 보였다(UNH 역DCF 카드에서
 *   확인). 그래서 %-height 자식이 실제로 있는 (A) 유형일 때만 고정 높이를 준다.
 * - 배지·라벨 같은 짧은 텍스트에 white-space:nowrap을 걸어둔 카드가 있다(예: AXP 상단 출처 배지).
 *   좁은 화면에서 스크롤 없이 그냥 화면 밖으로 잘려서 안 보이게 된다. 실제로 뷰포트보다 넓어지는
 *   경우에만(숫자처럼 원래 짧은 nowrap은 그대로 두고) 줄바꿈을 허용한다.
 */
export const CARD_MOBILE_STYLE = `
:host { display: block; }
@media (max-width: 600px) {
  :host { overflow-x: hidden; padding-left: 6px; padding-right: 6px; box-sizing: border-box; }
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
`;

function normalizeRoot(root: ParentNode) {
  if (document.documentElement.clientWidth > 600) return;
  let el = root.firstElementChild;
  while (el && (el.tagName === 'SCRIPT' || el.tagName === 'STYLE')) {
    el = el.nextElementSibling;
  }
  if (!el || !(el instanceof HTMLElement)) return;
  const cs = window.getComputedStyle(el);
  const pl = parseFloat(cs.paddingLeft) || 0;
  const pr = parseFloat(cs.paddingRight) || 0;
  if (pl > 12 || pr > 12) {
    el.style.setProperty('padding-left', '8px', 'important');
    el.style.setProperty('padding-right', '8px', 'important');
  }
  el.style.setProperty('max-width', '100%', 'important');
  el.style.setProperty('box-sizing', 'border-box', 'important');
}

function normalizeCharts(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('.chart').forEach((chart) => {
    let hasPercentHeightChild = false;
    chart.querySelectorAll<HTMLElement>('[style*="height"]').forEach((el) => {
      if (/height\s*:\s*[\d.]+%/.test(el.getAttribute('style') || '')) hasPercentHeightChild = true;
    });
    if (hasPercentHeightChild) {
      chart.style.setProperty('height', '130px', 'important');
      chart.style.setProperty('padding', '0', 'important');
      chart.style.setProperty('gap', '8px', 'important');
    }
  });
}

function normalizeNowrap(root: ParentNode) {
  const vw = document.documentElement.clientWidth;
  root.querySelectorAll<HTMLElement>('*').forEach((el) => {
    if (window.getComputedStyle(el).whiteSpace === 'nowrap' && el.scrollWidth > vw) {
      el.style.setProperty('white-space', 'normal', 'important');
    }
  });
}

function wrapWideTables(root: ParentNode) {
  root.querySelectorAll<HTMLTableElement>('table').forEach((t) => {
    if (t.closest('.__mscroll')) return;
    const box = document.createElement('div');
    box.className = '__mscroll';
    t.parentNode?.insertBefore(box, t);
    box.appendChild(t);
    if (t.scrollWidth > box.clientWidth + 2) {
      const hint = document.createElement('small');
      hint.className = '__mhint';
      hint.textContent = '↔ 좌우로 스크롤해서 더 볼 수 있어요';
      box.parentNode?.insertBefore(hint, box.nextSibling);
    }
  });
}

/** Shadow DOM에 카드 HTML을 넣은 직후 호출한다 — 예전엔 iframe 안에서 <script>로 자동 실행되던 로직. */
export function normalizeCard(root: ParentNode) {
  normalizeRoot(root);
  if (document.documentElement.clientWidth > 600) return;
  normalizeCharts(root);
  normalizeNowrap(root);
  wrapWideTables(root);
}
