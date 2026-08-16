export const config = { runtime: 'edge' };

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = 'hyeon483@gmail.com';
const FROM_EMAIL = 'Bboggl 문의 <onboarding@resend.dev>';
const MAX_MESSAGE_LENGTH = 2000;

const CONTACT_LABELS: Record<string, string> = {
  add: '분석기업 추가',
  update: '업데이트 요청',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  if (!RESEND_API_KEY) {
    console.error('[api/contact] RESEND_API_KEY 환경변수가 없어요.');
    return json({ error: '서버 설정 오류로 메일을 보낼 수 없어요.' }, 500);
  }

  let body: { type?: string; message?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: '잘못된 요청이에요.' }, 400);
  }

  const typeLabel = body.type ? CONTACT_LABELS[body.type] : undefined;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const replyEmail = typeof body.email === 'string' ? body.email.trim() : '';

  if (!typeLabel) {
    return json({ error: '요청 종류가 올바르지 않아요.' }, 400);
  }
  if (!message) {
    return json({ error: '내용을 입력해주세요.' }, 400);
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return json({ error: '내용이 너무 길어요.' }, 400);
  }

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `[Bboggl 문의] ${typeLabel}`,
      html: `
        <p><b>유형:</b> ${escapeHtml(typeLabel)}</p>
        <p><b>회신 이메일:</b> ${escapeHtml(replyEmail || '(입력 안 함)')}</p>
        <p><b>내용:</b></p>
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      `,
      ...(replyEmail ? { reply_to: replyEmail } : {}),
    }),
  });

  if (!resendRes.ok) {
    const detail = await resendRes.text().catch(() => '');
    console.error('[api/contact] Resend 전송 실패:', resendRes.status, detail);
    return json({ error: '메일 전송에 실패했어요.' }, 502);
  }

  return json({ ok: true });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
