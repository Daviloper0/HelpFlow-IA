import { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import type { PassingTestStat } from '../../types';
import styles from './PassingTestsModal.module.css';

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

interface Props {
  onClose: () => void;
}

export function PassingTestsModal({ onClose }: Props) {
  const [data, setData] = useState<PassingTestStat[] | null>(null);

  useEffect(() => {
    api.getPassingTestsStats().then(setData);
  }, []);

  return (
    <Modal title="Testes aprovados" size="xl" onClose={onClose} footer={<span />}>
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
                <th className={styles.th}>Sequência</th>
                <th className={styles.th}>Taxa de aprovação</th>
                <th className={styles.th}>Última falha</th>
                <th className={styles.th}>Recuperado em</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.testId} className={styles.row}>
                  <td className={styles.tdName}>{s.name}</td>
                  <td className={styles.td}>
                    <span className={styles.streak}>{s.streak}</span>
                    <span className={styles.streakSub}> runs</span>
                  </td>
                  <td className={styles.td}>
                    <span className={passRateClass(s.passRate, styles)}>{s.passRate}%</span>
                    <span className={styles.sub}> / {s.totalRuns}</span>
                  </td>
                  <td className={styles.td}>
                    {s.lastFailedAt ? (
                      <span className={styles.failDate}>{fmtDate(s.lastFailedAt)}</span>
                    ) : (
                      <span className={styles.never}>Nunca</span>
                    )}
                  </td>
                  <td className={styles.td}>
                    {s.firstPassedAfterLastFail ? (
                      fmtDate(s.firstPassedAfterLastFail)
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

function passRateClass(rate: number, styles: Record<string, string>): string {
  if (rate > 50) return styles.rateHigh;
  if (rate === 50) return styles.rateMid;
  return styles.rateLow;
}
