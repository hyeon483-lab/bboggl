export type ContactType = 'add' | 'update';

export const CONTACT_LABELS: Record<ContactType, string> = {
  add: '분석기업 추가',
  update: '업데이트 요청',
};

export const CONTACT_PLACEHOLDERS: Record<ContactType, string> = {
  add: '추가됐으면 하는 기업명(티커)과 이유를 적어주세요. 예: "팔란티어(PLTR) 분석도 보고 싶어요"',
  update: '어떤 기업의 어떤 정보가 오래됐는지 적어주세요. 예: "테슬라 재무지표가 최신이 아닌 것 같아요"',
};

export async function submitContact(payload: {
  type: ContactType;
  message: string;
  email?: string;
}): Promise<{ error: string | null }> {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return { error: body?.error ?? '전송에 실패했어요. 잠시 후 다시 시도해주세요.' };
    }

    return { error: null };
  } catch {
    return { error: '네트워크 오류로 전송하지 못했어요.' };
  }
}
