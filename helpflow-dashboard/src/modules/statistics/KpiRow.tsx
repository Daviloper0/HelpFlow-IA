import { useState } from 'react';
import type { GlobalStats, SuiteRun } from '../../types';
import { AvgDurationModal } from './AvgDurationModal';
import { FailingTestsModal } from './FailingTestsModal';
import { PassingTestsModal } from './PassingTestsModal';
import { SlowestTestModal } from './SlowestTestModal';
import { SuiteRunsModal } from './SuiteRunsModal';
import styles from './KpiRow.module.css';

function fmt(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'flat' | null }) {
  if (!trend || trend === 'flat') return <span className={styles.trendFlat}>→</span>;
  if (trend === 'up') return <span className={styles.trendUp}>↑</span>;
  return <span className={styles.trendDown}>↓</span>;
}


interface KpiRowProps {
  stats: GlobalStats;
  runs: SuiteRun[];
}

export function KpiRow({ stats, runs }: KpiRowProps) {
  const [showRuns, setShowRuns] = useState(false);
  const [showAvgDuration, setShowAvgDuration] = useState(false);
  const [showSlowest, setShowSlowest] = useState(false);
  const [showPassing, setShowPassing] = useState(false);
  const [showFailing, setShowFailing] = useState(false);

  return (
    <>
      {showRuns && <SuiteRunsModal runs={runs} onClose={() => setShowRuns(false)} />}
      {showAvgDuration && <AvgDurationModal runs={runs} onClose={() => setShowAvgDuration(false)} />}
      {showSlowest && stats.slowestTest && (
        <SlowestTestModal
          testId={stats.slowestTest.testId}
          testName={stats.slowestTest.name}
          onClose={() => setShowSlowest(false)}
        />
      )}
      {showPassing && <PassingTestsModal onClose={() => setShowPassing(false)} />}
      {showFailing && <FailingTestsModal onClose={() => setShowFailing(false)} />}
    <div className={styles.row}>
      <div className={`${styles.card} ${styles.clickable}`} onClick={() => setShowRuns(true)}>
        <span className={styles.label}>Execuções</span>
        <span className={styles.value}>{stats.totalRuns}</span>
        <span className={styles.sub}>suites rodadas</span>
      </div>

      <div className={styles.card}>
        <span className={styles.label}>Testes executados</span>
        <span className={styles.value}>{stats.totalExecutions.toLocaleString('pt-BR')}</span>
        <span className={styles.sub}>no total</span>
      </div>

      <div className={`${styles.card} ${styles.clickable}`} onClick={() => setShowAvgDuration(true)}>
        <span className={styles.label}>Duração média</span>
        <span className={styles.value}>{fmt(stats.avgTestDurationMs)}</span>
        <span className={styles.sub}>por teste</span>
      </div>

      <div
        className={`${styles.card} ${stats.slowestTest ? styles.clickable : ''}`}
        onClick={stats.slowestTest ? () => setShowSlowest(true) : undefined}
      >
        <span className={styles.label}>Teste mais lento da última execução</span>
        {stats.slowestTest ? (
          <>
            <span className={styles.value}>{fmt(stats.slowestTest.durationMs)}</span>
            <span className={styles.slowestName}>{stats.slowestTest.name}</span>
          </>
        ) : (
          <span className={styles.value}>—</span>
        )}
      </div>

      <div className={`${styles.card} ${styles.clickable}`} onClick={() => setShowPassing(true)}>
        <span className={styles.label}>Aprovados</span>
        <span className={`${styles.value} ${styles.passValue}`}>{stats.allTimePassed.toLocaleString('pt-BR')}</span>
        <span className={styles.sub}>no total</span>
      </div>

      <div className={`${styles.card} ${styles.clickable}`} onClick={() => setShowFailing(true)}>
        <span className={styles.label}>Falhas</span>
        <span className={`${styles.value} ${styles.failValue}`}>{stats.allTimeFailed.toLocaleString('pt-BR')}</span>
        <span className={styles.sub}>no total</span>
      </div>

      <div className={styles.card}>
        <span className={styles.label}>Tendência</span>
        <span className={styles.value}>
          <TrendArrow trend={stats.trend} />
        </span>
        <span className={styles.sub}>
          {stats.lastRunRate !== null ? `${stats.lastRunRate}% última suite` : 'sem dados'}
        </span>
      </div>
    </div>
    </>
  );
}
