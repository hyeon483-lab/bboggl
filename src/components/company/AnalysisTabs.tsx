import { useState } from 'react';
import type { Company } from '../../types/company';
import AnalysisCardViewer from './AnalysisCardViewer';
import styles from './AnalysisTabs.module.css';

const TABS = ['핵심 요약', '스토리', '체크포인트'] as const;
type Tab = (typeof TABS)[number];

export default function AnalysisTabs({ company }: { company: Company }) {
  const [active, setActive] = useState<Tab>('핵심 요약');

  return (
    <div>
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${active === tab ? styles.tabActive : ''}`}
            onClick={() => setActive(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {active === '핵심 요약' && (
          <p>
            {company.nameKo}({company.ticker})은(는) {company.sector} 섹터에서 {company.summary}
            입니다. 최근 분석 기준 시가총액은 ${company.marketCapB.toLocaleString()}B 수준입니다.
          </p>
        )}
        {active === '스토리' && <p>{company.story}</p>}
        {active === '체크포인트' && <AnalysisCardViewer ticker={company.ticker} />}
      </div>
    </div>
  );
}
