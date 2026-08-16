import { useEffect, useState } from 'react';
import { fetchAnalysisCard, type CardType } from '../../lib/analysisCards';
import styles from './AnalysisCardViewer.module.css';

const CARD_TABS: { key: CardType; label: string }[] = [
  { key: 'company_decoder', label: '기업 한장 요약' },
  { key: 'price_decoder', label: '역DCF 가격 판독' },
];

export default function AnalysisCardViewer({ ticker }: { ticker: string }) {
  const [active, setActive] = useState<CardType>('company_decoder');
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(400);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHtml(null);

    fetchAnalysisCard(ticker, active).then((result) => {
      if (cancelled) return;
      setHtml(result);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [ticker, active]);

  const activeLabel = CARD_TABS.find((t) => t.key === active)?.label;

  return (
    <div>
      <div className={styles.tabs}>
        {CARD_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${active === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p className={styles.state}>불러오는 중...</p>}

      {!loading && !html && (
        <p className={styles.state}>아직 이 기업의 {activeLabel} 자료가 준비되지 않았어요.</p>
      )}

      {!loading && html && (
        <iframe
          key={active}
          srcDoc={html}
          title={activeLabel}
          className={styles.frame}
          style={{ height }}
          onLoad={(e) => {
            const doc = e.currentTarget.contentWindow?.document;
            if (doc) setHeight(doc.documentElement.scrollHeight + 24);
          }}
        />
      )}
    </div>
  );
}
