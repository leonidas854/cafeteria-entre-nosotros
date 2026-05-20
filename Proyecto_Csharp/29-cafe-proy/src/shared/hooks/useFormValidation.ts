'use client';
import { useState, useCallback } from 'react';

export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: { value: RegExp; message: string };
  custom?: (value: string, allValues: Record<string, string>) => string | null;
};

export type ValidationRules = Record<string, ValidationRule>;

/**
 * Hook reutilizable para validación de formularios.
 * Permite validación en blur, en submit, y en tiempo real.
 */
export function useFormValidation<T extends Record<string, string>>(
  initialValues: T,
  rules: ValidationRules
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T | 'form', string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback(
    (name: string, value: string): string | null => {
      const rule = rules[name];
      if (!rule) return null;

      if (rule.required && !value.trim()) {
        return 'Este campo es requerido';
      }
      if (rule.minLength && value.length < rule.minLength) {
        return `Mínimo ${rule.minLength} caracteres`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `Máximo ${rule.maxLength} caracteres`;
      }
      if (rule.pattern && !rule.pattern.value.test(value)) {
        return rule.pattern.message;
      }
      if (rule.custom) {
        return rule.custom(value, values);
      }
      return null;
    },
    [rules, values]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));

      // Limpiar error al escribir
      if (errors[name as keyof T]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name as keyof T];
          return next;
        });
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name, value);
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateField]
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T | 'form', string>> = {};
    let isValid = true;

    for (const [name] of Object.entries(rules)) {
      const error = validateField(name, values[name as keyof T] || '');
      if (error) {
        newErrors[name as keyof T] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    // Marcar todos como touched
    const allTouched: Partial<Record<keyof T, boolean>> = {};
    for (const name of Object.keys(rules)) {
      allTouched[name as keyof T] = true;
    }
    setTouched(allTouched);

    return isValid;
  }, [rules, values, validateField]);

  const setFormError = useCallback((message: string) => {
    setErrors((prev) => ({ ...prev, form: message }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    setFormError,
    setValues,
    setErrors,
    resetForm,
  };
}
