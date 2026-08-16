import type { Company } from '../types/company';
import pricesData from './prices.json';

type PriceData = Pick<Company, 'price' | 'changePercent' | 'marketCapB' | 'priceAsOf' | 'priceHistory'>;
type CompanyMeta = Omit<Company, keyof PriceData>;

const prices = pricesData as Record<string, PriceData>;

const EMPTY_PRICE: PriceData = { price: 0, changePercent: 0, marketCapB: 0, priceAsOf: '-', priceHistory: [] };

/**
 * 종가·시가총액·주가 추이는 매 거래일 마감 후 scripts/update-prices.mjs가
 * Finnhub에서 받아와 src/data/prices.json에 채워 넣습니다 (GitHub Actions로 자동화).
 * 여기 있는 필드들은 기업 소개·재무지표 등 사람이 직접 채우는 정보입니다.
 */
const COMPANY_META: CompanyMeta[] = [
  {
    ticker: 'AAPL',
    nameKo: '애플',
    nameEn: 'Apple Inc.',
    sector: '테크',
    logoInitial: 'A',
    logoColor: '#4E5968',
    summary: '아이폰을 중심으로 한 하드웨어와 서비스 생태계를 결합한 소비자 테크 기업',
    tags: ['하드웨어', '서비스', '생태계'],
    financials: [
      { label: '매출 (TTM)', value: '$391.0B' },
      { label: '영업이익률', value: '31.5%' },
      { label: 'PER', value: '34.2x' },
      { label: 'ROE', value: '160.6%' },
    ],
    story: '아이폰 매출 비중이 서서히 낮아지는 대신 서비스 부문이 꾸준히 성장하며 이익의 질이 개선되고 있습니다.',
    lastAnalyzedAt: '2026-08-10',
  },
  {
    ticker: 'TSLA',
    nameKo: '테슬라',
    nameEn: 'Tesla, Inc.',
    sector: '자동차',
    logoInitial: 'T',
    logoColor: '#F04452',
    summary: '전기차와 에너지 저장, 자율주행 소프트웨어를 함께 개발하는 모빌리티 기업',
    tags: ['전기차', '자율주행', '에너지저장'],
    financials: [
      { label: '매출 (TTM)', value: '$97.7B' },
      { label: '영업이익률', value: '7.2%' },
      { label: 'PER', value: '68.5x' },
      { label: 'ROE', value: '10.4%' },
    ],
    story: '차량 마진 압박이 지속되는 가운데 에너지 저장 사업부가 새로운 성장축으로 부상하고 있습니다.',
    lastAnalyzedAt: '2026-08-12',
  },
  {
    ticker: 'MSFT',
    nameKo: '마이크로소프트',
    nameEn: 'Microsoft Corporation',
    sector: '테크',
    logoInitial: 'M',
    logoColor: '#3182F6',
    summary: '클라우드(Azure)와 생산성 소프트웨어, AI 서비스를 축으로 하는 엔터프라이즈 테크 기업',
    tags: ['클라우드', 'AI', 'SaaS'],
    financials: [
      { label: '매출 (TTM)', value: '$254.2B' },
      { label: '영업이익률', value: '44.6%' },
      { label: 'PER', value: '35.1x' },
      { label: 'ROE', value: '33.4%' },
    ],
    story: 'Azure 성장률이 둔화 우려를 뚫고 AI 관련 워크로드 덕분에 재가속하는 모습을 보이고 있습니다.',
    lastAnalyzedAt: '2026-08-14',
  },
  {
    ticker: 'NVDA',
    nameKo: '엔비디아',
    nameEn: 'NVIDIA Corporation',
    sector: '반도체',
    logoInitial: 'N',
    logoColor: '#1B64DA',
    summary: 'AI 학습·추론용 GPU와 데이터센터 플랫폼을 주력으로 하는 반도체 설계 기업',
    tags: ['GPU', 'AI 인프라', '데이터센터'],
    financials: [
      { label: '매출 (TTM)', value: '$113.3B' },
      { label: '영업이익률', value: '62.1%' },
      { label: 'PER', value: '52.7x' },
      { label: 'ROE', value: '91.5%' },
    ],
    story: '데이터센터 매출 비중이 90%를 넘어서며 사실상 AI 인프라 기업으로 완전히 재편됐습니다.',
    lastAnalyzedAt: '2026-08-15',
  },
  {
    ticker: 'AMZN',
    nameKo: '아마존',
    nameEn: 'Amazon.com, Inc.',
    sector: '이커머스',
    logoInitial: 'A',
    logoColor: '#F2A93B',
    summary: '이커머스와 클라우드(AWS), 광고를 함께 운영하는 멀티 사업 플랫폼 기업',
    tags: ['AWS', '광고', '풀필먼트'],
    financials: [
      { label: '매출 (TTM)', value: '$620.1B' },
      { label: '영업이익률', value: '10.8%' },
      { label: 'PER', value: '38.9x' },
      { label: 'ROE', value: '21.7%' },
    ],
    story: 'AWS와 광고 부문의 높은 마진이 이커머스의 낮은 마진을 상쇄하며 전체 이익률을 끌어올리고 있습니다.',
    lastAnalyzedAt: '2026-08-11',
  },
  {
    ticker: 'VST',
    nameKo: '비스트라 에너지',
    nameEn: 'Vistra Corp.',
    sector: '전력·에너지',
    logoInitial: 'V',
    logoColor: '#0F9D58',
    summary: '발전·소매 전력 판매를 아우르는 미국 최대 규모의 통합 전력 회사',
    tags: ['전력', '원자력', 'AI 전력수요'],
    financials: [
      { label: '매출 (TTM)', value: '$17.1B' },
      { label: '영업이익률', value: '18.9%' },
      { label: 'PER', value: '21.3x' },
      { label: 'ROE', value: '28.6%' },
    ],
    story: '데이터센터발 전력 수요 급증 기대감이 원자력 발전 자산의 재평가로 이어지고 있습니다.',
    lastAnalyzedAt: '2026-08-16',
  },
];

export const mockCompanies: Company[] = COMPANY_META.map((meta) => ({
  ...meta,
  ...(prices[meta.ticker] ?? EMPTY_PRICE),
}));

export function getCompanyByTicker(ticker: string): Company | undefined {
  return mockCompanies.find((c) => c.ticker.toLowerCase() === ticker.toLowerCase());
}
