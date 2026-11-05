import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import type { SuiteRun } from '../../types';
import { cx } from '../../utils/cx';
import { SuiteRunDetailModal } from './SuiteRunDetailModal';
import styles from './SuiteRunsModal.module.css';

const PAGE_SIZE = 10;

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

interface Props {
  runs: SuiteRun[];
  onClose: () => void;
}

export function SuiteRunsModal({ runs, onClose }: Props) {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<SuiteRun | null>(null);

  const visibleRuns = runs.filter((r) => !r.hidden);
  const pageCount = Math.max(1, Math.ceil(visibleRuns.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRuns = visibleRuns.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  if (selected) {
    return (
      <SuiteRunDetailModal
        run={selected}
        prev={visibleRuns[visibleRuns.findIndex((r) => r.id === selected.id) + 1]}
        onClose={() => setSelected(null)}
      />
    );
  }

  return (
    <Modal
      title="Execuções"
      size="xl"
      onClose={onClose}
      footer={
        pageCount > 1 ? (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={currentPage === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Anterior
            </button>
            <span className={styles.pageInfo}>{currentPage + 1} / {pageCount}</span>
            <button
              className={styles.pageBtn}
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima →
            </button>
          </div>
        ) : <span />
      }
    >
      {visibleRuns.length === 0 ? (
        <p className={styles.empty}>Nenhuma execução visível registrada.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th className={styles.numCol}>Total</th>
                <th className={styles.numCol}>Aprovados</th>
                <th className={styles.numCol}>Falhas</th>
                <th className={styles.numCol}>Regressões</th>
                <th className={styles.numCol}>Recuperações</th>
                <th className={styles.numCol}>Novas falhas</th>
              </tr>
            </thead>
            <tbody>
              {pageRuns.map((run, idx) => (
                <tr
                  key={run.id}
                  className={cx(styles.row, styles.clickableRow, idx % 2 === 0 ? styles.even : styles.odd)}
                  onClick={() => setSelected(run)}
                >
                  <td className={styles.dateCell}>{fmtDate(run.ranAt)}</td>
                  <td className={styles.num}>{run.total}</td>
                  <td className={cx(styles.num, run.passed > 0 ? styles.pass : undefined)}>{run.passed}</td>
                  <td className={cx(styles.num, run.failed > 0 ? styles.fail : undefined)}>{run.failed}</td>
                  <td className={styles.num}>{run.regressions}</td>
                  <td className={styles.num}>{run.recoveries}</td>
                  <td className={cx(styles.num, run.newFailures > 0 ? styles.fail : undefined)}>{run.newFailures}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
