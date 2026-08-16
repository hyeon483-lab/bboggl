export type Sector =
  | '테크'
  | '자동차'
  | '반도체'
  | '전력·에너지'
  | '이커머스'
  | '헬스케어';

export interface FinancialStat {
  label: string;
  value: string;
  hint?: string;
}

export interface Company {
  ticker: string;
  nameKo: string;
  nameEn: string;
  sector: Sector;
  logoInitial: string;
  logoColor: string;
  price: number;
  changePercent: number;
  marketCapB: number; // 시가총액, 단위: 십억 달러
  priceAsOf: string; // 종가/시가총액 기준일 (Google Finance)
  summary: string;
  tags: string[];
  priceHistory: number[];
  financials: FinancialStat[];
  story: string;
  lastAnalyzedAt: string;
}
