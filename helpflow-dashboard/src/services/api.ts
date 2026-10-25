import type {
  ApiTest,
  ApiTestInput,
  DocRoute,
  DocRouteInput,
  FailingTestStat,
  GlobalStats,
  OpenApiStatus,
  PassingTestStat,
  SuiteRun,
  SuiteRunExecution,
  TestDurationPoint,
  TestRun,
} from '../types';

/*
 * API layer for the dashboard backend.
 *
 * All calls go to relative paths (/api/...) which Vite proxies to the
 * dashboard backend running on port 3001. The HelpFlow API itself is never
 * called directly from the frontend.
 */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    let message = `HTTP ${res.status}`;
    try { message = (JSON.parse(body) as { error: string }).error ?? message; } catch { /* ignore */ }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---- Testes de API ----

export function listTests(): Promise<ApiTest[]> {
  return request('/api/tests');
}

export function createTest(input: ApiTestInput): Promise<ApiTest> {
  return request('/api/tests', { method: 'POST', body: JSON.stringify(input) });
}

export function updateTest(id: number, input: ApiTestInput): Promise<ApiTest> {
  return request(`/api/tests/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function deleteTest(id: number): Promise<void> {
  return request(`/api/tests/${id}`, { method: 'DELETE' });
}

export function runTest(test: ApiTest): Promise<TestRun> {
  return request(`/api/tests/${test.id}/run`, { method: 'POST' });
}

export async function runAll(
  onResult: (result: { testId: number } & TestRun) => void,
): Promise<void> {
  const res = await fetch('/api/tests/run-all', { method: 'POST' });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.trim()) onResult(JSON.parse(line) as { testId: number } & TestRun);
    }
  }
}

// ---- Suite Runs ----

export function listSuiteRuns(): Promise<SuiteRun[]> {
  return request('/api/suite-runs');
}

export function getSuiteRunExecutions(id: number): Promise<SuiteRunExecution[]> {
  return request(`/api/suite-runs/${id}/executions`);
}

export function getTestDurationHistory(testId: number): Promise<TestDurationPoint[]> {
  return request(`/api/tests/${testId}/duration-history`);
}

export function setSuiteRunHidden(id: number, hidden: boolean): Promise<void> {
  return request(`/api/suite-runs/${id}/hidden`, { method: 'PATCH', body: JSON.stringify({ hidden }) });
}

export function getGlobalStats(): Promise<GlobalStats> {
  return request('/api/suite-runs/statistics');
}

// ---- Documentação OpenAPI ----

export function listDocRoutes(): Promise<DocRoute[]> {
  return request('/api/doc-routes');
}

export function createDocRoute(input: DocRouteInput): Promise<DocRoute> {
  return request('/api/doc-routes', { method: 'POST', body: JSON.stringify(input) });
}

export function updateDocRoute(id: number, input: DocRouteInput): Promise<DocRoute> {
  return request(`/api/doc-routes/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function deleteDocRoute(id: number): Promise<void> {
  return request(`/api/doc-routes/${id}`, { method: 'DELETE' });
}

export function getOpenApiStatus(): Promise<OpenApiStatus> {
  return request('/api/openapi-status');
}

export function getPassingTestsStats(): Promise<PassingTestStat[]> {
  return request('/api/tests/passing-stats');
}

export function getFailingTestsStats(): Promise<FailingTestStat[]> {
  return request('/api/tests/failing-stats');
}
