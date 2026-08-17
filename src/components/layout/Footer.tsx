import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.row}>
          <div className={styles.brandGroup}>
            <span className={styles.brand}>🍲 Bboggl</span>
            <span className="text-sub">미국 상장기업 분석 리포트</span>
          </div>
          <nav className={styles.links}>
            <Link to="/about">소개</Link>
            <Link to="/privacy">개인정보처리방침</Link>
          </nav>
        </div>
        <p className={styles.disclaimer}>
          주가·시가총액은 매 거래일 마감 후 1일 1회 자동으로 갱신됩니다. 상장기업 분석은 실제 10-K
          공시자료를 기반으로 작성됐으며, 그 외 부족한 자료들은 언론사 보도자료를 포함한 다양한 외부
          데이터를 인용하였기에 사실과 일부 다를 수 있습니다. 본 사이트의 정보는 투자 판단의 참고 자료일
          뿐 투자 권유가 아니며, 최종 투자 책임은 투자자 본인에게 있습니다.
        </p>
      </div>
    </footer>
  );
}
