import { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import type { FailingTestStat } from '../../types';
import styles from './PassingTestsModal.module.css';

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function failRateClass(rate: number, s: Record<string, string>): string {
  if (rate > 50) return s.rateLow;
  if (rate === 50) return s.rateMid;
  return s.rateHigh;
}

interface Props {
  onClose: () => void;
}

export function FailingTestsModal({ onClose }: Props) {
  const [data, setData] = useState<FailingTestStat[] | null>(null);

  useEffect(() => {
    api.getFailingTestsStats().then(setData);
  }, []);

  return (
    <Modal title="Testes com falha" size="xl" onClose={onClose} footer={<span />}>
      {data === null ? (
        <p className={styles.empty}>Carregando…</p>
      ) : data.length === 0 ? (
        <p className={styles.empty}>Nenhum teste encontrado.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thName}>Teste</th>
                <th className={styles.th}>Sequência de falhas</th>
                <th className={styles.th}>Taxa de falha</th>
                <th className={styles.th}>Último aprovado</th>
                <th className={styles.th}>Falha desde</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.testId} className={styles.row}>
                  <td className={styles.tdName}>{s.name}</td>
                  <td className={styles.td}>
                    <span className={styles.failStreak}>{s.streak}</span>
                    <span className={styles.streakSub}> runs</span>
                  </td>
                  <td className={styles.td}>
                    <span className={failRateClass(s.failRate, styles)}>{s.failRate}%</span>
                    <span className={styles.sub}> / {s.totalRuns}</span>
                  </td>
                  <td className={styles.td}>
                    {s.lastPassedAt ? (
                      fmtDate(s.lastPassedAt)
                    ) : (
                      <span className={styles.never}>Nunca</span>
                    )}
                  </td>
                  <td className={styles.td}>
                    {s.streakStartedAt ? (
                      fmtDate(s.streakStartedAt)
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
