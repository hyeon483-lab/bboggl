/**
 * 매 거래일 마감 후 GitHub Actions가 실행하는 스크립트.
 * Yahoo Finance(비공식, API 키 불필요)에서 종목별로 종가·시가총액을 받아와
 * src/data/prices.json을 갱신한다.
 *
 * (처음엔 Financial Modeling Prep을 1차 소스로 썼는데, 무료 플랜이 종목을
 *  예측 불가능하게 개별 제한해서(VST는 막히고 KO는 되는 식) 걷어내고
 *  Yahoo Finance 하나로 정리했다. 비공식 API라 언젠가 예고 없이 막힐 수는
 *  있지만, "공식" 무료 티어들도 각자 방식대로 제한이 있었어서 지금 단계엔
 *  이쪽이 더 단순하고 안정적이다.)
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

const MAX_HISTORY = 20; // 스파크라인에 보여줄 최근 거래일 수
const REQUEST_DELAY_MS = 300; // 과도한 연속 호출을 피하기 위한 페이싱

const tickers = JSON.parse(readFileSync(tickersPath, 'utf-8'));
const prices = JSON.parse(readFileSync(pricesPath, 'utf-8'));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const today = new Date().toISOString().slice(0, 10);

for (const ticker of tickers) {
  try {
    const q = await yahooFinance.quote(ticker);

    if (!q?.regularMarketPrice || q.regularMarketPrice <= 0) {
      throw new Error('빈 시세 응답 (심볼 오탈자 또는 거래정지 가능성)');
    }

    const price = q.regularMarketPrice;
    const changePercent = q.regularMarketChangePercent ?? 0;
    const marketCapB = q.marketCap ? q.marketCap / 1e9 : 0;
    const priceAsOf = q.regularMarketTime
      ? new Date(q.regularMarketTime).toISOString().slice(0, 10)
      : today;

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
