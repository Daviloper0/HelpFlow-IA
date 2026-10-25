import { Router } from 'express';
import { db } from '../db/schema';
import { validateDocRouteInput } from '../lib/validation';

export const docsRouter = Router();

interface DocErrorRow {
  status: number;
  body: string;
}

interface DocRouteRow {
  id: number;
  method: string;
  route: string;
  title: string;
  description: string;
  request_body: string;
  success_status: number;
  success_body: string;
}

// ---- Module-level prepared statements ----
const stmtGetDocErrors   = db.prepare('SELECT status, body FROM doc_route_errors WHERE route_id = ? ORDER BY id ASC');
const stmtListDocRoutes  = db.prepare('SELECT * FROM doc_routes ORDER BY id ASC');
const stmtGetDocRoute    = db.prepare('SELECT * FROM doc_routes WHERE id = ?');
const stmtInsertDocRoute = db.prepare(`
  INSERT INTO doc_routes (method, route, title, description, request_body, success_status, success_body)
  VALUES (@method, @route, @title, @description, @requestBody, @successStatus, @successBody)
`);
const stmtInsertDocError  = db.prepare('INSERT INTO doc_route_errors (route_id, status, body) VALUES (?, ?, ?)');
const stmtUpdateDocRoute  = db.prepare(`
  UPDATE doc_routes SET method=@method, route=@route, title=@title, description=@description,
    request_body=@requestBody, success_status=@successStatus, success_body=@successBody
  WHERE id=@id
`);
const stmtDeleteDocErrors = db.prepare('DELETE FROM doc_route_errors WHERE route_id = ?');
const stmtDeleteDocRoute  = db.prepare('DELETE FROM doc_routes WHERE id = ?');

// ---- Helpers ----

function rowToJson(row: DocRouteRow) {
  const errors = stmtGetDocErrors.all(row.id) as DocErrorRow[];
  return {
    id: row.id,
    method: row.method,
    route: row.route,
    title: row.title,
    description: row.description,
    requestBody: row.request_body,
    successStatus: row.success_status,
    successBody: row.success_body,
    errors,
  };
}

// ---- Routes ----

docsRouter.get('/doc-routes', (_req, res) => {
  const rows = stmtListDocRoutes.all() as DocRouteRow[];
  res.json(rows.map(rowToJson));
});

docsRouter.post('/doc-routes', (req, res) => {
  const result = validateDocRouteInput(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const b = result.data as Record<string, unknown>;
  const errors: DocErrorRow[] = Array.isArray(b.errors)
    ? (b.errors as DocErrorRow[]).filter(
        (e) => typeof e.status === 'number' && typeof e.body === 'string',
      )
    : [];

  const create = db.transaction(() => {
    const info = stmtInsertDocRoute.run({
      method: b.method,
      route: b.route,
      title: (b.title as string).trim(),
      description: typeof b.description === 'string' ? b.description : '',
      requestBody: typeof b.requestBody === 'string' ? b.requestBody : '',
      successStatus: Number(b.successStatus),
      successBody: typeof b.successBody === 'string' ? b.successBody : '',
    });
    const id = info.lastInsertRowid as number;
    for (const e of errors) stmtInsertDocError.run(id, Number(e.status), e.body);
    return id;
  });

  const id = create();
  return res.status(201).json(rowToJson(stmtGetDocRoute.get(id) as DocRouteRow));
});

docsRouter.put('/doc-routes/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!stmtGetDocRoute.get(id)) return res.status(404).json({ error: 'Not found' });

  const result = validateDocRouteInput(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const b = result.data as Record<string, unknown>;
  const errors: DocErrorRow[] = Array.isArray(b.errors)
    ? (b.errors as DocErrorRow[]).filter(
        (e) => typeof e.status === 'number' && typeof e.body === 'string',
      )
    : [];

  db.transaction(() => {
    stmtUpdateDocRoute.run({
      id,
      method: b.method,
      route: b.route,
      title: (b.title as string).trim(),
      description: typeof b.description === 'string' ? b.description : '',
      requestBody: typeof b.requestBody === 'string' ? b.requestBody : '',
      successStatus: Number(b.successStatus),
      successBody: typeof b.successBody === 'string' ? b.successBody : '',
    });
    stmtDeleteDocErrors.run(id);
    for (const e of errors) stmtInsertDocError.run(id, Number(e.status), e.body);
  })();

  return res.json(rowToJson(stmtGetDocRoute.get(id) as DocRouteRow));
});

docsRouter.delete('/doc-routes/:id', (req, res) => {
  const id = Number(req.params.id);
  stmtDeleteDocErrors.run(id);
  const info = stmtDeleteDocRoute.run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  return res.status(204).send();
});

docsRouter.get('/openapi-status', (_req, res) => {
  res.json({
    exists: false,
    path: 'docs/openapi.yaml',
    updatedAt: null,
    validation: 'unvalidated',
    note: 'OpenAPI status inspection not yet implemented.',
  });
});

docsRouter.get('/stats', (_req, res) => {
  const { getStats } = require('../db/queries');
  const stats = getStats();
  res.json({
    total: stats.total,
    lastRanAt: stats.lastRanAt,
    pass: stats.pass,
    fail: stats.fail,
  });
});
