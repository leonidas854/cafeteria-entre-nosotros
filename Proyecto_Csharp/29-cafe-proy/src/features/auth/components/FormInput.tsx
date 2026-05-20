'use client';
import React from 'react';
import styles from '@/src/features/auth/styles/auth-shared.module.css';

interface FormInputProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Input reutilizable para formularios de autenticación.
 * Maneja label, error, helper text e icono integrado.
 */
export default function FormInput({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  error,
  helperText,
  required = false,
  onChange,
  onBlur,
  icon,
  children,
}: FormInputProps) {
  return (
    <div className={styles.inputGroup}>
      <label htmlFor={id} className={styles.label}>
        {label} {required && <span className={styles.requiredMark}>*</span>}
      </label>
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          className={`${styles.input} ${icon ? styles.inputWithIcon : ''} ${error ? styles.inputError : ''}`}
          autoComplete={type === 'password' ? 'current-password' : 'off'}
        />
      </div>
      {error && (
        <p className={styles.errorText}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && <p className={styles.helperText}>{helperText}</p>}
      {children}
    </div>
  );
}
