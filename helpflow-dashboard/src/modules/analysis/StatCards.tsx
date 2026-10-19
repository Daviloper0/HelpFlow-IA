import type { StatusCounts } from '../../types';
import { absoluteTime, relativeTime } from '../../utils/time';
import styles from './StatCards.module.css';

interface StatCardProps {
  label: string;
  dotColor: string;
  value: string | number;
  note: string;
}

function StatCard({ label, dotColor, value, note }: StatCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>
        <span className={styles.dot} style={{ backgroundColor: dotColor }} />
        {label}
      </span>
      <span className={styles.value}>{value}</span>
      <span className={styles.note}>{note}</span>
    </div>
  );
}

function pendingNote(counts: StatusCounts): string {
  if (counts.total === 0) return 'Nenhum teste ainda';
  if (counts.idle === 0) return 'Todos já foram executados';
  return `${counts.idle} ${counts.idle === 1 ? 'ainda não executado' : 'ainda não executados'}`;
}

function failNote(count: number): string {
  if (count === 0) return 'Nenhuma falha';
  return count === 1 ? 'falha para investigar' : 'falhas para investigar';
}

interface StatCardsProps {
  counts: StatusCounts;
  lastRunAt: number | null;
}

/** Os quatro indicadores: cadastrados, última execução, aprovados e reprovados. */
export function StatCards({ counts, lastRunAt }: StatCardsProps) {
  const passPercent = counts.total ? Math.round((counts.pass / counts.total) * 100) : 0;

  return (
    <section aria-label="Indicadores" className={styles.grid}>
      <StatCard label="Testes cadastrados" dotColor="#121722" value={counts.total} note={pendingNote(counts)} />
      <StatCard
        label="Última execução"
        dotColor="#2347C5"
        value={lastRunAt ? relativeTime(lastRunAt) : 'Nunca'}
        note={lastRunAt ? absoluteTime(lastRunAt) : 'Nenhuma execução registrada'}
      />
      <StatCard
        label="Aprovados"
        dotColor="#1F9254"
        value={counts.pass}
        note={counts.total ? `${passPercent}% do total` : '—'}
      />
      <StatCard label="Reprovados" dotColor="#D23B2E" value={counts.fail} note={failNote(counts.fail)} />
    </section>
  );
}
