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
          주가·시가총액은 매 거래일 마감 후 자동으로 갱신됩니다. 비스트라 에너지(VST)의 기업 분석은 실제
          10-K 공시자료를 기반으로 작성됐으며, 그 외 기업의 세부 재무지표·요약은 아직 준비 중인 예시
          데이터로 실제 공시자료와 다를 수 있습니다. 본 사이트의 정보는 투자 판단의 참고 자료일 뿐 투자
          권유가 아니며, 최종 투자 책임은 투자자 본인에게 있습니다.
        </p>
      </div>
    </footer>
  );
}
