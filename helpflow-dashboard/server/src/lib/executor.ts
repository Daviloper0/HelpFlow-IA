/**
 * Executes a single HTTP request against an external API.
 *
 * This module has no knowledge of HelpFlow internals — it takes a generic
 * method, path, and optional body, fires the request, and returns the raw
 * result. Authentication headers, custom middleware, or HelpFlow-specific
 * behaviour can be added here when needed.
 */

export interface ExecutionResult {
  actualStatus: number;
  actualBody: string;
  durationMs: number;
  error?: string;
}

export async function executeRequest(
  method: string,
  route: string,
  requestBody: string,
  baseUrl: string,
  timeoutMs: number,
): Promise<ExecutionResult> {
  const url = baseUrl.replace(/\/$/, '') + route;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const init: RequestInit = {
      method,
      signal: controller.signal,
      headers: requestBody.trim() ? { 'Content-Type': 'application/json' } : {},
      body: requestBody.trim() || undefined,
    };

    const response = await fetch(url, init);
    const durationMs = Date.now() - startedAt;
    const actualBody = await response.text();

    return { actualStatus: response.status, actualBody, durationMs };
  } catch (err: unknown) {
    const durationMs = Date.now() - startedAt;
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    return {
      actualStatus: 0,
      actualBody: '',
      durationMs,
      error: isTimeout ? 'Request timed out' : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}
