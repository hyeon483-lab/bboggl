/**
 * vite build 이후 실행되는 빌드 스크립트.
 *
 * 이 프로젝트는 SPA(CSR)라서 dist/index.html 하나로 모든 라우트를 처리한다.
 * 그래서 /companies/AAPL 같은 상세 페이지도 실제로는 항상 같은 <title>/<meta description>을
 * 내려받은 뒤 JS가 실행되고 나서야 값이 바뀐다 — 카카오톡·트위터 링크 미리보기처럼
 * JS를 실행하지 않는 크롤러는 이 값을 절대 보지 못한다.
 *
 * 여기서는 실제 React 컴포넌트를 서버 렌더링하지 않지만(정식 SSR 없음), dist/index.html을
 * 라우트 개수만큼 복제해 <title>/description/OG 태그를 미리 박아 넣고, 추가로
 * Supabase Storage에 업로드된 실제 분석 카드(company_decoder/story_reader/price_decoder)
 * 텍스트를 빌드 시점에 가져와 <div id="root"> 안에 실제 텍스트로 함께 넣어준다.
 * (JS를 실행하지 않는 크롤러/뷰소스 확인에서도 종목 분석 본문이 그대로 보이도록 하기 위함.)
 *
 * 클라이언트는 hydrateRoot가 아니라 createRoot를 쓰기 때문에(src/main.tsx), 접속 즉시
 * 이 미리 넣어둔 텍스트를 지우고 React가 다시 그린다 — 실제 화면/동작은 기존과 동일하다.
 *
 * 정적 호스팅(Netlify/Vercel 등)이 "디렉터리 인덱스" 방식으로 /companies/AAPL 요청을
 * dist/companies/AAPL/index.html에 매핑해준다는 전제가 필요하다.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const templatePath = join(distDir, 'index.html');

if (!existsSync(templatePath)) {
  console.error('[generate-meta-shells] dist/index.html이 없어요. 먼저 vite build를 실행해주세요.');
  process.exit(1);
}

// .env.local 값을 process.env에 채워준다. Vercel 빌드에서는 이미 환경변수가 설정되어
// 있으므로 이 함수는 아무것도 하지 않는다 (기존 값을 덮어쓰지 않음).
function loadDotEnvLocal() {
  const envPath = join(__dirname, '..', '.env.local');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}
loadDotEnvLocal();

const template = readFileSync(templatePath, 'utf-8');
const SITE = 'Bboggl';
const SITE_URL = 'https://10kanalysiswise.vercel.app';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const BUCKET = 'Corporate analysis data (upload)';

const CARD_TYPES = [
  { type: 'company_decoder', label: '핵심 요약' },
  { type: 'story_reader', label: '스토리' },
  { type: 'price_decoder', label: '역DCF 가격 판독' },
];

// 더미 기업 데이터. src/data/mockCompanies.ts와 동일하게 유지해주세요.
// (이 스크립트는 순수 Node 스크립트라 TS 소스를 직접 import하지 않습니다.)
const COMPANIES = [
  { ticker: 'AAPL', nameKo: '애플', summary: '아이폰을 중심으로 한 하드웨어와 서비스 생태계를 결합한 소비자 테크 기업' },
  { ticker: 'TSLA', nameKo: '테슬라', summary: '전기차와 에너지 저장, 자율주행 소프트웨어를 함께 개발하는 모빌리티 기업' },
  { ticker: 'MSFT', nameKo: '마이크로소프트', summary: '클라우드(Azure)와 생산성 소프트웨어, AI 서비스를 축으로 하는 엔터프라이즈 테크 기업' },
  { ticker: 'NVDA', nameKo: '엔비디아', summary: 'AI 학습·추론용 GPU와 데이터센터 플랫폼을 주력으로 하는 반도체 설계 기업' },
  { ticker: 'AMZN', nameKo: '아마존', summary: '이커머스와 클라우드(AWS), 광고를 함께 운영하는 멀티 사업 플랫폼 기업' },
  { ticker: 'VST', nameKo: '비스트라 에너지', summary: '발전·소매 전력 판매를 아우르는 미국 최대 규모의 통합 전력 회사' },
  { ticker: 'PLTR', nameKo: '팔란티어', summary: '정부·기업 고객에게 AI 기반 데이터 분석 플랫폼을 공급하는 소프트웨어 기업' },
  { ticker: 'UNH', nameKo: '유나이티드헬스케어', summary: '건강보험(UnitedHealthcare)과 헬스케어 서비스(Optum)를 함께 운영하는 미국 최대 건강보험사' },
  { ticker: 'SNPS', nameKo: '시놉시스', summary: '반도체 설계에 필수적인 EDA(전자설계자동화) 소프트웨어를 만드는 칩 설계 도구 기업' },
  { ticker: 'RSG', nameKo: '리퍼블릭 서비스', summary: '쓰레기 수거·매립·재활용을 담당하는 미국 2위 규모의 폐기물 처리 기업' },
  { ticker: 'KO', nameKo: '코카콜라', summary: '전 세계 200여개 국가에서 탄산음료를 중심으로 한 음료 브랜드를 판매하는 소비재 기업' },
  { ticker: 'GOOGL', nameKo: '알파벳(구글)', summary: '검색·유튜브 광고를 핵심 수익원으로 클라우드와 AI 사업을 함께 키우는 인터넷 플랫폼 기업' },
  { ticker: 'AVGO', nameKo: '브로드컴', summary: '반도체와 인프라 소프트웨어(VMware)를 함께 판매하는 반도체·소프트웨어 복합 기업' },
  { ticker: 'META', nameKo: '메타', summary: '페이스북·인스타그램 광고를 핵심 수익원으로 AI와 메타버스에 대규모로 투자하는 소셜미디어 기업' },
  { ticker: 'JPM', nameKo: 'JP모건체이스', summary: '예금·대출 이자수익과 투자은행·자산관리 수수료를 함께 운영하는 미국 최대 상업은행' },
  { ticker: 'CVX', nameKo: '쉐브론', summary: '원유·천연가스 채굴부터 정제·판매까지 아우르는 미국의 오일가스 슈퍼메이저' },
  { ticker: 'PEP', nameKo: '펩시코', summary: '감자칩·과자와 탄산음료 브랜드를 전 세계 소매망에 공급하는 글로벌 식음료 기업' },
  { ticker: 'MCD', nameKo: '맥도날드', summary: '전 세계 매장 부지와 브랜드를 가맹점에 빌려주고 임대료·로열티를 받는 글로벌 패스트푸드 프랜차이즈 기업' },
  { ticker: 'DE', nameKo: '존디어', summary: '트랙터·건설장비를 만들어 팔고 금융·부품수리로 반복 매출을 내는 세계적 농기계 제조사' },
  { ticker: 'O', nameKo: '리얼티인컴', summary: '편의점·마트 등 상업용 건물을 장기 임대하고 매달 배당을 지급하는 순임대 리츠' },
  { ticker: 'CRWD', nameKo: '크라우드스트라이크', summary: '회사 컴퓨터·서버에 가벼운 감시 프로그램을 심어 해킹을 실시간으로 탐지·차단해주고 매달 구독료를 받는 클라우드 보안 기업' },
  { ticker: 'AXP', nameKo: '아메리칸 익스프레스', summary: '돈 많이 쓰는 우량 고객에게 카드를 직접 발급하고 가맹점과도 직접 계약해 결제 수수료·카드론 이자·연회비를 함께 받는 프리미엄 카드사' },
  { ticker: 'PANW', nameKo: '팔로알토 네트웍스', summary: '기업과 정부기관의 네트워크를 해커로부터 지켜주는 보안 소프트웨어를 만들어 매달 구독료를 받는 사이버보안 기업' },
  { ticker: 'GS', nameKo: '골드만삭스', summary: '큰 기업과 정부, 자산가의 자금 조달·투자를 도와주고 수수료·트레이딩 마진·운용보수를 받는 대형 투자은행' },
  { ticker: 'PLD', nameKo: '프롤로지스', summary: '아마존 같은 기업들이 물건을 보관할 대형 물류창고를 지어 매달 임대료를 받는 산업용 부동산 리츠' },
];

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function cardUrl(ticker, type) {
  const fileName = `${ticker}_${type}_card.html`;
  return `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(BUCKET)}/${encodeURIComponent(fileName)}`;
}

async function fetchCardText(ticker, type) {
  if (!SUPABASE_URL) return null;
  try {
    const res = await fetch(cardUrl(ticker, type));
    if (!res.ok) return null;
    const text = stripHtml(await res.text());
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

/** 기업 상세 페이지용 — 실제 분석 카드 3종의 텍스트를 가져와 크롤러가 읽을 수 있는 본문을 만든다. */
async function buildCompanyArticle(c) {
  const texts = await Promise.all(CARD_TYPES.map((ct) => fetchCardText(c.ticker, ct.type)));
  const sections = CARD_TYPES.map((ct, i) => {
    const text = texts[i];
    if (!text) return '';
    return `<section><h2>${escapeHtml(ct.label)}</h2><p>${escapeHtml(text)}</p></section>`;
  })
    .filter(Boolean)
    .join('\n');

  return `<article><h1>${escapeHtml(c.nameKo)} (${escapeHtml(c.ticker)})</h1><p>${escapeHtml(c.summary)}</p>${sections}</article>`;
}

