import { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../context/AuthContext';
import styles from './ProfileCard.module.css';

export default function ProfileCard() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || !profile) return null;

  const startEdit = () => {
    setName(profile.name);
    setError(null);
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await updateProfile({ name });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
  };

  return (
    <Card>
      <div className={styles.card}>
        <div className={styles.avatar}>{profile.name?.[0] || profile.email[0].toUpperCase()}</div>

        {editing ? (
          <form className={styles.editForm} onSubmit={handleSave}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" />
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.editActions}>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(false)}>
                취소
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className={styles.info}>
              <div className={styles.name}>{profile.name || '이름 미설정'}</div>
              <div className={styles.email}>{profile.email}</div>
              <div className={styles.joined}>
                {new Date(profile.created_at).toISOString().slice(0, 10)} 가입
              </div>
            </div>
            <div className={styles.actions}>
              <Button variant="secondary" size="sm" onClick={startEdit}>
                프로필 수정
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                로그아웃
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
