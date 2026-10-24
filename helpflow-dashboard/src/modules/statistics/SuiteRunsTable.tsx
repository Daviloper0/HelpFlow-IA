import { useState } from 'react';
import type { SuiteRun } from '../../types';
import { cx } from '../../utils/cx';
import { SuiteRunDetailModal } from './SuiteRunDetailModal';
import styles from './SuiteRunsTable.module.css';

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function isServerOfflineWarning(run: SuiteRun): boolean {
  return run.failed === run.total && run.total > 0;
}

interface Props {
  runs: SuiteRun[];
  allRuns: SuiteRun[];
  onToggleHidden: (id: number, hidden: boolean) => void;
}

export function SuiteRunsTable({ runs, allRuns, onToggleHidden }: Props) {
  const [selected, setSelected] = useState<SuiteRun | null>(null);

  return (
    <>
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data / Hora</th>
              <th className={styles.numCol}>Total</th>
              <th className={styles.numCol}>Aprovados</th>
              <th className={styles.numCol}>Falhas</th>
              <th className={styles.actionsCol}>Visibilidade</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run, rowIdx) => {
              const offline = isServerOfflineWarning(run);
              return (
                <tr
                  key={run.id}
                  className={cx(
                    styles.row,
                    styles.clickableRow,
                    rowIdx % 2 === 0 ? styles.even : styles.odd,
                    run.hidden && styles.hiddenRow,
                  )}
                  onClick={() => setSelected(run)}
                >
                  <td className={styles.dateCell}>
                    <span>{fmtDate(run.ranAt)}</span>
                    {offline && (
                      <span
                        className={styles.offlineWarning}
                        data-tip="Todos os testes falharam nesta execução. O servidor HelpFlow pode estar offline."
                      >
                        ⚠
                      </span>
                    )}
                  </td>
                  <td className={styles.num}>{run.total}</td>
                  <td className={cx(styles.num, run.passed > 0 ? styles.passNum : undefined)}>
                    {run.passed}
                  </td>
                  <td className={cx(styles.num, run.failed > 0 ? styles.failNum : undefined)}>
                    {run.failed}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className={styles.hideBtn}
                      onClick={(e) => { e.stopPropagation(); onToggleHidden(run.id, !run.hidden); }}
                      title={run.hidden ? 'Incluir nos gráficos' : 'Excluir dos gráficos'}
                    >
                      {run.hidden ? 'Mostrar' : 'Esconder'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <SuiteRunDetailModal
          run={selected}
          prev={allRuns[allRuns.findIndex((r) => r.id === selected.id) + 1]}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
