import { Router } from 'express';
import { config } from '../config';
import { getTestById, insertExecution, listTests } from '../db/queries';
import { executeRequest } from '../lib/executor';
import { validate } from '../lib/validator';

function interpolate(body: string): string {
  return body.replace(/\{\{timestamp\}\}/g, Date.now().toString());
}

export const runnerRouter = Router();

/** Run a single test by id. Returns the TestRun object the frontend expects. */
runnerRouter.post('/:id/run', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const test = getTestById(id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const actualRequestBody = interpolate(test.requestBody);
  const result = await executeRequest(
    test.method,
    test.route,
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
    passed,
    failureMessage,
    ranAt,
    durationMs: result.durationMs,
  });

  return res.json({
    actualStatus: result.actualStatus,
    actualBody: result.actualBody,
    actualRequestBody,
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
  const tests = listTests();

  const results = [];
  for (const test of tests) {
    const actualRequestBody = interpolate(test.requestBody);
    const result = await executeRequest(
      test.method,
      test.route,
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
      testId: test.id,
      actualStatus: result.actualStatus,
      actualBody: result.actualBody,
      actualRequestBody,
      passed,
      failureMessage,
      ranAt,
      durationMs: result.durationMs,
    });

    results.push({
      testId: test.id,
      actualStatus: result.actualStatus,
      actualBody: result.actualBody,
      actualRequestBody,
      at: ranAt,
      passed,
      failureMessage,
    });
  }

  return res.json(results);
});
