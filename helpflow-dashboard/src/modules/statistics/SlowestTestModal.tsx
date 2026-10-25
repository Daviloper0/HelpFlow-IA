import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import type { TestDurationPoint } from '../../types';
import styles from './SlowestTestModal.module.css';

type TimeFilter = '1h' | '24h' | '7d' | '30d' | 'all';

const FILTER_LABELS: Record<TimeFilter, string> = {
  '1h':  'Última hora',
  '24h': 'Últimas 24h',
  '7d':  'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  'all': 'Tudo',
};

const FILTER_MS: Record<Exclude<TimeFilter, 'all'>, number> = {
  '1h':  1 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d':  7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

function fmtMs(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

interface Props {
  testId: number;
  testName: string;
  onClose: () => void;
}

export function SlowestTestModal({ testId, testName, onClose }: Props) {
  const [filter, setFilter] = useState<TimeFilter>('all');
  const [history, setHistory] = useState<TestDurationPoint[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getTestDurationHistory(testId).then((data) => {
      setHistory(data);
      setLoading(false);
    });
  }, [testId]);

  const now = Date.now();
  const filtered = history
    ? filter === 'all'
      ? history
      : history.filter((p) => p.ranAt >= now - FILTER_MS[filter])
    : [];

  return (
    <Modal title={testName} size="xl" onClose={onClose} footer={<span />}>
      <div className={styles.filterRow}>
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

      {loading ? (
        <p className={styles.empty}>Carregando…</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>Nenhum dado nesse período.</p>
      ) : (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filtered} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
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
                formatter={(value: number) => [fmtMs(value), 'Duração']}
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
                dataKey="durationMs"
                stroke="#32a0e9"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      key={`dot-${payload.ranAt}`}
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill={payload.passed ? '#1f9254' : '#e53935'}
                      stroke="#fff"
                      strokeWidth={1.5}
                    />
                  );
                }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className={styles.hint}>
        Pontos verdes = passou · Pontos vermelhos = falhou
      </p>
    </Modal>
  );
}
