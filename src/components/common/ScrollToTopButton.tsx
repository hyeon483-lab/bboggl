import { useEffect, useState } from 'react';
import Icon from './Icon';
import styles from './ScrollToTopButton.module.css';

const SHOW_AFTER_PX = 480;

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`${styles.button} ${visible ? styles.visible : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="맨 위로 가기"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <Icon name="chevron-up" size={22} />
    </button>
  );
}
