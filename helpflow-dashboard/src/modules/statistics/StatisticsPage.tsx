import { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import type { GlobalStats, SuiteRun } from '../../types';
import { KpiRow } from './KpiRow';
import { PassRateChart } from './PassRateChart';
import { RegressionTable } from './RegressionTable';
import { SuiteRunsTable } from './SuiteRunsTable';
import styles from './StatisticsPage.module.css';

const PAGE_SIZE = 5;

interface StatisticsPageProps {
  runs: SuiteRun[];
  stats: GlobalStats | null;
  loading: boolean;
  onToggleHidden: (id: number, hidden: boolean) => void;
}

export function StatisticsPage({ runs, stats, loading, onToggleHidden }: StatisticsPageProps) {
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(runs.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRuns = runs.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Estatísticas"
        description="Histórico e métricas das execuções do conjunto de testes."
      />

      {loading || !stats ? (
        <p className={styles.empty}>Carregando…</p>
      ) : (
        <>
          <KpiRow stats={stats} runs={runs} />

          <div className={styles.midRow}>
            <div className={styles.chartSection}>
              <h2 className={styles.sectionTitle}>Taxa de aprovação</h2>
              <div className={styles.chartInner}>
                <PassRateChart points={stats.passRateOverTime} />
              </div>
            </div>

            <div className={styles.historySection}>
              <h2 className={styles.sectionTitle}>Histórico</h2>
              <div className={styles.tableContainer}>
                <SuiteRunsTable runs={pageRuns} allRuns={runs} onToggleHidden={onToggleHidden} />
              </div>
              {pageCount > 1 && (
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
              )}
            </div>
          </div>

          <div className={styles.bottomSection}>
            <h2 className={styles.sectionTitle}>Testes mais problemáticos</h2>
            <div className={styles.regressionWrap}>
              <RegressionTable entries={stats.topRegressions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
