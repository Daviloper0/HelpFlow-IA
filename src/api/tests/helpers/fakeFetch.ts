import { expect, vi } from 'vitest';

export type FetchMock = ReturnType<typeof stubFetch>;

export interface SentFakeFetchRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | undefined;
}

/**
 * Overrides the `VITE_API_URL` environment variable for the current test.
 * @param baseUrl Base URL the API client should use.
 */
export function stubApiBaseUrl(baseUrl: string): void {
  vi.stubEnv('VITE_API_URL', baseUrl);
}

/**
 * Replaces the global `fetch` with a mock that resolves with a fresh response on every call.
 * @param buildResponse Factory called once per request, so each call gets its own unread body.
 * @returns The mock, so tests can inspect the calls that were made.
 */
export function stubFetch(buildResponse: () => Response) {
  const fetchMock = vi.fn((_url: string, _init?: RequestInit) => Promise.resolve(buildResponse()));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/**
 * Replaces the global `fetch` with a mock that always rejects, simulating a network failure.
 * @param error The error every call rejects with.
 * @returns The mock, so tests can inspect the calls that were made.
 */
export function stubFailureFetch(error: Error): FetchMock {
  const fetchMock = vi.fn((_url: string, _init?: RequestInit) => Promise.reject(error));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Undoes every stubbed environment variable and global, meant for `afterEach`. */
export function restoreStubs(): void {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
}

/**
 * Reads the most recent call made to the fake fetch.
 * @param fetchMock Mock returned by `stubFetch` or `stubFailureFetch`.
 * @returns The URL, method (defaults to GET), headers and body of that call.
 */
export function lastFakeFetchRequest(fetchMock: FetchMock): SentFakeFetchRequest {
  const calls = fetchMock.mock.calls;
  const [url, init] = calls[calls.length - 1];
  return {
    url,
    method: init?.method ?? 'GET',
    headers: (init?.headers ?? {}) as Record<string, string>,
    body: init?.body as string | undefined,
  };
}

/**
 * Asserts that the most recent fake fetch call matches the expected request.
 * The body is compared as parsed JSON; when `expected.body` is omitted, no body must have been sent.
 * @param fetchMock Mock returned by `stubFetch` or `stubFailureFetch`.
 * @param expected URL, method and optional JSON body the call should have.
 */
export function expectLastFakeFetchRequest(
  fetchMock: FetchMock,
  expected: { url: string; method: string; body?: unknown },
): void {
  const actual = lastFakeFetchRequest(fetchMock);
  expect(actual.url).toBe(expected.url);
  expect(actual.method).toBe(expected.method);
  if (expected.body === undefined) {
    expect(actual.body).toBeUndefined();
  } else {
    expect(JSON.parse(actual.body as string)).toEqual(expected.body);
  }
}
