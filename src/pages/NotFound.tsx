import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import styles from './NotFound.module.css';

export default function NotFound() {
  useDocumentMeta({ title: '페이지를 찾을 수 없어요 | Bboggl', noindex: true });

  return (
    <div className={styles.wrap}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>페이지를 찾을 수 없어요</h1>
      <p className={styles.desc}>주소가 잘못됐거나, 삭제된 페이지예요.</p>
      <div className={styles.actions}>
        <Link to="/">
          <Button>홈으로</Button>
        </Link>
        <Link to="/companies">
          <Button variant="secondary">기업 분석 보기</Button>
        </Link>
      </div>
    </div>
  );
}
