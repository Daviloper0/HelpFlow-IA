import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import styles from './Field.module.css';

interface FieldProps {
  label: string;
  /** id do campo dentro, para ligar o rótulo a ele. */
  htmlFor: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

/** Rótulo + campo + dica + mensagem de erro. */
export function Field({ label, htmlFor, error, hint, className, children }: FieldProps) {
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
      </label>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Usa fonte monoespaçada (rotas e códigos). */
  mono?: boolean;
  invalid?: boolean;
}

export function TextInput({ mono, invalid, className, ...rest }: TextInputProps) {
  return (
    <input
      type="text"
      aria-invalid={invalid || undefined}
      className={cx(styles.input, mono && styles.mono, className)}
      {...rest}
    />
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Usa fonte monoespaçada e fundo cinza, próprio para JSON. */
  code?: boolean;
  invalid?: boolean;
}

export function TextArea({ code, invalid, className, ...rest }: TextAreaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cx(styles.textarea, code && styles.code, className)}
      {...rest}
    />
  );
}
