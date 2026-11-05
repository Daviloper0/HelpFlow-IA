import { db } from './schema';

// ---- Types mirroring the frontend's ApiTest / TestRun shapes ----

export interface TestRow {
  id: number;
  name: string;
  method: string;
  description: string;
  route: string;
  request_body: string;
  expected_status: number;
  expected_body: string;
  category: string;
  capture_path: string;
  capture_as: string;
  created_at: number;
  last_actual_status: number | null;
  last_actual_body: string | null;
  last_actual_request_body: string | null;
  last_actual_route: string | null;
  last_ran_at: number | null;
  last_passed: number | null;
  last_failure_message: string | null;
}

export interface ApiTestJson {
  id: number;
  name: string;
  method: string;
  description: string;
  route: string;
  requestBody: string;
  expectedStatus: number;
  expectedBody: string;
  category: string;
  capturePath: string;
  captureAs: string;
  lastRun?: {
    actualStatus: number;
    actualBody: string;
    actualRequestBody: string;
    actualRoute: string;
    at: number;
    passed: boolean;
    failureMessage: string;
  };
}

function rowToJson(row: TestRow): ApiTestJson {
  const test: ApiTestJson = {
    id: row.id,
    name: row.name,
    method: row.method,
    description: row.description,
    route: row.route,
    requestBody: row.request_body,
    expectedStatus: row.expected_status,
    expectedBody: row.expected_body,
    category: row.category,
    capturePath: row.capture_path,
    captureAs: row.capture_as,
  };

  if (row.last_ran_at !== null && row.last_actual_status !== null) {
    test.lastRun = {
      actualStatus: row.last_actual_status,
      actualBody: row.last_actual_body ?? '',
      actualRequestBody: row.last_actual_request_body ?? '',
      actualRoute: row.last_actual_route ?? '',
      at: row.last_ran_at,
      passed: row.last_passed === 1,
      failureMessage: row.last_failure_message ?? '',
    };
  }

  return test;
}

const LIST_TESTS_SQL = `
  SELECT
    t.*,
    e.actual_status        AS last_actual_status,
    e.actual_body          AS last_actual_body,
    e.actual_request_body  AS last_actual_request_body,
    e.actual_route         AS last_actual_route,
    e.ran_at               AS last_ran_at,
    e.passed         AS last_passed,
    e.failure_message AS last_failure_message
  FROM tests t
  LEFT JOIN executions e
    ON e.id = (
      SELECT id FROM executions
      WHERE test_id = t.id
      ORDER BY ran_at DESC
      LIMIT 1
    )
  ORDER BY t.id DESC
`;

// ---- Module-level prepared statements (never re-prepared per request) ----

const stmtListTestsDesc = db.prepare(LIST_TESTS_SQL);
const stmtListTestsAsc  = db.prepare(
  LIST_TESTS_SQL.replace('ORDER BY t.id DESC', 'ORDER BY t.sort_order ASC'),
);
const stmtGetTestById = db.prepare(
  LIST_TESTS_SQL.replace('ORDER BY t.id DESC', 'WHERE t.id = ? ORDER BY t.id DESC'),
);
const stmtInsertTest = db.prepare(`
  INSERT INTO tests (name, method, description, route, request_body, expected_status, expected_body, category)
  VALUES (@name, @method, @description, @route, @requestBody, @expectedStatus, @expectedBody, @category)
`);
const stmtUpdateTest = db.prepare(`
  UPDATE tests
  SET name = @name, method = @method, description = @description, route = @route,
      request_body = @requestBody, expected_status = @expectedStatus,
      expected_body = @expectedBody, category = @category
  WHERE id = @id
`);
const stmtDeleteExecsByTest = db.prepare('DELETE FROM executions WHERE test_id = ?');
const stmtDeleteTest        = db.prepare('DELETE FROM tests WHERE id = ?');
const stmtInsertExecution   = db.prepare(`
  INSERT INTO executions (test_id, actual_status, actual_body, actual_request_body, actual_route, passed, failure_message, ran_at, duration_ms, suite_run_id)
  VALUES (@testId, @actualStatus, @actualBody, @actualRequestBody, @actualRoute, @passed, @failureMessage, @ranAt, @durationMs, @suiteRunId)
`);

