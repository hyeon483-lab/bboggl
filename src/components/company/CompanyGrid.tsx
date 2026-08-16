import type { ReactNode } from 'react';
import CompanyCard from './CompanyCard';
import type { Company } from '../../types/company';
import styles from './CompanyGrid.module.css';

interface CompanyGridProps {
  companies: Company[];
  emptyMessage?: ReactNode;
}

export default function CompanyGrid({ companies, emptyMessage = '조건에 맞는 기업이 없어요.' }: CompanyGridProps) {
  if (companies.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.grid}>
      {companies.map((company) => (
        <CompanyCard key={company.ticker} company={company} />
      ))}
    </div>
  );
}
