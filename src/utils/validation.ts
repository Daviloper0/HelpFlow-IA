import type { RouteFormValues, TestFormValues } from '../types';
import { jsonError } from './json';

// Regras de validação dos formulários. Cada campo com problema recebe uma mensagem;
// campo sem problema fica com texto vazio.

/** Código HTTP de 3 dígitos dentro do intervalo dado, ou 0 se for inválido. */
function parseStatus(text: string, min: number, max: number): number {
  const trimmed = text.trim();
  if (!/^\d{3}$/.test(trimmed)) return 0;
  const code = Number(trimmed);
  return code >= min && code <= max ? code : 0;
}

function routeError(route: string): string {
  const trimmed = route.trim();
  if (!trimmed) return 'Informe a rota.';
  if (!trimmed.startsWith('/')) return 'A rota deve começar com “/”.';
  return '';
}

export interface TestFormErrors {
  name: string;
  route: string;
  expectedStatus: string;
  requestBody: string;
  expectedBody: string;
}

export function validateTestForm(values: TestFormValues): TestFormErrors {
  return {
    name: values.name.trim() ? '' : 'Dê um nome ao teste.',
    route: routeError(values.route),
    expectedStatus: parseStatus(values.expectedStatus, 100, 599) ? '' : 'Use um código HTTP entre 100 e 599.',
    requestBody: jsonError(values.requestBody),
    expectedBody: jsonError(values.expectedBody),
  };
}

export interface RouteFormErrors {
  title: string;
  route: string;
  requestBody: string;
  successStatus: string;
  successBody: string;
  /** Um item por linha de erro do formulário, na mesma ordem. */
  errors: { status: string; body: string }[];
}

export function validateRouteForm(values: RouteFormValues): RouteFormErrors {
  return {
    title: values.title.trim() ? '' : 'Dê um título à rota.',
    route: routeError(values.route),
    requestBody: jsonError(values.requestBody),
    successStatus: parseStatus(values.successStatus, 200, 299) ? '' : 'Use um código de sucesso entre 200 e 299.',
    successBody: jsonError(values.successBody),
    errors: values.errors.map((error) => ({
      status: parseStatus(error.status, 400, 599) ? '' : 'Use um código de erro entre 400 e 599.',
      body: jsonError(error.body),
    })),
  };
}

export function hasTestFormErrors(errors: TestFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function hasRouteFormErrors(errors: RouteFormErrors): boolean {
  const { errors: rows, ...fields } = errors;
  return Object.values(fields).some(Boolean) || rows.some((row) => row.status || row.body);
}
