import { useEffect, useState, type ReactNode } from 'react';
import { fetchAnalysisCard, type CardType } from '../../lib/analysisCards';
import styles from './AnalysisCardViewer.module.css';

interface AnalysisCardViewerProps {
  ticker: string;
  type: CardType;
  /** 카드가 아직 업로드되지 않았을 때 보여줄 대체 콘텐츠. 생략하면 기본 안내 문구가 뜬다. */
  fallback?: ReactNode;
}

export default function AnalysisCardViewer({ ticker, type, fallback }: AnalysisCardViewerProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(400);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHtml(null);

    fetchAnalysisCard(ticker, type).then((result) => {
      if (cancelled) return;
      setHtml(result);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [ticker, type]);

  if (loading) {
    return <p className={styles.state}>불러오는 중...</p>;
  }

  if (!html) {
    return <>{fallback ?? <p className={styles.state}>아직 이 기업의 분석 자료가 준비되지 않았어요.</p>}</>;
  }

  return (
    <iframe
      key={type}
      srcDoc={html}
      title={type}
      className={styles.frame}
      style={{ height }}
      onLoad={(e) => {
        const doc = e.currentTarget.contentWindow?.document;
        if (doc) setHeight(doc.documentElement.scrollHeight + 24);
      }}
    />
  );
}
