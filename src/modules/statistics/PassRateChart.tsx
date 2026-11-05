import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PassRatePoint } from '../../types';
import styles from './PassRateChart.module.css';

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

interface Props {
  points: PassRatePoint[];
}

export function PassRateChart({ points }: Props) {
  if (points.length === 0) {
    return <p className={styles.empty}>Nenhuma execução visível para exibir o gráfico.</p>;
  }

  const data = points.map((p) => ({ ranAt: p.ranAt, rate: p.rate }));

  return (
    <div className={styles.wrap}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
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
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: '#8791a3' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Taxa de aprovação']}
            labelFormatter={(label: number) =>
              new Date(label).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })
            }
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #d9dee6',
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#32a0e9"
            strokeWidth={2}
            dot={{ r: 3, fill: '#32a0e9', strokeWidth: 1.5, stroke: '#fff' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
