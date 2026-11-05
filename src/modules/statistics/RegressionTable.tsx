import type { RegressionEntry } from '../../types';
import styles from './RegressionTable.module.css';

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface Props {
  entries: RegressionEntry[];
}

export function RegressionTable({ entries }: Props) {
  if (entries.length === 0) {
    return <p className={styles.empty}>Nenhuma falha registrada nas execuções visíveis.</p>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Teste</th>
            <th className={styles.numCol}>Falhas</th>
            <th>Última falha</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={entry.testId} className={i % 2 === 0 ? styles.even : styles.odd}>
              <td className={styles.rank}>{i + 1}</td>
              <td className={styles.name} title={entry.name}>{entry.name}</td>
              <td className={styles.failures}>{entry.failures}</td>
              <td className={styles.date}>{fmtDate(entry.lastFailedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
