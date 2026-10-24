import { useCallback, useState } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { useDocRoutes } from './hooks/useDocRoutes';
import { useOpenApiStatus } from './hooks/useOpenApiStatus';
import { useSuiteRuns } from './hooks/useSuiteRuns';
import { useTests } from './hooks/useTests';
import { AnalysisPage } from './modules/analysis/AnalysisPage';
import { DocsPage } from './modules/docs/DocsPage';
import { StatisticsPage } from './modules/statistics/StatisticsPage';
import { TestsPage } from './modules/tests/TestsPage';
import type { View } from './types';
import styles from './App.module.css';

/**
 * Raiz do painel. Guarda o módulo aberto e os dados compartilhados entre módulos
 * (os testes aparecem na Análise e na tela de Testes de API).
 */
export function App() {
  const [view, setView] = useState<View>('analysis');
  // Teste a destacar na tela de testes, quando o desenvolvedor vem da Análise.
  const [focusTestId, setFocusTestId] = useState<number | null>(null);

  const tests = useTests();
  const docs = useDocRoutes();
  const openApi = useOpenApiStatus();
  const suiteRuns = useSuiteRuns();

  const goToTest = useCallback((id: number) => {
    setFocusTestId(id);
    setView('tests');
  }, []);

  // Reload suite runs after a full run completes
  const handleRunAll = useCallback(async () => {
    await tests.runAll();
    suiteRuns.reload();
  }, [tests.runAll, suiteRuns.reload]);

  const clearFocus = useCallback(() => setFocusTestId(null), []);

  return (
    <div className={styles.layout}>
      <Sidebar current={view} onChange={setView} />

      <main className={styles.main}>
        <div className={styles.content}>
          {view === 'analysis' && <AnalysisPage tests={tests.tests} openApi={openApi} onGoToTest={goToTest} />}

          {view === 'tests' && (
            <TestsPage
              tests={tests.tests}
              loading={tests.loading}
              isRunningAny={tests.isRunningAny}
              focusTestId={focusTestId}
              onFocusDone={clearFocus}
              onRunTest={tests.runTest}
              onRunAll={handleRunAll}
              onSave={tests.saveTest}
              onDelete={tests.deleteTest}
            />
          )}

          {view === 'statistics' && (
            <StatisticsPage
              runs={suiteRuns.runs}
              stats={suiteRuns.stats}
              loading={suiteRuns.loading}
              onToggleHidden={suiteRuns.toggleHidden}
            />
          )}

          {view === 'docs' && <DocsPage routes={docs.routes} tests={tests.tests} loading={docs.loading} onAddRoute={docs.addRoute} onUpdateRoute={docs.updateRoute} onDeleteRoute={docs.deleteRoute} />}
        </div>
      </main>
    </div>
  );
}
