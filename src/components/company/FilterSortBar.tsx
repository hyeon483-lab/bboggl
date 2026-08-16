import type { Sector } from '../../types/company';
import styles from './FilterSortBar.module.css';

export type SortKey = 'marketCap' | 'changePercent' | 'recent';

interface FilterSortBarProps {
  sectors: Sector[];
  selectedSector: Sector | 'all';
  onSectorChange: (sector: Sector | 'all') => void;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
  resultCount: number;
}

const SORT_LABELS: Record<SortKey, string> = {
  marketCap: '시가총액순',
  changePercent: '등락률순',
  recent: '최근 분석순',
};

export default function FilterSortBar({
  sectors,
  selectedSector,
  onSectorChange,
  sortKey,
  onSortChange,
  resultCount,
}: FilterSortBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.chips}>
        <button
          className={`${styles.chip} ${selectedSector === 'all' ? styles.chipActive : ''}`}
          onClick={() => onSectorChange('all')}
        >
          전체
        </button>
        {sectors.map((sector) => (
          <button
            key={sector}
            className={`${styles.chip} ${selectedSector === sector ? styles.chipActive : ''}`}
            onClick={() => onSectorChange(sector)}
          >
            {sector}
          </button>
        ))}
      </div>

      <div className={styles.right}>
        <span className={styles.count}>{resultCount}개 기업</span>
        <select
          className={styles.select}
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
        >
          {Object.entries(SORT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
