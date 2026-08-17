/**
 * 매 거래일 마감 후 GitHub Actions가 실행하는 스크립트.
 * Financial Modeling Prep(FMP)의 stable API에서 종목별로 종가·시가총액을 받아와
 * src/data/prices.json을 갱신한다.
 * (무료 플랜은 여러 종목을 한번에 묶어 조회하는 batch-quote가 막혀있어서,
 *  /stable/quote?symbol={ticker} 로 종목마다 한 번씩 호출한다.)
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
const REQUEST_DELAY_MS = 600; // 무료 플랜 레이트리밋을 넉넉히 피하기 위한 페이싱

const tickers = JSON.parse(readFileSync(tickersPath, 'utf-8'));
const prices = JSON.parse(readFileSync(pricesPath, 'utf-8'));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function toDateString(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

async function fetchQuote(ticker) {
  const url = `https://financialmodelingprep.com/stable/quote?symbol=${ticker}&apikey=${API_KEY}`;
  const res = await fetch(url);
  const bodyText = await res.text();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} — ${bodyText.slice(0, 200)}`);
  }

  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    throw new Error(`JSON이 아닌 응답: ${bodyText.slice(0, 200)}`);
  }

  if (!Array.isArray(body) || body.length === 0) {
    throw new Error(body?.['Error Message'] ?? body?.message ?? `빈 응답: ${bodyText.slice(0, 200)}`);
  }

  return body[0];
}

const today = new Date().toISOString().slice(0, 10);

for (const ticker of tickers) {
  try {
    const q = await fetchQuote(ticker);

    if (!q.price || q.price <= 0) {
      throw new Error('빈 시세 응답 (심볼 오탈자 또는 거래정지 가능성)');
    }

    const price = q.price;
    const changePercent = q.changePercentage ?? q.changesPercentage ?? 0;
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
  } catch (err) {
    console.error(`[update-prices] ${ticker} 갱신 실패:`, err.message);
  }

  await sleep(REQUEST_DELAY_MS);
}

writeFileSync(pricesPath, JSON.stringify(prices, null, 2) + '\n', 'utf-8');
console.log('[update-prices] prices.json 저장 완료.');