/** 홈/목록 페이지용 — 전체 기업을 간단한 리스트 형태의 실제 텍스트로 나열한다. */
function buildIndexArticle() {
  const items = COMPANIES.map(
    (c) => `<li><strong>${escapeHtml(c.nameKo)} (${escapeHtml(c.ticker)})</strong> — ${escapeHtml(c.summary)}</li>`,
  ).join('\n');
  return `<article><h1>Bboggl — 미국 상장기업 10-K 기반 분석</h1><ul>${items}</ul></article>`;
}

function injectMeta(html, { title, description }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${safeDescription}" />`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${safeTitle}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${safeDescription}" />`,
    );
}

function injectContent(html, articleHtml) {
  return html.replace('<div id="root"></div>', `<div id="root">${articleHtml}</div>`);
}

const routes = [
  {
    path: 'companies',
    title: `기업 분석 목록 | ${SITE}`,
    description: '미국 상장기업을 섹터·시가총액·등락률로 검색하고 비교해보세요.',
    article: buildIndexArticle(),
  },
  {
    path: 'about',
    title: `소개 | ${SITE}`,
    description: 'Bboggl이 어떤 사이트인지, 데이터를 어떻게 만드는지 소개합니다.',
  },
  {
    path: 'privacy',
    title: `개인정보처리방침 | ${SITE}`,
    description: 'Bboggl이 수집하는 개인정보와 이용 목적을 안내합니다.',
  },
  ...(await Promise.all(
    COMPANIES.map(async (c) => ({
      path: `companies/${c.ticker}`,
      title: `${c.nameKo}(${c.ticker}) 분석 | ${SITE}`,
      description: `${c.nameKo}(${c.ticker}) — ${c.summary}`,
      article: await buildCompanyArticle(c),
    })),
  )),
];

for (const route of routes) {
  let html = injectMeta(template, route);
  if (route.article) html = injectContent(html, route.article);
  const outDir = join(distDir, route.path);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html, 'utf-8');
}

console.log(`[generate-meta-shells] ${routes.length}개 라우트에 정적 메타 shell을 생성했어요.`);

// 홈(/)은 별도 라우트 shell이 아니라 dist/index.html 그 자체이므로 여기서 직접 본문을 넣어준다.
const homeHtml = injectContent(template, buildIndexArticle());
writeFileSync(templatePath, homeHtml, 'utf-8');
console.log('[generate-meta-shells] 홈(dist/index.html)에도 실제 기업 리스트 본문을 넣었어요.');

// sitemap.xml — 검색엔진이 필요한 라우트를 알아서 찾도록 안내한다.
// 마이페이지는 로그인 필요 + noindex라 제외한다.
const sitemapUrls = [
  { path: '', changefreq: 'daily', priority: '1.0' },
  { path: 'companies', changefreq: 'daily', priority: '0.9' },
  ...COMPANIES.map((c) => ({ path: `companies/${c.ticker}`, changefreq: 'weekly', priority: '0.8' })),
  { path: 'about', changefreq: 'monthly', priority: '0.3' },
  { path: 'privacy', changefreq: 'monthly', priority: '0.2' },
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (u) =>
      `  <url><loc>${SITE_URL}/${u.path}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
  )
  .join('\n')}
</urlset>
`;

writeFileSync(join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
console.log(`[generate-meta-shells] sitemap.xml 생성 완료 (${sitemapUrls.length}개 URL).`);
