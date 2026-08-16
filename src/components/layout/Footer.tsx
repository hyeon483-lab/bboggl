import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.row}>
          <span className={styles.brand}>🍲 Bboggl</span>
          <span className="text-sub">미국 상장기업 분석 리포트</span>
        </div>
        <p className={styles.disclaimer}>
          본 사이트의 모든 수치와 분석은 데모용 더미 데이터이며 실제 투자 판단의 근거로 사용할 수 없습니다.
          투자에 대한 최종 책임은 투자자 본인에게 있습니다.
        </p>
      </div>
    </footer>
  );
}
