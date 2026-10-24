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

function rowToJson(row: DocRouteRow) {
  const errors = db
    .prepare('SELECT status, body FROM doc_route_errors WHERE route_id = ? ORDER BY id ASC')
    .all(row.id) as DocErrorRow[];

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

docsRouter.get('/doc-routes', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM doc_routes ORDER BY id ASC')
    .all() as DocRouteRow[];
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

  const insertRoute = db.prepare(`
    INSERT INTO doc_routes (method, route, title, description, request_body, success_status, success_body)
    VALUES (@method, @route, @title, @description, @requestBody, @successStatus, @successBody)
  `);

  const insertError = db.prepare(`
    INSERT INTO doc_route_errors (route_id, status, body) VALUES (?, ?, ?)
  `);

  const create = db.transaction(() => {
    const info = insertRoute.run({
      method: b.method,
      route: b.route,
      title: (b.title as string).trim(),
      description: typeof b.description === 'string' ? b.description : '',
      requestBody: typeof b.requestBody === 'string' ? b.requestBody : '',
      successStatus: Number(b.successStatus),
      successBody: typeof b.successBody === 'string' ? b.successBody : '',
    });
    const id = info.lastInsertRowid as number;
    for (const e of errors) {
      insertError.run(id, Number(e.status), e.body);
    }
    return id;
  });

  const id = create();
  const created = rowToJson(
    db.prepare('SELECT * FROM doc_routes WHERE id = ?').get(id) as DocRouteRow,
  );

  return res.status(201).json(created);
});

docsRouter.put('/doc-routes/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT id FROM doc_routes WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const result = validateDocRouteInput(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  const b = result.data as Record<string, unknown>;
  const errors: DocErrorRow[] = Array.isArray(b.errors)
    ? (b.errors as DocErrorRow[]).filter(
        (e) => typeof e.status === 'number' && typeof e.body === 'string',
      )
    : [];

  const updateRoute = db.prepare(`
    UPDATE doc_routes SET method=@method, route=@route, title=@title, description=@description,
      request_body=@requestBody, success_status=@successStatus, success_body=@successBody
    WHERE id=@id
  `);
  const deleteErrors = db.prepare('DELETE FROM doc_route_errors WHERE route_id = ?');
  const insertError = db.prepare(
    'INSERT INTO doc_route_errors (route_id, status, body) VALUES (?, ?, ?)',
  );

  db.transaction(() => {
    updateRoute.run({
      id,
      method: b.method,
      route: b.route,
      title: (b.title as string).trim(),
      description: typeof b.description === 'string' ? b.description : '',
      requestBody: typeof b.requestBody === 'string' ? b.requestBody : '',
      successStatus: Number(b.successStatus),
      successBody: typeof b.successBody === 'string' ? b.successBody : '',
    });
    deleteErrors.run(id);
    for (const e of errors) insertError.run(id, Number(e.status), e.body);
  })();

  return res.json(
    rowToJson(db.prepare('SELECT * FROM doc_routes WHERE id = ?').get(id) as DocRouteRow),
  );
});

docsRouter.delete('/doc-routes/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM doc_route_errors WHERE route_id = ?').run(id);
  const info = db.prepare('DELETE FROM doc_routes WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  return res.status(204).send();
});

docsRouter.get('/openapi-status', (_req, res) => {
  // Placeholder — OpenAPI file inspection is future work.
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
