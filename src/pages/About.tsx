import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import styles from './StaticPage.module.css';

export default function About() {
  useDocumentMeta({
    title: '소개 | Bboggl',
    description: 'Bboggl이 어떤 사이트인지, 데이터를 어떻게 만드는지 소개합니다.',
  });

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Bboggl 소개</h1>

      <section className={styles.section}>
        <p>
          Bboggl은 미국 상장기업의 공시자료(10-K)를 바탕으로, 복잡한 재무제표를 몇 분 안에 이해할 수
          있는 요약 카드로 정리해서 보여주는 개인 프로젝트예요.
        </p>
      </section>

      <section className={styles.section}>
        <h2>어떻게 만들어지나요</h2>
        <p>
          기업 분석 카드(&quot;핵심 요약&quot;, &quot;스토리&quot;, &quot;역DCF 가격 판독&quot;)는 실제
          SEC 10-K·10-Q·DEF 14A 공시자료와 어닝콜 트랜스크립트를 바탕으로 페이지 출처까지 밝혀서 작성돼요.
          현재 15개 기업의 분석이 올라와 있고, 다른 기업들도 순차적으로 채워나가고 있어요.
        </p>
        <p>주가와 시가총액은 매 거래일 마감 후 하루 한 번 자동으로 갱신돼요.</p>
      </section>

      <section className={styles.section}>
        <h2>운영자</h2>
        <p>
          개인이 만들고 운영하는 사이트예요. 사업자로 등록된 법인이 아니며, 문의는 이메일(
          chriskevin0707@gmail.com)로 받고 있어요. 헤더의 문의 아이콘으로 &quot;분석기업 추가&quot;나
          &quot;업데이트 요청&quot;도 보낼 수 있어요.
        </p>
      </section>

      <section className={styles.section}>
        <h2>투자 관련 안내</h2>
        <p>
          Bboggl의 콘텐츠는 정보 제공 목적일 뿐 투자 권유가 아니에요. 투자 판단과 그 결과에 대한 책임은
          투자자 본인에게 있습니다. 자세한 데이터 출처와 예시 데이터 범위는{' '}
          <Link to="/privacy" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            개인정보처리방침
          </Link>
          과 각 페이지 하단 안내를 참고해주세요.
        </p>
      </section>
    </div>
  );
}
