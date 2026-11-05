import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

/** Caixa tracejada para listas vazias. */
export function EmptyState({ children }: { children: ReactNode }) {
  return <div className={styles.box}>{children}</div>;
}
