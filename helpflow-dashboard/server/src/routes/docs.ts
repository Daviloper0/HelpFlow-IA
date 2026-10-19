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
    INSERT INTO doc_routes (method, route, title, request_body, success_status, success_body)
    VALUES (@method, @route, @title, @requestBody, @successStatus, @successBody)
  `);

  const insertError = db.prepare(`
    INSERT INTO doc_route_errors (route_id, status, body) VALUES (?, ?, ?)
  `);

  const create = db.transaction(() => {
    const info = insertRoute.run({
      method: b.method,
      route: b.route,
      title: (b.title as string).trim(),
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
