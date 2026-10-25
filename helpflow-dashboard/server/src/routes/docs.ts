import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import { db } from '../db/schema';
import { validateDocRouteInput } from '../lib/validation';

export const docsRouter = Router();

// docs/openapi.yaml lives at the dashboard root (two levels above server/src/routes/)
const OPENAPI_PATH = path.join(__dirname, '../../../docs/openapi.yaml');

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

// ---- OpenAPI YAML generation ----

function yamlStr(s: string): string {
  // Wrap in double quotes, escaping backslashes and double quotes inside
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
}

function tryParseJson(s: string): unknown {
  if (!s || !s.trim()) return undefined;
  try { return JSON.parse(s); } catch { return s; }
}

function generateOpenApiYaml(rows: DocRouteRow[]): string {
  const lines: string[] = [
    'openapi: "3.0.3"',
    'info:',
    '  title: "HelpFlow API"',
    '  version: "1.0.0"',
    '  description: "Documentação gerada automaticamente pelo HelpFlow Dashboard."',
    'paths:',
  ];

  // Group by route path
  const byPath = new Map<string, DocRouteRow[]>();
  for (const row of rows) {
    if (!byPath.has(row.route)) byPath.set(row.route, []);
    byPath.get(row.route)!.push(row);
  }

  for (const [routePath, routeRows] of byPath) {
    lines.push(`  ${yamlStr(routePath)}:`);

    for (const row of routeRows) {
      const method = row.method.toLowerCase();
      const errors = stmtGetDocErrors.all(row.id) as DocErrorRow[];
      const hasBody = !['get', 'delete', 'head'].includes(method);
      const requestBodyParsed = tryParseJson(row.request_body);
      const successBodyParsed = tryParseJson(row.success_body);

      lines.push(`    ${method}:`);
      lines.push(`      summary: ${yamlStr(row.title)}`);
      if (row.description) {
        lines.push(`      description: ${yamlStr(row.description)}`);
      }

      if (hasBody && requestBodyParsed !== undefined) {
        lines.push('      requestBody:');
        lines.push('        required: true');
        lines.push('        content:');
        lines.push('          application/json:');
        lines.push(`            example: ${JSON.stringify(requestBodyParsed)}`);
      }

      lines.push('      responses:');
      lines.push(`        "${row.success_status}":`);
      lines.push('          description: "Sucesso"');
      if (successBodyParsed !== undefined) {
        lines.push('          content:');
        lines.push('            application/json:');
        lines.push(`              example: ${JSON.stringify(successBodyParsed)}`);
      }

      for (const err of errors) {
        const errBodyParsed = tryParseJson(err.body);
        lines.push(`        "${err.status}":`);
        lines.push('          description: "Erro"');
        if (errBodyParsed !== undefined) {
          lines.push('          content:');
          lines.push('            application/json:');
          lines.push(`              example: ${JSON.stringify(errBodyParsed)}`);
        }
      }
    }
  }

  return lines.join('\n') + '\n';
}

function writeOpenApi(): void {
  const rows = stmtListDocRoutes.all() as DocRouteRow[];
  if (rows.length === 0) return; // don't create an empty file
  const yaml = generateOpenApiYaml(rows);
  fs.mkdirSync(path.dirname(OPENAPI_PATH), { recursive: true });
  fs.writeFileSync(OPENAPI_PATH, yaml, 'utf8');
}

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
  writeOpenApi();
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

  writeOpenApi();
  return res.json(rowToJson(stmtGetDocRoute.get(id) as DocRouteRow));
});

docsRouter.delete('/doc-routes/:id', (req, res) => {
  const id = Number(req.params.id);
  stmtDeleteDocErrors.run(id);
  const info = stmtDeleteDocRoute.run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  writeOpenApi();
  return res.status(204).send();
});

docsRouter.get('/openapi-status', (_req, res) => {
  const relativePath = 'docs/openapi.yaml';
  try {
    const stat = fs.statSync(OPENAPI_PATH);
    res.json({
      exists: true,
      path: relativePath,
      updatedAt: stat.mtimeMs,
      validation: 'unvalidated',
      note: 'Arquivo gerado automaticamente. Valide manualmente se necessário.',
    });
  } catch {
    res.json({
      exists: false,
      path: relativePath,
      updatedAt: null,
      validation: 'unvalidated',
      note: 'Adicione uma rota para gerar o arquivo.',
    });
  }
});

