/**
 * 매 거래일 마감 후 GitHub Actions가 실행하는 스크립트.
 * Yahoo Finance(비공식, API 키 불필요)에서 종목별로 종가·시가총액과
 * 최근 1년 주간 종가(스파크라인용)를 받아와 src/data/prices.json을 갱신한다.
 *
 * (처음엔 Financial Modeling Prep을 1차 소스로 썼는데, 무료 플랜이 종목을
 *  예측 불가능하게 개별 제한해서(VST는 막히고 KO는 되는 식) 걷어내고
 *  Yahoo Finance 하나로 정리했다. 비공식 API라 언젠가 예고 없이 막힐 수는
 *  있지만, "공식" 무료 티어들도 각자 방식대로 제한이 있었어서 지금 단계엔
 *  이쪽이 더 단순하고 안정적이다.)
 *
 * priceHistory는 예전엔 이 스크립트를 돌릴 때마다 하루치씩 이어붙이는
 * 방식이었는데, 그러면 최근 거래일 며칠치밖에 안 쌓여서 타일의 "추이" 그래프가
 * 사실상 의미가 없었다. 이제는 매번 최근 1년치 주간 종가를 통째로 다시
 * 받아와 대체하는 방식으로 바꿨다 — 실행할 때마다 항상 정확한 1년 추이가 된다.
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

const REQUEST_DELAY_MS = 300; // 과도한 연속 호출을 피하기 위한 페이싱

const tickers = JSON.parse(readFileSync(tickersPath, 'utf-8'));
const prices = JSON.parse(readFileSync(pricesPath, 'utf-8'));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const today = new Date().toISOString().slice(0, 10);

const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

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

    await sleep(REQUEST_DELAY_MS);

    const chart = await yahooFinance.chart(ticker, { period1: oneYearAgo, interval: '1wk' });
    const weeklyCloses = (chart.quotes ?? [])
      .map((c) => c.close)
      .filter((c) => typeof c === 'number' && c > 0);
    // 차트의 마지막 주간 바는 "이번 주 진행 중" 값이라 방금 받은 실시간 현재가로 덮어써서
    // 화면에 보이는 가격과 스파크라인 끝점이 항상 일치하도록 한다.
    const priceHistory = weeklyCloses.length > 1 ? [...weeklyCloses.slice(0, -1), price] : [price];

    prices[ticker] = { price, changePercent, marketCapB, priceAsOf, priceHistory };
    console.log(`[update-prices] ${ticker} 갱신 완료: $${price} (1년 주간 히스토리 ${priceHistory.length}포인트)`);
  } catch (err) {
    console.error(`[update-prices] ${ticker} 갱신 실패:`, err.message);
  }

  await sleep(REQUEST_DELAY_MS);
}

writeFileSync(pricesPath, JSON.stringify(prices, null, 2) + '\n', 'utf-8');
console.log('[update-prices] prices.json 저장 완료.');
