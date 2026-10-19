import { InfoIcon } from '../../components/ui/icons';
import type { Summary } from '../../utils/summary';
import { cx } from '../../utils/cx';
import styles from './SummaryBanner.module.css';

/** Mensagem com o resumo do sistema. A cor acompanha a gravidade. */
export function SummaryBanner({ summary }: { summary: Summary }) {
  return (
    <div role="status" className={cx(styles.banner, styles[summary.tone])}>
      <span className={styles.icon}>
        <InfoIcon />
      </span>
      <div className={styles.content}>
        <h2 className={styles.label}>Resumo do sistema</h2>
        <p className={styles.text}>{summary.text}</p>
      </div>
    </div>
  );
}
