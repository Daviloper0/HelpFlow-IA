import { HELPFLOW_BASE_URL } from '../constants/http';
import type { DocRoute } from '../types';
import { compactJson } from './json';

/**
 * Monta o exemplo de requisição em curl para uma rota documentada.
 * Parâmetros de caminho como {id} viram 1 para o exemplo ficar executável.
 */
export function buildCurl(route: Pick<DocRoute, 'method' | 'route' | 'requestBody'>): string {
  const url = HELPFLOW_BASE_URL + route.route.replace(/\{[^}]+\}/g, '1');
  let command = `curl -X ${route.method} ${url}`;

  if (route.requestBody.trim()) {
    command += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${compactJson(route.requestBody)}'`;
  }
  return command;
}
