import type { HTMLAttributes } from 'react';
import styles from './Badge.module.css';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'primary' | 'positive' | 'negative';
}

export default function Badge({ tone = 'default', className = '', children, ...rest }: BadgeProps) {
  const toneClass = tone !== 'default' ? styles[tone] : '';
  return (
    <span className={[styles.badge, toneClass, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </span>
  );
}
