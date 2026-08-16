import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Icon from '../common/Icon';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      setSubmitting(false);
      if (error) {
        setError(error);
        return;
      }
      onClose();
      return;
    }

    const { error, hasSession } = await signUp(email, password, name);
    setSubmitting(false);

    if (error) {
      setError(error);
      return;
    }

    if (!hasSession) {
      setNotice('가입 확인 이메일을 보냈어요. 메일함을 확인해주세요.');
      return;
    }

    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h2 className={styles.title}>{mode === 'signin' ? '로그인' : '회원가입'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="auth-name">
                이름
              </label>
              <Input
                id="auth-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="닉네임"
                required
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="auth-email">
              이메일
            </label>
            <Input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="auth-password">
              비밀번호
            </label>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              minLength={6}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {notice && <p className={styles.notice}>{notice}</p>}

          <Button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? '처리 중...' : mode === 'signin' ? '로그인' : '가입하기'}
          </Button>
        </form>

        <div className={styles.switchRow}>
          {mode === 'signin' ? (
            <>
              계정이 없으신가요?
              <button className={styles.switchBtn} onClick={() => setMode('signup')}>
                회원가입
              </button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?
              <button className={styles.switchBtn} onClick={() => setMode('signin')}>
                로그인
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
