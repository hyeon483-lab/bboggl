import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Icon from '../components/common/Icon';
import Button from '../components/common/Button';
import PriceTrend from '../components/company/PriceTrend';
import FinancialStats from '../components/company/FinancialStats';
import AnalysisTabs from '../components/company/AnalysisTabs';
import { getCompanyByTicker } from '../data/mockCompanies';
import { useFavorite } from '../hooks/useFavorite';
import { useAuth } from '../context/AuthContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { logView } from '../lib/activityLog';
import styles from './CompanyDetail.module.css';

export default function CompanyDetail() {
  const { ticker = '' } = useParams();
  const company = getCompanyByTicker(ticker);
  const { user } = useAuth();
  const { isFavorite, pending, toggle } = useFavorite(ticker, company?.nameKo ?? ticker);

  useDocumentMeta({
    title: company ? `${company.nameKo}(${company.ticker}) 분석 | Bboggl` : 'Bboggl',
    description: company
      ? `${company.nameKo}(${company.ticker}) — ${company.summary}`
      : undefined,
  });

  useEffect(() => {
    if (user && company) {
      logView(user.id, company.ticker, company.nameKo);
    }
  }, [user, company]);

  if (!company) {
    return <Navigate to="/companies" replace />;
  }

  const isPositive = company.changePercent >= 0;

  return (
    <div>
      <Link to="/companies" className={styles.back}>
        <Icon name="chevron-right" size={14} style={{ transform: 'rotate(180deg)' }} />
        기업 목록으로
      </Link>

      <div className={styles.header}>
        <div className={styles.logo} style={{ background: company.logoColor }}>
          {company.logoInitial}
        </div>
        <div className={styles.identity}>
          <div className={styles.nameRow}>
            <h1 className={styles.nameKo}>{company.nameKo}</h1>
            <span className={styles.ticker}>
              {company.ticker} · {company.sector}
            </span>
          </div>
          <div className={styles.nameEn}>{company.nameEn}</div>
          <div className={styles.tags}>
            {company.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
          <div className={styles.actions}>
            <Button
              variant={isFavorite ? 'primary' : 'secondary'}
              size="sm"
              onClick={toggle}
              disabled={pending}
            >
              <Icon name="star" size={16} style={isFavorite ? { fill: 'currentColor' } : undefined} />
              {isFavorite ? '즐겨찾기됨' : '즐겨찾기'}
            </Button>
          </div>
        </div>
        <div className={styles.priceBlock}>
          <div className={styles.price}>${company.price.toFixed(2)}</div>
          <div className={`${styles.change} ${isPositive ? 'text-positive' : 'text-negative'}`}>
            <Icon name={isPositive ? 'trending-up' : 'trending-down'} size={16} />
            {isPositive ? '+' : ''}
            {company.changePercent.toFixed(2)}%
          </div>
          <div className="text-sub" style={{ fontSize: 12, marginTop: 4 }}>
            {company.priceAsOf} 종가 기준 (Yahoo Finance)
          </div>
        </div>
      </div>

      <Card className={styles.chartCard}>
        <div className={styles.chartHead}>
          <h2 className={styles.sectionTitle}>최근 주가 추이</h2>
          <span className="text-sub" style={{ fontSize: 13 }}>
            시가총액 ${company.marketCapB.toLocaleString()}B
          </span>
        </div>
        <PriceTrend data={company.priceHistory} width={640} height={140} positive={isPositive} responsive />
      </Card>

      <Card className={styles.financeCard}>
        <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>
          핵심 재무지표
        </h2>
        <FinancialStats stats={company.financials} />
      </Card>

      <Card className={styles.tabsCard}>
        <AnalysisTabs company={company} />
      </Card>
    </div>
  );
}
