/**
 * 매 거래일 마감 후 GitHub Actions가 실행하는 스크립트.
 * Finnhub에서 종가·시가총액을 받아와 src/data/prices.json을 갱신한다.
 * (100개 이상으로 종목이 늘어날 걸 감안해 Finnhub 무료 티어 — 분당 60회 — 를 사용한다.)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');
const tickersPath = join(dataDir, 'tracked-tickers.json');
const pricesPath = join(dataDir, 'prices.json');

const API_KEY = process.env.FINNHUB_API_KEY;
if (!API_KEY) {
  console.error('[update-prices] FINNHUB_API_KEY 환경변수가 없어요.');
  process.exit(1);
}

const MAX_HISTORY = 20; // 스파크라인에 보여줄 최근 거래일 수
const REQUEST_DELAY_MS = 1100; // Finnhub 무료 티어(분당 60회) 안에서 여유있게 페이싱

const tickers = JSON.parse(readFileSync(tickersPath, 'utf-8'));
const prices = JSON.parse(readFileSync(pricesPath, 'utf-8'));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function toDateString(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

async function updateTicker(ticker) {
  const quote = await fetchJson(
    `https://finnhub.io/api/v2/quote?symbol=${ticker}&token=${API_KEY}`,
  );
  await sleep(REQUEST_DELAY_MS);
  const profile = await fetchJson(
    `https://finnhub.io/api/v2/stock/profile2?symbol=${ticker}&token=${API_KEY}`,
  );

  if (!quote.c || quote.c <= 0) {
    throw new Error('빈 시세 응답 (심볼 오탈자 또는 거래정지 가능성)');
  }

  const price = quote.c;
  const changePercent = quote.dp ?? 0;
  const marketCapB = profile.marketCapitalization ? profile.marketCapitalization / 1000 : 0;
  const priceAsOf = quote.t ? toDateString(quote.t) : new Date().toISOString().slice(0, 10);

  const prevHistory = prices[ticker]?.priceHistory ?? [];
  const prevAsOf = prices[ticker]?.priceAsOf;
  // 같은 거래일에 여러 번 돌리면 마지막 값만 갱신하고, 새 거래일이면 이어붙인다.
  const nextHistory =
    prevAsOf === priceAsOf
      ? [...prevHistory.slice(0, -1), price]
      : [...prevHistory, price].slice(-MAX_HISTORY);

  return { price, changePercent, marketCapB, priceAsOf, priceHistory: nextHistory };
}

let hasError = false;

for (const ticker of tickers) {
  try {
    prices[ticker] = await updateTicker(ticker);
    console.log(`[update-prices] ${ticker} 갱신 완료: $${prices[ticker].price}`);
  } catch (err) {
    hasError = true;
    console.error(`[update-prices] ${ticker} 갱신 실패:`, err.message);
  }
  await sleep(REQUEST_DELAY_MS);
}

writeFileSync(pricesPath, JSON.stringify(prices, null, 2) + '\n', 'utf-8');
console.log('[update-prices] prices.json 저장 완료.');

if (hasError) {
  // 일부 종목 실패는 있어도 나머지는 반영해야 하니 커밋은 진행하되, 워크플로 로그에 표시되도록 종료코드만 남긴다.
  process.exitCode = 0;
}
