import { useEffect, useId, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { IconButton } from './Button';
import { CloseIcon } from './icons';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  /** Elemento mostrado antes do título (ex.: selo do método HTTP). */
  badge?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  onClose: () => void;
  children: ReactNode;
  /** Botões do rodapé. */
  footer: ReactNode;
}

/** Janela sobreposta. Fecha com o botão X, com os botões do rodapé ou com a tecla Esc. */
export function Modal({ title, badge, size = 'lg', onClose, children, footer }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className={cx(styles.dialog, styles[size])}>
        <header className={styles.header}>
          <div className={styles.titleRow}>
            {badge}
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
          </div>
          <IconButton tone="ghost" aria-label="Fechar janela" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </header>
        <div className={styles.body}>{children}</div>
        <footer className={styles.footer}>{footer}</footer>
      </div>
    </div>
  );
}

/** Título pequeno de uma seção dentro da janela. */
export function ModalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
    </section>
  );
}
