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
    title: 'Bboggl — 미국 상장기업 10-K 기반 분석',
    description: 'AI가 정리한 10-K 공시자료를 바탕으로 미국 상장기업의 핵심을 한눈에 요약해드립니다.',
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
          미국 상장기업, <span>10-K 기반</span>으로 한눈에
        </h1>
        <p className={styles.subtitle}>
          AI가 정리한 공시자료를 바탕으로 기업의 핵심을 요약해드려요.
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
