import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import type { OpenApiStatus, TestView } from '../../types';
import { buildSummary } from '../../utils/summary';
import { countStatuses, getLastRunAt } from '../../utils/testStatus';
import { FailedTests } from './FailedTests';
import { FailureDetailModal } from './FailureDetailModal';
import { PassedTests } from './PassedTests';
import { OpenApiCard } from './OpenApiCard';
import { StatCards } from './StatCards';
import { SummaryBanner } from './SummaryBanner';
import styles from './AnalysisPage.module.css';

interface AnalysisPageProps {
  tests: TestView[];
  /** Null enquanto a situação do arquivo OpenAPI carrega. */
  openApi: OpenApiStatus | null;
  /** Leva o desenvolvedor ao teste no módulo de Testes de API. */
  onGoToTest: (id: number) => void;
}

/** Módulo "Análise": visão geral dos testes e da documentação. */
export function AnalysisPage({ tests, openApi, onGoToTest }: AnalysisPageProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const counts = useMemo(() => countStatuses(tests), [tests]);
  const summary = useMemo(() => buildSummary(counts, openApi), [counts, openApi]);
  const lastRunAt = getLastRunAt(tests);

  const failedTests = tests.filter((test) => test.status === 'fail');
  const passedTests = tests.filter((test) => test.status === 'pass');
  const selectedTest = tests.find((test) => test.id === selectedId);

  return (
    <div className={styles.page}>
      <PageHeader title="Análise" description="Visão geral dos testes de API e da documentação do HelpFlow." />

      <SummaryBanner summary={summary} />
      <StatCards counts={counts} lastRunAt={lastRunAt} />
      <FailedTests failedTests={failedTests} counts={counts} onSelect={setSelectedId} />
      <PassedTests passedTests={passedTests} onSelect={setSelectedId} />
      <OpenApiCard status={openApi} />

      {selectedTest && (
        <FailureDetailModal
          test={selectedTest}
          onClose={() => setSelectedId(null)}
          onGoToTest={() => onGoToTest(selectedTest.id)}
        />
      )}
    </div>
  );
}
