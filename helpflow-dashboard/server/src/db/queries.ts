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
  // Joined from executions (nullable when no run exists)
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

export function listTests(opts: { order?: 'asc' | 'desc' } = {}): ApiTestJson[] {
  const sql = opts.order === 'asc'
    ? LIST_TESTS_SQL.replace('ORDER BY t.id DESC', 'ORDER BY t.sort_order ASC')
    : LIST_TESTS_SQL;
  return (db.prepare(sql).all() as TestRow[]).map(rowToJson);
}

export function getTestById(id: number): ApiTestJson | undefined {
  const sql = LIST_TESTS_SQL.replace('ORDER BY t.id DESC', 'WHERE t.id = ? ORDER BY t.id DESC');
  const row = db.prepare(sql).get(id) as TestRow | undefined;
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
  const stmt = db.prepare(`
    INSERT INTO tests (name, method, description, route, request_body, expected_status, expected_body, category)
    VALUES (@name, @method, @description, @route, @requestBody, @expectedStatus, @expectedBody, @category)
  `);
  const result = stmt.run(input);
  return getTestById(result.lastInsertRowid as number)!;
}

export function updateTestById(id: number, input: TestInput): ApiTestJson | undefined {
  db.prepare(`
    UPDATE tests
    SET name = @name, method = @method, description = @description, route = @route,
        request_body = @requestBody, expected_status = @expectedStatus,
        expected_body = @expectedBody, category = @category
    WHERE id = @id
  `).run({ ...input, id });

  // Clear lastRun: the definition changed, previous result is no longer valid
  db.prepare('DELETE FROM executions WHERE test_id = ?').run(id);

  return getTestById(id);
}

export function deleteTestById(id: number): boolean {
  const result = db.prepare('DELETE FROM tests WHERE id = ?').run(id);
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
}

export function insertExecution(input: ExecutionInput): void {
  db.prepare(`
    INSERT INTO executions (test_id, actual_status, actual_body, actual_request_body, actual_route, passed, failure_message, ran_at, duration_ms)
    VALUES (@testId, @actualStatus, @actualBody, @actualRequestBody, @actualRoute, @passed, @failureMessage, @ranAt, @durationMs)
  `).run({ ...input, passed: input.passed ? 1 : 0 });
}

export interface StatsRow {
  total: number;
  last_ran_at: number | null;
}

/** Returns dashboard statistics based on the most recent execution per test. */
export function getStats() {
  const total = (db.prepare('SELECT COUNT(*) AS count FROM tests').get() as { count: number }).count;
  const lastRanAt = (
    db.prepare('SELECT MAX(ran_at) AS last_ran_at FROM executions').get() as { last_ran_at: number | null }
  ).last_ran_at;

  // For pass/fail: consider only the most recent execution per test
  const perTest = db.prepare(`
    SELECT e.passed
    FROM executions e
    WHERE e.id = (
      SELECT id FROM executions WHERE test_id = e.test_id ORDER BY ran_at DESC LIMIT 1
    )
  `).all() as { passed: number }[];

  const pass = perTest.filter((r) => r.passed === 1).length;
  const fail = perTest.filter((r) => r.passed === 0).length;

  return { total, lastRanAt, pass, fail };
}
