import type { ApiTest, StatusCounts, TestStatus, TestView } from '../types';

/**
 * Calcula a situação do teste:
 * - rodando agora → "running"
 * - nunca rodou (ou foi editado) → "idle"
 * - rodou e o status recebido é o esperado → "pass"; senão → "fail"
 */
export function toTestView(test: ApiTest, runningIds: ReadonlySet<number>): TestView {
  let status: TestStatus = 'idle';
  if (runningIds.has(test.id)) {
    status = 'running';
  } else if (test.lastRun) {
    status = test.lastRun.passed ? 'pass' : 'fail';
  }

  const failureMessage = status === 'fail' && test.lastRun ? test.lastRun.failureMessage : '';

  return { ...test, status, failureMessage };
}

export function countStatuses(tests: TestView[]): StatusCounts {
  const count = (status: TestStatus) => tests.filter((test) => test.status === status).length;
  return {
    total: tests.length,
    pass: count('pass'),
    fail: count('fail'),
    idle: count('idle'),
    running: count('running'),
  };
}

/** Momento da execução mais recente entre todos os testes, ou null se nenhum rodou. */
export function getLastRunAt(tests: ApiTest[]): number | null {
  const latest = tests.reduce((max, test) => Math.max(max, test.lastRun?.at ?? 0), 0);
  return latest || null;
}