// Suite runs
const stmtInsertSuiteRun = db.prepare(`
  INSERT INTO suite_runs (ran_at, total, passed, failed, duration_ms)
  VALUES (@ranAt, @total, @passed, @failed, @durationMs)
`);
const stmtUpdateSuiteRunStats = db.prepare(`
  UPDATE suite_runs SET total = @total, passed = @passed, failed = @failed, duration_ms = @durationMs WHERE id = @id
`);
const stmtSetSuiteRunHidden = db.prepare('UPDATE suite_runs SET hidden = ? WHERE id = ?');
const stmtListSuiteRuns     = db.prepare('SELECT * FROM suite_runs ORDER BY ran_at DESC LIMIT ?');
const stmtGetExecsForRun    = db.prepare(`
  SELECT e.test_id, t.name, e.passed, e.duration_ms
  FROM executions e
  JOIN tests t ON t.id = e.test_id
  WHERE e.suite_run_id = ?
`);
const stmtGetPrevExecs = db.prepare('SELECT test_id, passed FROM executions WHERE suite_run_id = ?');

// Global stats
const stmtTotalRuns        = db.prepare('SELECT COUNT(*) AS c FROM suite_runs WHERE hidden = 0');
const stmtTotalExecutions  = db.prepare(`
  SELECT COUNT(*) AS c FROM executions e
  JOIN suite_runs s ON s.id = e.suite_run_id
  WHERE s.hidden = 0
`);
const stmtAvgDuration = db.prepare(`
  SELECT AVG(e.duration_ms) AS avg FROM executions e
  JOIN suite_runs s ON s.id = e.suite_run_id
  WHERE s.hidden = 0
`);
const stmtLastSuite = db.prepare(
  'SELECT id FROM suite_runs WHERE hidden = 0 ORDER BY ran_at DESC LIMIT 1',
);
const stmtSlowestInSuite = db.prepare(`
  SELECT e.test_id, t.name, e.duration_ms FROM executions e
  JOIN tests t ON t.id = e.test_id
  WHERE e.suite_run_id = ?
  ORDER BY e.duration_ms DESC LIMIT 1
`);
const stmtAllTimeTotals = db.prepare(
  'SELECT SUM(passed) AS p, SUM(failed) AS f FROM suite_runs WHERE hidden = 0',
);
const stmtPassRateOverTime = db.prepare(
  'SELECT ran_at, total, passed FROM suite_runs WHERE hidden = 0 ORDER BY ran_at ASC',
);
const stmtTopRegressions = db.prepare(`
  SELECT e.test_id, t.name, COUNT(*) AS failures, MAX(e.ran_at) AS last_failed_at
  FROM executions e
  JOIN tests t ON t.id = e.test_id
  JOIN suite_runs s ON s.id = e.suite_run_id
  WHERE e.passed = 0 AND s.hidden = 0
  GROUP BY e.test_id
  ORDER BY failures DESC
  LIMIT 5
`);
const stmtSuiteRunExecDetails = db.prepare(`
  SELECT e.test_id, t.name, e.duration_ms, e.passed
  FROM executions e
  JOIN tests t ON t.id = e.test_id
  WHERE e.suite_run_id = ?
  ORDER BY e.duration_ms DESC
`);

// Passing / failing test stats (same query, shared)
const stmtAllExecHistory = db.prepare(`
  SELECT e.test_id, t.name, e.passed, e.ran_at
  FROM executions e
  JOIN tests t ON t.id = e.test_id
  JOIN suite_runs s ON s.id = e.suite_run_id
  WHERE s.hidden = 0
  ORDER BY e.test_id, e.ran_at DESC
`);

// getStats
const stmtCountTests    = db.prepare('SELECT COUNT(*) AS count FROM tests');
const stmtLastRanAt     = db.prepare('SELECT MAX(ran_at) AS last_ran_at FROM executions');
const stmtPerTestResult = db.prepare(`
  SELECT e.passed
  FROM executions e
  WHERE e.id = (
    SELECT id FROM executions WHERE test_id = e.test_id ORDER BY ran_at DESC LIMIT 1
  )
`);

