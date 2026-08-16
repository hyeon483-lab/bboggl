import type { InputHTMLAttributes } from 'react';
import Icon, { type IconName } from './Icon';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: IconName;
}

export default function Input({ icon, className = '', ...rest }: InputProps) {
  return (
    <label className={`${styles.wrapper} ${className}`.trim()}>
      {icon && <Icon name={icon} size={18} className={styles.icon} />}
      <input className={styles.input} {...rest} />
    </label>
  );
}
