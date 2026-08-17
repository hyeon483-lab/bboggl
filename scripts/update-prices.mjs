/**
 * 매 거래일 마감 후 GitHub Actions가 실행하는 스크립트.
 * 1차로 Financial Modeling Prep(FMP) stable API에서 종목별로 종가·시가총액을 받아오고,
 * FMP가 특정 종목을 막으면(예: 무료 플랜에서 개별 종목 제한) Yahoo Finance(비공식, 키 불필요)로
 * 한 번 더 시도한다. 결과는 src/data/prices.json에 반영된다.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

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

async function fetchFromFmp(ticker) {
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

  const q = body[0];
  if (!q.price || q.price <= 0) throw new Error('빈 시세 응답');

  return {
    price: q.price,
    changePercent: q.changePercentage ?? q.changesPercentage ?? 0,
    marketCapB: q.marketCap ? q.marketCap / 1e9 : 0,
    priceAsOf: q.timestamp ? toDateString(q.timestamp) : undefined,
  };
}

async function fetchFromYahoo(ticker) {
  const q = await yahooFinance.quote(ticker);
  if (!q?.regularMarketPrice || q.regularMarketPrice <= 0) throw new Error('빈 시세 응답');

  return {
    price: q.regularMarketPrice,
    changePercent: q.regularMarketChangePercent ?? 0,
    marketCapB: q.marketCap ? q.marketCap / 1e9 : 0,
    priceAsOf: q.regularMarketTime ? new Date(q.regularMarketTime).toISOString().slice(0, 10) : undefined,
  };
}

const today = new Date().toISOString().slice(0, 10);

for (const ticker of tickers) {
  let quote;
  let source = 'FMP';

  try {
    quote = await fetchFromFmp(ticker);
  } catch (fmpErr) {
    source = 'Yahoo Finance';
    try {
      quote = await fetchFromYahoo(ticker);
    } catch (yahooErr) {
      console.error(
        `[update-prices] ${ticker} 갱신 실패 — FMP: ${fmpErr.message} / Yahoo: ${yahooErr.message}`,
      );
      await sleep(REQUEST_DELAY_MS);
      continue;
    }
  }

  const priceAsOf = quote.priceAsOf ?? today;
  const prevHistory = prices[ticker]?.priceHistory ?? [];
  const prevAsOf = prices[ticker]?.priceAsOf;
  // 같은 거래일에 여러 번 돌리면 마지막 값만 갱신하고, 새 거래일이면 이어붙인다.
  const nextHistory =
    prevAsOf === priceAsOf
      ? [...prevHistory.slice(0, -1), quote.price]
      : [...prevHistory, quote.price].slice(-MAX_HISTORY);

  prices[ticker] = {
    price: quote.price,
    changePercent: quote.changePercent,
    marketCapB: quote.marketCapB,
    priceAsOf,
    priceHistory: nextHistory,
  };
  console.log(`[update-prices] ${ticker} 갱신 완료 (${source}): $${quote.price}`);

  await sleep(REQUEST_DELAY_MS);
}

writeFileSync(pricesPath, JSON.stringify(prices, null, 2) + '\n', 'utf-8');
console.log('[update-prices] prices.json 저장 완료.');
