import { useSearchParams } from 'react-router-dom';
import Input from '../components/common/Input';
import FilterSortBar from '../components/company/FilterSortBar';
import CompanyGrid from '../components/company/CompanyGrid';
import { mockCompanies } from '../data/mockCompanies';
import { useCompanyFilter } from '../hooks/useCompanyFilter';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import styles from './Companies.module.css';

export default function Companies() {
  const [searchParams] = useSearchParams();
  const { keyword, setKeyword, sector, setSector, sortKey, setSortKey, sectors, filtered } =
    useCompanyFilter(mockCompanies, searchParams.get('q') ?? '');

  useDocumentMeta({
    title: '기업 분석 목록 | Bboggl',
    description: '미국 상장기업을 섹터·시가총액·등락률로 검색하고 비교해보세요.',
  });

  return (
    <div>
      <div className={styles.head}>
        <h1 className={styles.title}>기업 분석</h1>
        <Input
          icon="search"
          className={styles.searchBar}
          placeholder="티커 또는 기업명으로 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <FilterSortBar
        sectors={sectors}
        selectedSector={sector}
        onSectorChange={setSector}
        sortKey={sortKey}
        onSortChange={setSortKey}
        resultCount={filtered.length}
      />

      <CompanyGrid companies={filtered} emptyMessage="검색 결과가 없어요. 다른 키워드로 시도해보세요." />
    </div>
  );
}
