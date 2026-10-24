import { Router } from 'express';
import { config } from '../config';
import { getTestById, insertExecution, insertSuiteRun, listTests, updateSuiteRunStats } from '../db/queries';
import { executeRequest } from '../lib/executor';
import { validate } from '../lib/validator';

type Context = Record<string, string>;

function interpolate(text: string, context: Context = {}): string {
  return text
    .replace(/\{\{timestamp\}\}/g, Date.now().toString())
    .replace(/\{\{(\w+)\}\}/g, (_, key) => context[key] ?? `{{${key}}}`);
}

/** Extracts a top-level field from a JSON string. e.g. "$.id" → the id value as string. */
function capture(json: string, path: string): string | undefined {
  const match = path.match(/^\$\.(\w+)$/);
  if (!match) return undefined;
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const val = parsed[match[1]];
    return val !== undefined ? String(val) : undefined;
  } catch {
    return undefined;
  }
}

export const runnerRouter = Router();

/** Run a single test by id. Returns the TestRun object the frontend expects. */
runnerRouter.post('/:id/run', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const test = getTestById(id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const actualRequestBody = interpolate(test.requestBody);
  const actualRoute = test.route;
  const result = await executeRequest(
    test.method,
    actualRoute,
    actualRequestBody,
    config.helpflowBaseUrl,
    config.requestTimeoutMs,
  );

  const { passed, failureMessage } = validate(
    result.actualStatus,
    result.actualBody,
    test.expectedStatus,
    test.expectedBody,
    result.error,
  );

  const ranAt = Date.now();

  insertExecution({
    testId: id,
    actualStatus: result.actualStatus,
    actualBody: result.actualBody,
    actualRequestBody,
    actualRoute,
    passed,
    failureMessage,
    ranAt,
    durationMs: result.durationMs,
  });

  return res.json({
    actualStatus: result.actualStatus,
    actualBody: result.actualBody,
    actualRequestBody,
    actualRoute,
    at: ranAt,
    passed,
    failureMessage,
  });
});

/**
 * Run all tests sequentially. Returns an array of per-test results.
 * Tests run one at a time to avoid overwhelming the HelpFlow API.
 * A failing test does not stop the suite.
 */
runnerRouter.post('/run-all', async (_req, res) => {
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.flushHeaders();

  const tests = listTests({ order: 'asc' });
  const suiteStartAt = Date.now();
  const suiteRunId = insertSuiteRun({ ranAt: suiteStartAt, total: tests.length, passed: 0, failed: 0, durationMs: 0 });

  const context: Context = {};
  let suitePass = 0;
  let suiteFail = 0;

  for (const test of tests) {
    const actualRequestBody = interpolate(test.requestBody, context);
    const actualRoute = interpolate(test.route, context);
    const result = await executeRequest(
      test.method,
      actualRoute,
      actualRequestBody,
      config.helpflowBaseUrl,
      config.requestTimeoutMs,
    );

    const { passed, failureMessage } = validate(
      result.actualStatus,
      result.actualBody,
      test.expectedStatus,
      test.expectedBody,
      result.error,
    );

    const ranAt = Date.now();
    if (passed) suitePass++; else suiteFail++;

    insertExecution({
      testId: test.id,
      actualStatus: result.actualStatus,
      actualBody: result.actualBody,
      actualRequestBody,
      actualRoute,
      passed,
      failureMessage,
      ranAt,
      durationMs: result.durationMs,
      suiteRunId,
    });

    if (test.capturePath && test.captureAs) {
      const captured = capture(result.actualBody, test.capturePath);
      if (captured !== undefined) context[test.captureAs] = captured;
    }

    res.write(JSON.stringify({
      testId: test.id,
      actualStatus: result.actualStatus,
      actualBody: result.actualBody,
      actualRequestBody,
      actualRoute,
      at: ranAt,
      passed,
      failureMessage,
    }) + '\n');
  }

  updateSuiteRunStats(suiteRunId, {
    total: tests.length,
    passed: suitePass,
    failed: suiteFail,
    durationMs: Date.now() - suiteStartAt,
  });

  res.end();
});
