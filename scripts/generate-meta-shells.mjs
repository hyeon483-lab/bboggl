/**
 * vite build 이후 실행되는 빌드 스크립트.
 *
 * 이 프로젝트는 SPA(CSR)라서 dist/index.html 하나로 모든 라우트를 처리한다.
 * 그래서 /companies/AAPL 같은 상세 페이지도 실제로는 항상 같은 <title>/<meta description>을
 * 내려받은 뒤 JS가 실행되고 나서야 값이 바뀐다 — 카카오톡·트위터 링크 미리보기처럼
 * JS를 실행하지 않는 크롤러는 이 값을 절대 보지 못한다.
 *
 * 여기서는 실제 React 컴포넌트를 서버 렌더링하지 않고(SSR 없음), dist/index.html을
 * 라우트 개수만큼 복제해 <title>/description/OG 태그만 미리 박아 넣은 정적 shell을
 * dist/{route}/index.html 형태로 만든다. <div id="root">와 스크립트 태그는 그대로 두므로
 * 실제 화면은 지금과 동일하게 클라이언트 JS가 그린다.
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

const template = readFileSync(templatePath, 'utf-8');
const SITE = 'Bboggl';
const SITE_URL = 'https://10kanalysiswise.com';

// 더미 기업 데이터. src/data/mockCompanies.ts와 동일하게 유지해주세요.
// (이 스크립트는 순수 Node 스크립트라 TS 소스를 직접 import하지 않습니다.)
const COMPANIES = [
  { ticker: 'AAPL', nameKo: '애플', summary: '아이폰을 중심으로 한 하드웨어와 서비스 생태계를 결합한 소비자 테크 기업' },
  { ticker: 'TSLA', nameKo: '테슬라', summary: '전기차와 에너지 저장, 자율주행 소프트웨어를 함께 개발하는 모빌리티 기업' },
  { ticker: 'MSFT', nameKo: '마이크로소프트', summary: '클라우드(Azure)와 생산성 소프트웨어, AI 서비스를 축으로 하는 엔터프라이즈 테크 기업' },
  { ticker: 'NVDA', nameKo: '엔비디아', summary: 'AI 학습·추론용 GPU와 데이터센터 플랫폼을 주력으로 하는 반도체 설계 기업' },
  { ticker: 'AMZN', nameKo: '아마존', summary: '이커머스와 클라우드(AWS), 광고를 함께 운영하는 멀티 사업 플랫폼 기업' },
  { ticker: 'VST', nameKo: '비스트라 에너지', summary: '발전·소매 전력 판매를 아우르는 미국 최대 규모의 통합 전력 회사' },
];

const routes = [
  {
    path: 'companies',
    title: `기업 분석 목록 | ${SITE}`,
    description: '미국 상장기업을 섹터·시가총액·등락률로 검색하고 비교해보세요.',
  },
  ...COMPANIES.map((c) => ({
    path: `companies/${c.ticker}`,
    title: `${c.nameKo}(${c.ticker}) 분석 | ${SITE}`,
    description: `${c.nameKo}(${c.ticker}) — ${c.summary}`,
  })),
];

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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

for (const route of routes) {
  const html = injectMeta(template, route);
  const outDir = join(distDir, route.path);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html, 'utf-8');
}

console.log(`[generate-meta-shells] ${routes.length}개 라우트에 정적 메타 shell을 생성했어요.`);

// sitemap.xml — 검색엔진이 필요한 라우트를 알아서 찾도록 안내한다.
// 마이페이지는 로그인 필요 + noindex라 제외한다.
const sitemapUrls = [
  { path: '', changefreq: 'daily', priority: '1.0' },
  { path: 'companies', changefreq: 'daily', priority: '0.9' },
  ...COMPANIES.map((c) => ({ path: `companies/${c.ticker}`, changefreq: 'weekly', priority: '0.8' })),
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