// Duration history (used by tests route)
export const stmtDurationHistory = db.prepare(`
  SELECT e.duration_ms AS durationMs, e.passed, sr.ran_at AS ranAt
  FROM executions e
  JOIN suite_runs sr ON e.suite_run_id = sr.id
  WHERE e.test_id = ? AND sr.hidden = 0
  ORDER BY sr.ran_at ASC
`);

// ---- Query functions ----

export function listTests(opts: { order?: 'asc' | 'desc' } = {}): ApiTestJson[] {
  const stmt = opts.order === 'asc' ? stmtListTestsAsc : stmtListTestsDesc;
  return (stmt.all() as TestRow[]).map(rowToJson);
}

export function getTestById(id: number): ApiTestJson | undefined {
  const row = stmtGetTestById.get(id) as TestRow | undefined;
  return row ? rowToJson(row) : undefined;
}

export interface TestInput {
  name: string;
  method: string;
  description: string;
  route: string;
  requestBody: string;
  expectedStatus: number;
  expectedBody: string;
  category: string;
}

export function insertTest(input: TestInput): ApiTestJson {
  const result = stmtInsertTest.run(input);
  return getTestById(result.lastInsertRowid as number)!;
}

export function updateTestById(id: number, input: TestInput): ApiTestJson | undefined {
  stmtUpdateTest.run({ ...input, id });
  stmtDeleteExecsByTest.run(id);
  return getTestById(id);
}

export function deleteTestById(id: number): boolean {
  const result = stmtDeleteTest.run(id);
  return result.changes > 0;
}

export interface ExecutionInput {
  testId: number;
  actualStatus: number;
  actualBody: string;
  actualRequestBody: string;
  actualRoute: string;
  passed: boolean;
  failureMessage: string;
  ranAt: number;
  durationMs: number;
  suiteRunId?: number;
}

export function insertExecution(input: ExecutionInput): void {
  stmtInsertExecution.run({
    ...input,
    passed: input.passed ? 1 : 0,
    suiteRunId: input.suiteRunId ?? null,
  });
}

// ---- Suite Runs ----

export interface SuiteRunInput {
  ranAt: number;
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
}

export interface SuiteRunJson {
  id: number;
  ranAt: number;
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  hidden: boolean;
  avgResponseMs: number;
  fastest: { testId: number; name: string; durationMs: number } | null;
  slowest: { testId: number; name: string; durationMs: number } | null;
  regressions: number;
  recoveries: number;
  newFailures: number;
}

interface SuiteRunRow {
  id: number;
  ran_at: number;
  total: number;
  passed: number;
  failed: number;
  duration_ms: number;
  hidden: number;
}

interface ExecSpeedRow {
  test_id: number;
  name: string;
  duration_ms: number;
}

export function insertSuiteRun(input: SuiteRunInput): number {
  const result = stmtInsertSuiteRun.run(input);
  return result.lastInsertRowid as number;
}

export function updateSuiteRunStats(id: number, stats: { total: number; passed: number; failed: number; durationMs: number }) {
  stmtUpdateSuiteRunStats.run({ ...stats, id });
}

export function setSuiteRunHidden(id: number, hidden: boolean): void {
  stmtSetSuiteRunHidden.run(hidden ? 1 : 0, id);
}

