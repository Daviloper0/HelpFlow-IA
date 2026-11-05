import { Router } from 'express';
import {
  deleteTestById,
  getFailingTestsStats,
  getPassingTestsStats,
  getTestById,
  insertTest,
  listTests,
  stmtDurationHistory,
  updateTestById,
} from '../db/queries';
import { validateTestInput } from '../lib/validation';

export const testsRouter = Router();

testsRouter.get('/', (_req, res) => {
  res.json(listTests());
});

testsRouter.get('/passing-stats', (_req, res) => {
  return res.json(getPassingTestsStats());
});

testsRouter.get('/failing-stats', (_req, res) => {
  return res.json(getFailingTestsStats());
});

testsRouter.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const test = getTestById(id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  return res.json(test);
});

testsRouter.post('/', (req, res) => {
  const result = validateTestInput(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const created = insertTest(result.data);
  return res.status(201).json(created);
});

testsRouter.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const result = validateTestInput(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const updated = updateTestById(id, result.data);
  if (!updated) return res.status(404).json({ error: 'Test not found' });

  return res.json(updated);
});

testsRouter.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const deleted = deleteTestById(id);
  if (!deleted) return res.status(404).json({ error: 'Test not found' });

  return res.status(204).send();
});

testsRouter.get('/:id/duration-history', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const rows = stmtDurationHistory.all(id) as { durationMs: number; passed: number; ranAt: number }[];

  return res.json(rows.map((r) => ({ ...r, passed: r.passed === 1 })));
});
