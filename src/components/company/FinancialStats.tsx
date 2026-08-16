import type { FinancialStat } from '../../types/company';
import styles from './FinancialStats.module.css';

export default function FinancialStats({ stats }: { stats: FinancialStat[] }) {
  return (
    <div className={styles.grid}>
      {stats.map((stat) => (
        <div key={stat.label} className={styles.stat}>
          <div className={styles.label}>{stat.label}</div>
          <div className={styles.value}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