function buildSuiteRunJson(row: SuiteRunRow, prevRow: SuiteRunRow | null): SuiteRunJson {
  const executions = stmtGetExecsForRun.all(row.id) as (ExecSpeedRow & { passed: number })[];

  const avgResponseMs = executions.length
    ? Math.round(executions.reduce((s, e) => s + e.duration_ms, 0) / executions.length)
    : 0;

  const sorted = [...executions].sort((a, b) => a.duration_ms - b.duration_ms);
  const fastest = sorted.length ? { testId: sorted[0].test_id, name: sorted[0].name, durationMs: sorted[0].duration_ms } : null;
  const slowest = sorted.length ? { testId: sorted[sorted.length - 1].test_id, name: sorted[sorted.length - 1].name, durationMs: sorted[sorted.length - 1].duration_ms } : null;

  let regressions = 0;
  let recoveries = 0;
  let newFailures = 0;

  if (prevRow) {
    const prevExec = stmtGetPrevExecs.all(prevRow.id) as { test_id: number; passed: number }[];
    const prevMap = new Map(prevExec.map((e) => [e.test_id, e.passed === 1]));

    for (const e of executions) {
      const prevPassed = prevMap.get(e.test_id);
      if (prevPassed === undefined) {
        if (!e.passed) newFailures++;
      } else if (prevPassed && !e.passed) {
        regressions++;
      } else if (!prevPassed && e.passed) {
        recoveries++;
      }
    }
  } else {
    newFailures = executions.filter((e) => !e.passed).length;
  }

  return {
    id: row.id,
    ranAt: row.ran_at,
    total: row.total,
    passed: row.passed,
    failed: row.failed,
    durationMs: row.duration_ms,
    hidden: row.hidden === 1,
    avgResponseMs,
    fastest,
    slowest,
    regressions,
    recoveries,
    newFailures,
  };
}

export function listSuiteRuns(limit = 50): SuiteRunJson[] {
  const rows = stmtListSuiteRuns.all(limit + 1) as SuiteRunRow[];

  const result: SuiteRunJson[] = [];
  for (let i = 0; i < Math.min(rows.length, limit); i++) {
    const prev = rows[i + 1] ?? null;
    result.push(buildSuiteRunJson(rows[i], prev));
  }
  return result;
}

// ---- Global Statistics ----

export interface RegressionEntry {
  testId: number;
  name: string;
  failures: number;
  lastFailedAt: number;
}

export interface PassRatePoint {
  ranAt: number;
  rate: number;
}

export interface GlobalStats {
  totalRuns: number;
  totalExecutions: number;
  avgTestDurationMs: number;
  slowestTest: { name: string; durationMs: number } | null;
  allTimePassed: number;
  allTimeFailed: number;
  lastRunRate: number | null;
  trend: 'up' | 'down' | 'flat' | null;
  passRateOverTime: PassRatePoint[];
  topRegressions: RegressionEntry[];
}

export function getGlobalStats(): GlobalStats {
  const totalRuns = (stmtTotalRuns.get() as { c: number }).c;
  const totalExecutions = (stmtTotalExecutions.get() as { c: number }).c;
  const avgTestDurationMs = Math.round((stmtAvgDuration.get() as { avg: number | null }).avg ?? 0);

  const lastSuite = stmtLastSuite.get() as { id: number } | undefined;
  let slowestTest: { testId: number; name: string; durationMs: number } | null = null;
  if (lastSuite) {
    const row = stmtSlowestInSuite.get(lastSuite.id) as { test_id: number; name: string; duration_ms: number } | undefined;
    if (row) slowestTest = { testId: row.test_id, name: row.name, durationMs: row.duration_ms };
  }

  const totals = stmtAllTimeTotals.get() as { p: number | null; f: number | null };
  const allTimePassed = totals.p ?? 0;
  const allTimeFailed = totals.f ?? 0;

  const suiteRows = stmtPassRateOverTime.all() as { ran_at: number; total: number; passed: number }[];
  const passRateOverTime: PassRatePoint[] = suiteRows.map((r) => ({
    ranAt: r.ran_at,
    rate: r.total === 0 ? 0 : Math.round((r.passed / r.total) * 100),
  }));

  let lastRunRate: number | null = null;
  let trend: 'up' | 'down' | 'flat' | null = null;
  if (passRateOverTime.length >= 1) lastRunRate = passRateOverTime[passRateOverTime.length - 1].rate;
  if (passRateOverTime.length >= 2) {
    const prev = passRateOverTime[passRateOverTime.length - 2].rate;
    if (lastRunRate! > prev) trend = 'up';
    else if (lastRunRate! < prev) trend = 'down';
    else trend = 'flat';
  }

  const topRegressions = stmtTopRegressions.all() as { test_id: number; name: string; failures: number; last_failed_at: number }[];

  return {
    totalRuns,
    totalExecutions,
    avgTestDurationMs,
    slowestTest,
    allTimePassed,
    allTimeFailed,
    lastRunRate,
    trend,
    passRateOverTime,
    topRegressions: topRegressions.map((r) => ({
      testId: r.test_id,
      name: r.name,
      failures: r.failures,
      lastFailedAt: r.last_failed_at,
    })),
  };
}

