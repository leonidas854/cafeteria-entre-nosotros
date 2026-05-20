'use client';
import React, { useMemo } from 'react';
import styles from '@/src/features/auth/styles/auth-shared.module.css';

interface PasswordStrengthBarProps {
  password: string;
}

/**
 * Barra visual de fortaleza de contraseña.
 */
export default function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const { score, label, color } = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '#d1d5db' };

    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;

    const levels: Record<number, { label: string; color: string }> = {
      0: { label: 'Muy débil', color: '#ef4444' },
      1: { label: 'Débil', color: '#f97316' },
      2: { label: 'Regular', color: '#eab308' },
      3: { label: 'Buena', color: '#84cc16' },
      4: { label: 'Fuerte', color: '#22c55e' },
      5: { label: 'Muy fuerte', color: '#16a34a' },
    };

    return { score: s, ...levels[s] };
  }, [password]);

  if (!password) return null;

  return (
    <div className={styles.strengthContainer}>
      <div className={styles.strengthBarTrack}>
        <div
          className={styles.strengthBarFill}
          style={{
            width: `${(score / 5) * 100}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className={styles.strengthLabel} style={{ color }}>
        {label}
      </span>
    </div>
  );
}
