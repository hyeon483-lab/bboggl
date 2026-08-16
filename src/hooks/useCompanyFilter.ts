import { useMemo, useState } from 'react';
import type { Company, Sector } from '../types/company';
import type { SortKey } from '../components/company/FilterSortBar';

export function useCompanyFilter(companies: Company[], initialKeyword = '') {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [sector, setSector] = useState<Sector | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('marketCap');

  const sectors = useMemo(
    () => Array.from(new Set(companies.map((c) => c.sector))) as Sector[],
    [companies],
  );

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    const result = companies.filter((c) => {
      const matchesKeyword =
        q === '' ||
        c.nameKo.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.ticker.toLowerCase().includes(q);
      const matchesSector = sector === 'all' || c.sector === sector;
      return matchesKeyword && matchesSector;
    });

    return result.sort((a, b) => {
      if (sortKey === 'marketCap') return b.marketCapB - a.marketCapB;
      if (sortKey === 'changePercent') return b.changePercent - a.changePercent;
      return a.lastAnalyzedAt < b.lastAnalyzedAt ? 1 : -1;
    });
  }, [companies, keyword, sector, sortKey]);

  return { keyword, setKeyword, sector, setSector, sortKey, setSortKey, sectors, filtered };
}