export interface SuiteRunExecutionJson {
  testId: number;
  name: string;
  durationMs: number;
  passed: boolean;
}

export function getSuiteRunExecutions(suiteRunId: number): SuiteRunExecutionJson[] {
  return (stmtSuiteRunExecDetails.all(suiteRunId) as { test_id: number; name: string; duration_ms: number; passed: number }[])
    .map((r) => ({
      testId: r.test_id,
      name: r.name,
      durationMs: r.duration_ms,
      passed: r.passed === 1,
    }));
}

export interface PassingTestStat {
  testId: number;
  name: string;
  streak: number;
  passRate: number;
  totalRuns: number;
  lastFailedAt: number | null;
  firstPassedAfterLastFail: number | null;
}

export interface FailingTestStat {
  testId: number;
  name: string;
  streak: number;
  failRate: number;
  totalRuns: number;
  lastPassedAt: number | null;
  streakStartedAt: number | null;
}

function groupExecsByTest(rows: { test_id: number; name: string; passed: number; ran_at: number }[]) {
  const byTest = new Map<number, { name: string; runs: { passed: boolean; ran_at: number }[] }>();
  for (const r of rows) {
    if (!byTest.has(r.test_id)) byTest.set(r.test_id, { name: r.name, runs: [] });
    byTest.get(r.test_id)!.runs.push({ passed: r.passed === 1, ran_at: r.ran_at });
  }
  return byTest;
}

export function getFailingTestsStats(): FailingTestStat[] {
  const rows = stmtAllExecHistory.all() as { test_id: number; name: string; passed: number; ran_at: number }[];
  const byTest = groupExecsByTest(rows);

  const result: FailingTestStat[] = [];
  for (const [testId, { name, runs }] of byTest) {
    let streak = 0;
    for (const r of runs) {
      if (r.passed) break;
      streak++;
    }
    const totalRuns = runs.length;
    const failedCount = runs.filter((r) => !r.passed).length;
    const failRate = totalRuns > 0 ? Math.round((failedCount / totalRuns) * 100) : 0;
    const lastPassedAt = runs.find((r) => r.passed)?.ran_at ?? null;
    const streakStartedAt = streak > 0 ? runs[streak - 1].ran_at : null;
    result.push({ testId, name, streak, failRate, totalRuns, lastPassedAt, streakStartedAt });
  }
  return result.sort((a, b) => b.streak - a.streak);
}

export function getPassingTestsStats(): PassingTestStat[] {
  const rows = stmtAllExecHistory.all() as { test_id: number; name: string; passed: number; ran_at: number }[];
  const byTest = groupExecsByTest(rows);

  const result: PassingTestStat[] = [];
  for (const [testId, { name, runs }] of byTest) {
    let streak = 0;
    for (const r of runs) {
      if (!r.passed) break;
      streak++;
    }
    const totalRuns = runs.length;
    const passedCount = runs.filter((r) => r.passed).length;
    const passRate = totalRuns > 0 ? Math.round((passedCount / totalRuns) * 100) : 0;
    const failIdx = runs.findIndex((r) => !r.passed);
    const lastFailedAt = failIdx >= 0 ? runs[failIdx].ran_at : null;
    const firstPassedAfterLastFail = failIdx > 0 ? runs[failIdx - 1].ran_at : null;
    result.push({ testId, name, streak, passRate, totalRuns, lastFailedAt, firstPassedAfterLastFail });
  }
  return result.sort((a, b) => b.streak - a.streak);
}

export interface StatsRow {
  total: number;
  last_ran_at: number | null;
}

export function getStats() {
  const total = (stmtCountTests.get() as { count: number }).count;
  const lastRanAt = (stmtLastRanAt.get() as { last_ran_at: number | null }).last_ran_at;
  const perTest = stmtPerTestResult.all() as { passed: number }[];
  const pass = perTest.filter((r) => r.passed === 1).length;
  const fail = perTest.filter((r) => r.passed === 0).length;
  return { total, lastRanAt, pass, fail };
}
