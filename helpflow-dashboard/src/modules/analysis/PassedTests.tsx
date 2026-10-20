import { useState } from 'react';
import { MethodBadge } from '../../components/ui/Badges';
import { Button } from '../../components/ui/Button';
import { ChevronDownIcon, ChevronRightIcon } from '../../components/ui/icons';
import type { TestView } from '../../types';
import styles from './PassedTests.module.css';

interface PassedTestsProps {
  passedTests: TestView[];
  onSelect: (id: number) => void;
}

/** Lista colapsável dos testes que passaram na última execução. */
export function PassedTests({ passedTests, onSelect }: PassedTestsProps) {
  const [open, setOpen] = useState(false);

  if (passedTests.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Testes que passaram na última execução
        </h2>
        <Button onClick={() => setOpen((v) => !v)} icon={open ? <ChevronDownIcon /> : <ChevronRightIcon />}>
          {open ? 'Ocultar' : `Ver ${passedTests.length}`}
        </Button>
      </div>

      {open && (
        <ul className={styles.list}>
          {passedTests.map((test) => (
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
                <span className={styles.badge}>Passou</span>
                <ChevronRightIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
