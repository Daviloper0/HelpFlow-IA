import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Ícone mostrado antes do texto. */
  icon?: ReactNode;
}

/** Botão com texto. O hover de cada variante está em Button.module.css. */
export function Button({ variant = 'secondary', icon, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={cx(styles.button, styles[variant], className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'neutral' | 'danger' | 'ghost';
  /** Obrigatório: o botão não tem texto visível. */
  'aria-label': string;
}

/** Botão quadrado só com ícone (editar, excluir, fechar). */
export function IconButton({ tone = 'neutral', className, type = 'button', ...rest }: IconButtonProps) {
  const toneClass = { neutral: styles.toneNeutral, danger: styles.toneDanger, ghost: styles.toneGhost }[tone];
  return <button type={type} className={cx(styles.iconButton, toneClass, className)} {...rest} />;
}
