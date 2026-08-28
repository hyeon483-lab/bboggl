import { Navigate, Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Icon from '../components/common/Icon';
import ProfileCard from '../components/mypage/ProfileCard';
import ActivityList from '../components/mypage/ActivityList';
import CompanyGrid from '../components/company/CompanyGrid';
import { useAuth } from '../context/AuthContext';
import { useRecentActivity } from '../hooks/useRecentActivity';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { mockCompanies } from '../data/mockCompanies';
import styles from './MyPage.module.css';

export default function MyPage() {
  const { user, profile, loading } = useAuth();
  const { items: activity, loading: activityLoading } = useRecentActivity();

  useDocumentMeta({ title: '마이페이지 | Analysis10k', noindex: true });

  if (loading) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const favoriteCompanies = mockCompanies.filter((c) =>
    profile?.favorite_tickers.includes(c.ticker),
  );

  return (
    <div>
      <h1 className={styles.title}>마이페이지</h1>

      <div className={styles.notice}>
        <Icon name="settings" size={16} />
        프로필·즐겨찾기·최근 활동 모두 Supabase에 실제 저장돼요.
      </div>

      <ProfileCard />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>즐겨찾는 기업</h2>
        <CompanyGrid
          companies={favoriteCompanies}
          emptyMessage={
            <>
              아직 즐겨찾기한 기업이 없어요.{' '}
              <Link to="/companies" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                기업 둘러보기
              </Link>
            </>
          }
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>최근 활동</h2>
        <Card className={styles.activityCard}>
          {activityLoading ? (
            <p className="text-sub" style={{ padding: '20px 4px' }}>
              불러오는 중...
            </p>
          ) : activity.length === 0 ? (
            <p className="text-sub" style={{ padding: '20px 4px' }}>
              아직 활동 내역이 없어요. 기업을 둘러보면 여기에 기록돼요.
            </p>
          ) : (
            <ActivityList items={activity} />
          )}
        </Card>
      </section>
    </div>
  );
}
