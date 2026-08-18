import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Icon from '../common/Icon';
import PriceTrend from './PriceTrend';
import { useFavorite } from '../../hooks/useFavorite';
import type { Company } from '../../types/company';
import styles from './CompanyCard.module.css';

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const navigate = useNavigate();
  const isPositive = company.changePercent >= 0;
  const { isFavorite, pending, toggle } = useFavorite(company.ticker, company.nameKo);

  return (
    <Card interactive onClick={() => navigate(`/companies/${company.ticker}`)}>
      <div className={styles.card}>
        <div className={styles.top}>
          <div className={styles.logo} style={{ background: company.logoColor }}>
            {company.logoInitial}
          </div>
          <div className={styles.identity}>
            <div className={styles.nameRow}>
              <span className={styles.nameKo}>{company.nameKo}</span>
              <span className={styles.ticker}>{company.ticker}</span>
            </div>
            <div className={styles.nameEn}>{company.nameEn}</div>
          </div>
          <button
            className={`${styles.favBtn} ${isFavorite ? styles.favBtnActive : ''}`}
            onClick={toggle}
            disabled={pending}
            aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            aria-pressed={isFavorite}
          >
            <Icon name="star" size={16} style={isFavorite ? { fill: 'currentColor' } : undefined} />
          </button>
          <PriceTrend data={company.priceHistory} width={64} height={32} positive={isPositive} />
        </div>

        <div className={styles.priceRow}>
          <span className={styles.price}>${company.price.toFixed(2)}</span>
          <span className={`${styles.change} ${isPositive ? 'text-positive' : 'text-negative'}`}>
            <Icon name={isPositive ? 'trending-up' : 'trending-down'} size={14} />
            {isPositive ? '+' : ''}
            {company.changePercent.toFixed(2)}%
          </span>
        </div>

        <p className={styles.summary}>{company.summary}</p>

        <div className={styles.tags}>
          <Badge tone="primary">{company.sector}</Badge>
          {company.tags.slice(0, 2).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <div className={styles.meta}>
          <span>시가총액 ${company.marketCapB.toLocaleString()}B</span>
          <span>
            {company.latestTenKYear ? `${company.latestTenKYear}년도 10-K 기준` : `${company.lastAnalyzedAt} 분석`}
          </span>
        </div>
      </div>
    </Card>
  );
}
