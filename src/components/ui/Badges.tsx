import { METHOD_COLORS, STATUS_STYLES, getCategory, statusCodeColors } from '../../constants/http';
import type { HttpMethod, TestCategory, TestStatus } from '../../types';
import { cx } from '../../utils/cx';
import styles from './Badges.module.css';

/** Selo colorido com o método HTTP (GET, POST, ...). */
export function MethodBadge({ method }: { method: HttpMethod }) {
  const colors = METHOD_COLORS[method];
  return (
    <span className={styles.method} style={{ backgroundColor: colors.bg, color: colors.fg }}>
      {method}
    </span>
  );
}

/** Situação do teste: não executado, executando, aprovado ou falhou. */
export function StatusPill({ status }: { status: TestStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={styles.statusPill} style={{ backgroundColor: style.bg, color: style.fg }}>
      <span
        className={cx(styles.dot, status === 'running' && styles.pulse)}
        style={{ backgroundColor: style.dot }}
      />
      {style.label}
    </span>
  );
}

/** Categoria do teste: sucesso, validação ou erro esperado. */
export function CategoryTag({ category }: { category: TestCategory }) {
  const { label, dot } = getCategory(category);
  return (
    <span className={styles.categoryTag}>
      <span className={styles.dot} style={{ backgroundColor: dot }} />
      {label}
    </span>
  );
}

/** Código HTTP de uma resposta documentada, ex.: "201 · Sucesso". */
export function ResponseBadge({ status, label }: { status: number; label: string }) {
  const colors = statusCodeColors(status);
  return (
    <span className={styles.responseBadge} style={{ backgroundColor: colors.bg, color: colors.fg }}>
      {status} · {label}
    </span>
  );
}
