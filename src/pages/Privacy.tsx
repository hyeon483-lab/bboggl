import { useDocumentMeta } from '../hooks/useDocumentMeta';
import styles from './StaticPage.module.css';

export default function Privacy() {
  useDocumentMeta({
    title: '개인정보처리방침 | Bboggl',
    description: 'Bboggl이 수집하는 개인정보와 이용 목적을 안내합니다.',
  });

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>개인정보처리방침</h1>
      <p className={styles.updated}>시행일: 2026년 8월 16일</p>

      <section className={styles.section}>
        <p>
          Bboggl(이하 &quot;사이트&quot;)은 개인이 운영하는 서비스로, 사업자로 등록된 법인이 아닙니다.
          이 문서는 사이트가 어떤 정보를 수집하고 어떻게 사용하는지 안내합니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>1. 수집하는 정보</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>구분</th>
              <th>수집 항목</th>
              <th>수집 시점</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>계정</td>
              <td>이메일, 비밀번호(암호화 저장), 표시 이름</td>
              <td>회원가입 시</td>
            </tr>
            <tr>
              <td>서비스 이용 기록</td>
              <td>즐겨찾기한 기업, 조회한 기업·일시</td>
              <td>로그인 상태로 서비스 이용 시</td>
            </tr>
            <tr>
              <td>문의 내용</td>
              <td>문의 내용, 회신용 이메일(선택 입력)</td>
              <td>&quot;분석기업 추가&quot;·&quot;업데이트 요청&quot; 제출 시</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>2. 이용 목적</h2>
        <ul>
          <li>로그인, 즐겨찾기, 최근 활동 등 마이페이지 기능 제공</li>
          <li>문의 내용 확인 및 회신</li>
          <li>서비스 개선을 위한 이용 현황 파악</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>3. 제3자 서비스</h2>
        <p>사이트는 아래 외부 서비스를 이용해 개인정보를 처리합니다.</p>
        <ul>
          <li>
            <b>Supabase</b> — 계정 인증, 프로필·활동 기록 데이터베이스 저장
          </li>
          <li>
            <b>Resend</b> — 문의 폼 내용을 운영자 이메일로 전달
          </li>
          <li>
            <b>Vercel</b> — 웹사이트 호스팅 및 접속 로그 처리
          </li>
        </ul>
        <p>
          향후 <b>Google AdSense</b>를 통해 광고를 게재할 경우, Google이 맞춤 광고 제공을 위해 쿠키를
          사용할 수 있습니다. Google의 광고 관련 개인정보 처리 방식은{' '}
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--primary)' }}
          >
            Google 광고 정책 페이지
          </a>
          에서 확인할 수 있습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>4. 보관 기간</h2>
        <p>
          계정 정보는 회원 탈퇴 요청 시까지 보관됩니다. 문의 내용은 이메일로 전달될 뿐 별도
          데이터베이스에 저장하지 않습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. 이용자의 권리</h2>
        <p>
          마이페이지에서 프로필 정보를 직접 조회·수정할 수 있습니다. 계정 삭제나 개인정보 열람·삭제를
          원하시면 아래 이메일로 요청해주세요.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. 문의처</h2>
        <p>개인정보 관련 문의: hyeon483@gmail.com</p>
      </section>

      <section className={styles.section}>
        <h2>7. 변경 고지</h2>
        <p>이 방침이 변경되는 경우 이 페이지에 업데이트된 내용을 게시합니다.</p>
      </section>
    </div>
  );
}
