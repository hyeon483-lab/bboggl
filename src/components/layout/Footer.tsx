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
          주가·시가총액은 Google Finance 공개 데이터를 기준으로 반영했습니다. 이를 제외한 재무지표·기업
          요약 등 일부 콘텐츠는 서비스 준비 중인 예시 데이터로, 실제 공시자료와 다를 수 있습니다. 본
          사이트의 정보는 투자 판단의 참고 자료일 뿐 투자 권유가 아니며, 투자에 대한 최종 책임은 투자자
          본인에게 있습니다.
        </p>
      </div>
    </footer>
  );
}
