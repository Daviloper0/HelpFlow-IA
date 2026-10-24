import { Router } from 'express';
import { getGlobalStats, listSuiteRuns, setSuiteRunHidden } from '../db/queries';

export const suiteRunsRouter = Router();

suiteRunsRouter.get('/', (_req, res) => {
  res.json(listSuiteRuns(50));
});

suiteRunsRouter.get('/statistics', (_req, res) => {
  res.json(getGlobalStats());
});

suiteRunsRouter.patch('/:id/hidden', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const { hidden } = req.body as { hidden: boolean };
  if (typeof hidden !== 'boolean') return res.status(400).json({ error: 'hidden must be boolean' });
  setSuiteRunHidden(id, hidden);
  return res.status(204).end();
});
