import { Button } from '../../components/ui/Button';
import { Modal, ModalSection } from '../../components/ui/Modal';
import type { SuiteRun } from '../../types';
import styles from './SuiteRunDetailModal.module.css';

function fmt(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function passRate(run: SuiteRun): number {
  return run.total === 0 ? 0 : Math.round((run.passed / run.total) * 100);
}

function isServerOfflineWarning(run: SuiteRun): boolean {
  return run.failed === run.total && run.total > 0;
}

interface Stat {
  label: string;
  value: string;
  tone?: 'pass' | 'fail' | 'recover' | 'neutral';
}

function StatRow({ label, value, tone = 'neutral' }: Stat) {
  return (
    <div className={styles.statRow}>
      <span className={styles.statLabel}>{label}</span>
      <span className={`${styles.statValue} ${styles[tone]}`}>{value}</span>
    </div>
  );
}

interface Props {
  run: SuiteRun;
  prev: SuiteRun | undefined;
  onClose: () => void;
}

export function SuiteRunDetailModal({ run, prev, onClose }: Props) {
  const offline = isServerOfflineWarning(run);
  const rate = passRate(run);

  return (
    <Modal
      title={fmtDate(run.ranAt)}
      size="md"
      onClose={onClose}
      footer={<Button onClick={onClose}>Fechar</Button>}
    >
      {offline && (
        <div className={styles.offlineBanner}>
          ⚠ Todos os testes falharam nesta execução. O servidor HelpFlow pode estar offline.
        </div>
      )}

      <ModalSection title="Resumo">
        <StatRow label="Total de testes" value={String(run.total)} />
        <StatRow label="Aprovados" value={String(run.passed)} tone={run.passed > 0 ? 'pass' : 'neutral'} />
        <StatRow label="Falhas" value={String(run.failed)} tone={run.failed > 0 ? 'fail' : 'neutral'} />
        <StatRow label="Taxa de aprovação" value={`${rate}%`} tone={rate === 100 ? 'pass' : rate === 0 ? 'fail' : 'neutral'} />
      </ModalSection>

      <ModalSection title="Desempenho">
        <StatRow label="Duração total" value={fmt(run.durationMs)} />
        <StatRow label="Tempo médio de resposta" value={fmt(run.avgResponseMs)} />
        {run.fastest && (
          <StatRow
            label="Teste mais rápido"
            value={`${run.fastest.name} (${fmt(run.fastest.durationMs)})`}
            tone="pass"
          />
        )}
        {run.slowest && (
          <StatRow
            label="Teste mais lento"
            value={`${run.slowest.name} (${fmt(run.slowest.durationMs)})`}
          />
        )}
      </ModalSection>

      <ModalSection title="Comparação com execução anterior">
        {!prev ? (
          <p className={styles.noPrev}>Esta é a primeira execução registrada.</p>
        ) : (
          <>
            <StatRow
              label="Regressões"
              value={run.regressions > 0 ? `−${run.regressions} teste(s) que passavam agora falham` : 'Nenhuma'}
              tone={run.regressions > 0 ? 'fail' : 'neutral'}
            />
            <StatRow
              label="Recuperações"
              value={run.recoveries > 0 ? `+${run.recoveries} teste(s) que falhavam agora passam` : 'Nenhuma'}
              tone={run.recoveries > 0 ? 'recover' : 'neutral'}
            />
            <StatRow
              label="Novas falhas"
              value={run.newFailures > 0 ? String(run.newFailures) : 'Nenhuma'}
              tone={run.newFailures > 0 ? 'fail' : 'neutral'}
            />
          </>
        )}
      </ModalSection>
    </Modal>
  );
}
