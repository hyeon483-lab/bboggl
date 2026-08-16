import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Icon from '../common/Icon';
import { useAuth } from '../../context/AuthContext';
import { CONTACT_LABELS, CONTACT_PLACEHOLDERS, submitContact, type ContactType } from '../../lib/contact';
import styles from './ContactModal.module.css';

interface ContactModalProps {
  type: ContactType;
  onClose: () => void;
}

export default function ContactModal({ type, onClose }: ContactModalProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);
    const result = await submitContact({ type, message: message.trim(), email: email.trim() || undefined });
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSent(true);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h2 className={styles.title}>{CONTACT_LABELS[type]}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            <Icon name="x" size={20} />
          </button>
        </div>

        {sent ? (
          <>
            <p className={styles.success}>
              감사해요! 남겨주신 내용을 확인하고 반영할게요.
            </p>
            <Button className={styles.submit} onClick={onClose}>
              닫기
            </Button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="contact-message">
                내용
              </label>
              <textarea
                id="contact-message"
                className={styles.textarea}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={CONTACT_PLACEHOLDERS[type]}
                maxLength={2000}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="contact-email">
                회신 받을 이메일 (선택)
              </label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <Button type="submit" className={styles.submit} disabled={submitting}>
              {submitting ? '전송 중...' : '제출하기'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
