import { useState } from 'react';
import { MethodBadge } from '../../components/ui/Badges';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { CheckCircleIcon, ChevronDownIcon, ChevronRightIcon } from '../../components/ui/icons';
import type { StatusCounts, TestView } from '../../types';
import styles from './FailedTests.module.css';

function buildFailuresSummary(tests: TestView[]): string {
  return tests
    .map((t, i) => {
      const lines = [
        `[${i + 1}] ${t.method} ${t.route}`,
        `Requisição: ${t.requestBody || '(sem corpo)'}`,
        `Resposta esperada: status ${t.expectedStatus}${t.expectedBody ? `, ${t.expectedBody}` : ''}`,
        `Resposta recebida: status ${t.lastRun?.actualStatus ?? '?'}${t.lastRun?.actualBody ? `, ${t.lastRun.actualBody}` : ''}`,
      ];
      return lines.join('\n');
    })
    .join('\n\n');
}

interface FailedTestsProps {
  failedTests: TestView[];
  counts: StatusCounts;
  onSelect: (id: number) => void;
}

function emptyMessage(counts: StatusCounts): string {
  if (counts.total === 0) return 'Nenhum teste cadastrado.';
  if (counts.pass + counts.fail === 0) return 'Nenhum teste foi executado ainda.';
  return 'Nenhum teste falhou na última execução.';
}

/** Lista dos testes que falharam. Clicar numa linha abre os detalhes. */
export function FailedTests({ failedTests, counts, onSelect }: FailedTestsProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  function handleCopyAll() {
    navigator.clipboard.writeText(buildFailuresSummary(failedTests)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section aria-labelledby="failed-tests-title" className={styles.section}>
      <div className={styles.header}>
        <h2 id="failed-tests-title" className={styles.title}>
          Testes que falharam na última execução
        </h2>
        {failedTests.length > 0 && (
          <div className={styles.actions}>
            <Button onClick={handleCopyAll}>{copied ? 'Copiado!' : 'Copiar falhas'}</Button>
            <Button onClick={() => setOpen((v) => !v)} icon={open ? <ChevronDownIcon /> : <ChevronRightIcon />}>
              {open ? 'Ocultar' : `Ver ${failedTests.length}`}
            </Button>
          </div>
        )}
      </div>

      {failedTests.length > 0 ? (
        open && (
          <ul className={styles.list}>
            {failedTests.map((test) => (
              <li key={test.id}>
                <button
                  type="button"
                  className={styles.row}
                  aria-label={`Ver detalhes do teste ${test.name}`}
                  onClick={() => onSelect(test.id)}
                >
                  <MethodBadge method={test.method} />
                  <span className={styles.info}>
                    <span className={styles.name}>{test.name}</span>
                    <code className={styles.route}>{test.route}</code>
                  </span>
                  <span className={styles.message}>{test.failureMessage}</span>
                  <ChevronRightIcon />
                </button>
              </li>
            ))}
          </ul>
        )
      ) : (
        <EmptyState>
          <span className={styles.emptyContent}>
            <CheckCircleIcon />
            {emptyMessage(counts)}
          </span>
        </EmptyState>
      )}
    </section>
  );
}
