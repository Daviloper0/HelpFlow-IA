import { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import type { SuiteRun, SuiteRunExecution } from '../../types';
import styles from './AvgDurationModal.module.css';

type TimeFilter = '1h' | '24h' | '7d' | '30d';

const FILTER_LABELS: Record<TimeFilter, string> = {
  '1h':  'Última hora',
  '24h': 'Últimas 24h',
  '7d':  'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
};

const FILTER_MS: Record<TimeFilter, number> = {
  '1h':  1 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d':  7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

const BUCKET_MS = 50;

interface Bucket { label: string; count: number; index: number; }

function buildBuckets(executions: SuiteRunExecution[]): Bucket[] {
  if (executions.length === 0) return [];
  const max = Math.max(...executions.map((e) => e.durationMs));
  const bucketCount = Math.ceil((max + 1) / BUCKET_MS);
  const counts = new Array<number>(bucketCount).fill(0);
  for (const e of executions) {
    counts[Math.floor(e.durationMs / BUCKET_MS)]++;
  }
  return counts.map((count, i) => ({
    label: `${i * BUCKET_MS}–${(i + 1) * BUCKET_MS - 1}ms`,
    count,
    index: i,
  }));
}

function getTestsInBucket(executions: SuiteRunExecution[], bucketIndex: number): SuiteRunExecution[] {
  return executions.filter(
    (e) => Math.floor(e.durationMs / BUCKET_MS) === bucketIndex,
  );
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function fmtMs(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

interface Props {
  runs: SuiteRun[];
  onClose: () => void;
}

export function AvgDurationModal({ runs, onClose }: Props) {
  const [filter, setFilter] = useState<TimeFilter>('7d');
  const [executions, setExecutions] = useState<SuiteRunExecution[] | null>(null);
  const [loadingExec, setLoadingExec] = useState(true);
  const [selectedBucket, setSelectedBucket] = useState<number | null>(null);

  const visibleRuns = runs.filter((r) => !r.hidden);
  const lastRun = visibleRuns[0] ?? null;

  useEffect(() => {
    if (!lastRun) { setLoadingExec(false); return; }
    setLoadingExec(true);
    api.getSuiteRunExecutions(lastRun.id).then((data) => {
      setExecutions(data);
      setLoadingExec(false);
    });
  }, [lastRun?.id]);

  // Bar chart data — last suite run, 50ms buckets
  const buckets = executions ? buildBuckets(executions) : [];

  // Line chart data — avg duration per suite run, filtered by time window
  const now = Date.now();
  const cutoff = now - FILTER_MS[filter];
  const lineData = visibleRuns
    .filter((r) => r.ranAt >= cutoff)
    .slice()
    .reverse()
    .map((r) => ({ ranAt: r.ranAt, avg: r.avgResponseMs }));

  return (
    <Modal title="Duração média" size="xl" onClose={onClose} footer={<span />}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          Distribuição de duração — última execução
        </h3>
        {loadingExec ? (
          <p className={styles.empty}>Carregando…</p>
        ) : buckets.length === 0 ? (
          <p className={styles.empty}>Nenhum dado disponível.</p>
        ) : (
          <>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={buckets}
                  margin={{ top: 8, right: 16, bottom: 48, left: 0 }}
                >
                  <CartesianGrid stroke="#e4e7ec" strokeDasharray="4 4" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#8791a3' }}
                    axisLine={false}
                    tickLine={false}
                    angle={-40}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#8791a3' }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip
                    formatter={(value: number) => [value, 'Testes']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #d9dee6', fontSize: 12 }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    background={{ fill: 'transparent', cursor: 'pointer' }}
                    onClick={(_data: Bucket, index: number) => {
                      setSelectedBucket((prev) => (prev === index ? null : index));
                    }}
                  >
                    {buckets.map((_, index) => (
                      <Cell
                        key={index}
                        fill={index === selectedBucket ? '#1b6fb5' : '#32a0e9'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {selectedBucket !== null && executions && (() => {
              const tests = getTestsInBucket(executions, selectedBucket);
              const bucket = buckets[selectedBucket];
              return (
                <div className={styles.bucketPanel}>
                  <div className={styles.bucketPanelHeader}>
                    <span className={styles.bucketPanelTitle}>
                      {bucket?.label} — {tests.length} {tests.length === 1 ? 'teste' : 'testes'}
                    </span>
                    <button
                      className={styles.bucketPanelClose}
                      onClick={() => setSelectedBucket(null)}
                      aria-label="Fechar"
                    >
                      ✕
                    </button>
                  </div>
                  <ul className={styles.bucketList}>
                    {tests.map((t) => (
                      <li key={t.testId} className={styles.bucketItem}>
                        <span className={t.passed ? styles.dotPass : styles.dotFail} />
                        <span className={styles.bucketName}>{t.name}</span>
                        <span className={styles.bucketDuration}>{fmtMs(t.durationMs)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
          </>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Duração média ao longo do tempo</h3>
          <div className={styles.filters}>
            {(Object.keys(FILTER_LABELS) as TimeFilter[]).map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
        {lineData.length === 0 ? (
          <p className={styles.empty}>Nenhuma execução visível nesse período.</p>
        ) : (
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="#e4e7ec" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="ranAt"
                  tickFormatter={fmtDate}
                  tick={{ fontSize: 11, fill: '#8791a3' }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={40}
                />
                <YAxis
                  tickFormatter={fmtMs}
                  tick={{ fontSize: 11, fill: '#8791a3' }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip
                  formatter={(value: number) => [fmtMs(value), 'Duração média']}
                  labelFormatter={(label: number) =>
                    new Date(label).toLocaleString('pt-BR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })
                  }
                  contentStyle={{ borderRadius: 8, border: '1px solid #d9dee6', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#32a0e9"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#32a0e9', strokeWidth: 1.5, stroke: '#fff' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </Modal>
  );
}
