/**
 * 매 거래일 마감 후 GitHub Actions가 실행하는 스크립트.
 * Financial Modeling Prep(FMP)의 stable API에서 종가·시가총액을 받아와
 * src/data/prices.json을 갱신한다. batch-quote는 여러 종목을 한 번에 조회할 수 있어서
 * 100개 이상으로 종목이 늘어나도 호출 1번으로 끝난다.
 * (구 /api/v3/quote 벌크 조회는 무료 플랜에서 403으로 막혀서 stable API로 옮겼다.)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');
const tickersPath = join(dataDir, 'tracked-tickers.json');
const pricesPath = join(dataDir, 'prices.json');

const API_KEY = process.env.FMP_API_KEY;
if (!API_KEY) {
  console.error('[update-prices] FMP_API_KEY 환경변수가 없어요.');
  process.exit(1);
}

const MAX_HISTORY = 20; // 스파크라인에 보여줄 최근 거래일 수

const tickers = JSON.parse(readFileSync(tickersPath, 'utf-8'));
const prices = JSON.parse(readFileSync(pricesPath, 'utf-8'));

function toDateString(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

const url = `https://financialmodelingprep.com/stable/batch-quote?symbols=${tickers.join(',')}&apikey=${API_KEY}`;
const res = await fetch(url);
const bodyText = await res.text();

if (!res.ok) {
  console.error(`[update-prices] FMP 응답 오류: HTTP ${res.status} — ${bodyText.slice(0, 300)}`);
  process.exit(1);
}

let body;
try {
  body = JSON.parse(bodyText);
} catch {
  console.error('[update-prices] FMP 응답이 JSON이 아니에요:', bodyText.slice(0, 300));
  process.exit(1);
}

if (!Array.isArray(body)) {
  console.error('[update-prices] FMP 오류:', body?.['Error Message'] ?? JSON.stringify(body));
  process.exit(1);
}

const quotesByTicker = new Map(body.map((q) => [q.symbol, q]));
const today = new Date().toISOString().slice(0, 10);

for (const ticker of tickers) {
  const q = quotesByTicker.get(ticker);

  if (!q || !q.price || q.price <= 0) {
    console.error(`[update-prices] ${ticker} 갱신 실패: 응답에 없거나 빈 시세 (심볼 오탈자 가능성)`);
    continue;
  }

  const price = q.price;
  const changePercent = q.changesPercentage ?? q.changePercentage ?? 0;
  const marketCapB = q.marketCap ? q.marketCap / 1e9 : 0;
  const priceAsOf = q.timestamp ? toDateString(q.timestamp) : today;

  const prevHistory = prices[ticker]?.priceHistory ?? [];
  const prevAsOf = prices[ticker]?.priceAsOf;
  // 같은 거래일에 여러 번 돌리면 마지막 값만 갱신하고, 새 거래일이면 이어붙인다.
  const nextHistory =
    prevAsOf === priceAsOf
      ? [...prevHistory.slice(0, -1), price]
      : [...prevHistory, price].slice(-MAX_HISTORY);

  prices[ticker] = { price, changePercent, marketCapB, priceAsOf, priceHistory: nextHistory };
  console.log(`[update-prices] ${ticker} 갱신 완료: $${price}`);
}

writeFileSync(pricesPath, JSON.stringify(prices, null, 2) + '\n', 'utf-8');
console.log('[update-prices] prices.json 저장 완료.');
