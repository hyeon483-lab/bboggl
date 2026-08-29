import { useEffect, useRef, useState, type ReactNode } from 'react';
import { fetchAnalysisCard, normalizeCard, CARD_MOBILE_STYLE, type CardType } from '../../lib/analysisCards';
import styles from './AnalysisCardViewer.module.css';

interface AnalysisCardViewerProps {
  ticker: string;
  type: CardType;
  /** 카드가 아직 업로드되지 않았을 때 보여줄 대체 콘텐츠. 생략하면 기본 안내 문구가 뜬다. */
  fallback?: ReactNode;
}

/**
 * 분석 카드를 Shadow DOM(open)에 렌더링한다. 예전엔 <iframe srcDoc>으로 격리했지만, srcdoc iframe
 * 안의 텍스트는 검색엔진이 부모 페이지 본문으로 귀속시키지 않아 애드센스 심사에서 "가치 낮은
 * 콘텐츠"로 지적받았다. open shadow DOM은 같은 스타일 격리 효과를 내면서도 구글이 렌더링된 페이지의
 * 일부로 인덱싱한다고 공식 문서에 밝힌 방식이라 본문으로 인정받는다.
 */
export default function AnalysisCardViewer({ ticker, type, fallback }: AnalysisCardViewerProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hostRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !html) return;

    const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `${html}<style>${CARD_MOBILE_STYLE}</style>`;
    normalizeCard(shadowRoot);
  }, [html]);

  if (loading) {
    return <p className={styles.state}>불러오는 중...</p>;
  }

  if (!html) {
    return <>{fallback ?? <p className={styles.state}>아직 이 기업의 분석 자료가 준비되지 않았어요.</p>}</>;
  }

  return <div key={type} ref={hostRef} className={styles.frame} />;
}
