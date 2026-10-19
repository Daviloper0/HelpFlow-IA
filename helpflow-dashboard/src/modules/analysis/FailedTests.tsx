import { MethodBadge } from '../../components/ui/Badges';
import { EmptyState } from '../../components/ui/EmptyState';
import { CheckCircleIcon, ChevronRightIcon } from '../../components/ui/icons';
import type { StatusCounts, TestView } from '../../types';
import styles from './FailedTests.module.css';

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
  return (
    <section aria-labelledby="failed-tests-title" className={styles.section}>
      <h2 id="failed-tests-title" className={styles.title}>
        Testes que falharam na última execução
      </h2>

      {failedTests.length > 0 ? (
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
