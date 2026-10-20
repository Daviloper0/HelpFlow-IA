import type { HttpMethod, TestCategory, TestStatus } from '../types';

/** Base URL of the HelpFlow API — used only in curl examples in the Docs module. */
export const HELPFLOW_BASE_URL = 'http://localhost:4284';

/** @deprecated Use HELPFLOW_BASE_URL for curl examples. Dashboard API calls are relative (proxied by Vite). */
export const API_BASE_URL = HELPFLOW_BASE_URL;

export const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

/** Cores do selo de cada método HTTP (fundo e texto). */
export const METHOD_COLORS: Record<HttpMethod, { bg: string; fg: string }> = {
  GET: { bg: '#E4EEFF', fg: '#1D4ED8' },
  POST: { bg: '#E1F5EA', fg: '#0F6B3A' },
  PUT: { bg: '#FDF0D8', fg: '#8A5300' },
  PATCH: { bg: '#EFE7FB', fg: '#5B2EA6' },
  DELETE: { bg: '#FDE8E6', fg: '#A3231A' },
};

export const CATEGORIES: { value: TestCategory; label: string; dot: string }[] = [
  { value: 'success', label: 'Sucesso', dot: '#1F9254' },
  { value: 'validation', label: 'Validação', dot: '#B87503' },
  { value: 'expected-error', label: 'Erro esperado', dot: '#D23B2E' },
];

export function getCategory(value: TestCategory) {
  return CATEGORIES.find((category) => category.value === value) ?? CATEGORIES[0];
}

/** Rótulo e cores de cada situação de teste. */
export const STATUS_STYLES: Record<TestStatus, { label: string; bg: string; fg: string; dot: string }> = {
  idle: { label: 'Não executado', bg: '#EEF0F3', fg: '#4B5565', dot: '#8791A3' },
  running: { label: 'Executando…', bg: '#E8EEFB', fg: '#1B39A0', dot: '#2347C5' },
  pass: { label: 'Aprovado', bg: '#E3F4EA', fg: '#0F6B3A', dot: '#1F9254' },
  fail: { label: 'Falhou', bg: '#FDE8E6', fg: '#A3231A', dot: '#D23B2E' },
};

/** Cores do selo de um código HTTP: 2xx verde, 4xx âmbar, 5xx vermelho. */
export function statusCodeColors(code: number): { bg: string; fg: string } {
  if (code >= 500) return { bg: '#FDE8E6', fg: '#A3231A' };
  if (code >= 400) return { bg: '#FDF0D8', fg: '#8A5300' };
  return { bg: '#E3F4EA', fg: '#0F6B3A' };
}
