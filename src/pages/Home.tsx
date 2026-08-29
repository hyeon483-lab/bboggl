import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Icon from '../components/common/Icon';
import CompanyGrid from '../components/company/CompanyGrid';
import { mockCompanies } from '../data/mockCompanies';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import styles from './Home.module.css';

const avgChangePercent =
  mockCompanies.reduce((sum, c) => sum + c.changePercent, 0) / mockCompanies.length;
const latestPriceAsOf = mockCompanies
  .map((c) => c.priceAsOf)
  .sort()
  .at(-1);

const MARKET_STATS = [
  { label: '수록 기업 수', value: `${mockCompanies.length}개` },
  { label: '오늘 상승 기업', value: `${mockCompanies.filter((c) => c.changePercent >= 0).length}개` },
  { label: '평균 등락률', value: `${avgChangePercent >= 0 ? '+' : ''}${avgChangePercent.toFixed(2)}%` },
  { label: '주가 기준일', value: latestPriceAsOf ?? '-' },
];

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  useDocumentMeta({
    title: 'Analysis10k — 미국 주식, 10-K 기반으로 한눈에 핵심요약',
    description: 'AI가 정리한 10k 공시자료를 바탕으로 미국 주식의 핵심 정보를 요약해드려요.',
  });

  const recentCompanies = [...mockCompanies]
    .sort((a, b) => (a.lastAnalyzedAt < b.lastAnalyzedAt ? 1 : -1))
    .slice(0, 9);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/companies?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          미국 주식, <span>10-K 기반</span>으로 한눈에 핵심요약
        </h1>
        <p className={styles.subtitle}>
          AI가 정리한 10k 공시자료를 바탕으로 미국 주식의 핵심 정보를 요약해드려요.
        </p>
        <p className={styles.mobileHint}>
          PC, 노트북, 태블릿으로 접속하시면 더욱 최적화된 화면으로 정보를 확인하실 수 있습니다.
        </p>
        <form className={styles.heroSearch} onSubmit={handleSearch}>
          <Input
            icon="search"
            placeholder="예: 엔비디아, AAPL, 반도체..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </form>
      </section>

      <section className={styles.intro}>
        <p>
          Analysis10k는 미국 상장기업의 SEC 공시자료(10-K, 10-Q, DEF 14A)와 어닝콜 트랜스크립트를 AI가
          직접 읽고 정리해서, 복잡한 재무제표를 몇 분 안에 이해할 수 있는 분석 카드로 보여드리는
          사이트예요. 각 기업 페이지에서는 &quot;핵심 요약&quot;(이 회사가 어떻게 돈을 버는지),
          &quot;스토리&quot;(최근 2~3년간 무엇이 달라졌는지), &quot;역DCF 가격 판독&quot;(지금 주가가
          어떤 성장을 전제하고 있는지) 세 가지 각도로 같은 기업을 다시 읽을 수 있습니다.
        </p>
        <p>
          모든 수치와 서술에는 10-K·10-Q·DEF 14A의 페이지 번호를 함께 표기해서, 요약만 보고 끝내지 않고
          원문을 직접 확인하고 싶을 때 출처를 그대로 따라갈 수 있게 만들었어요. 주가와 시가총액은 매
          거래일 마감 후 하루 한 번 자동으로 갱신됩니다.
        </p>
      </section>

      <div className={styles.statsRow}>
        {MARKET_STATS.map((stat) => (
          <Card key={stat.label}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <section>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>최근 분석된 기업</h2>
          <a
            className={styles.viewAll}
            href="/companies"
            onClick={(e) => {
              e.preventDefault();
              navigate('/companies');
            }}
          >
            전체 보기 <Icon name="chevron-right" size={16} />
          </a>
        </div>
        <CompanyGrid companies={recentCompanies} />
      </section>
    </div>
  );
}
