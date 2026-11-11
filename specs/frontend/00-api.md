# 00 - API

Folder: `src/api/` (replaces the single file `src/services/api.ts`)

## Purpose
HTTP layer between the React frontend and the dashboard backend. Components never call `fetch` directly; they call the functions exported by this folder. The HelpFlow API under test is never called from the frontend; only the dashboard backend does that.

## Folder structure
One file per module, plus a shared HTTP helper and an entry point:

```
src/api/
  request.ts      shared helper `request<T>` (not part of the public API)
  tests.ts        API tests module
  suiteRuns.ts    suite runs module
  docs.ts         OpenAPI documentation module
  index.ts        re-exports every public function of the modules above
```

- Consumers import from `src/api/index.ts` (the `index.ts`), never from an individual module file. Because without it, there would be multiple import on the components
- `request.ts` is not re-exported by `index.ts`.
- Modules import `request` from `./request` and types from `src/types`.
- Modules must not import from each other.
- Section divisions that existed in the old single file become these files.

## Transport
- All calls use relative paths starting with `/api/...`.
- Vite proxies `/api` to the dashboard backend (`http://localhost:3001`, see `vite.config.ts`).
- Request and response bodies are JSON, except the `runAll` response, which is NDJSON (one JSON object per line) streamed as the tests finish (see below).
- Types (`ApiTest`, `ApiTestInput`, `DocRoute`, `DocRouteInput`, `FailingTestStat`, `GlobalStats`, `OpenApiStatus`, `PassingTestStat`, `SuiteRun`, `SuiteRunExecution`, `TestDurationPoint`, `TestRun`) come from `src/types`.

## `request.ts`: `request<T>(path, init?)`
Wraps `fetch` for every function except `runAll`.

Behavior:
1. Sends the request with the header `Content-Type: application/json`. Headers passed in `init.headers` are merged in.
2. If the response is not `ok` (status outside 200-299):
   - Reads the body as text (an empty string if reading fails).
   - Tries to parse it as JSON and use its `error` field as the message.
   - If parsing fails or `error` is missing, the message is `HTTP <status>`.
   - Throws `Error(message)`.
3. If the status is `204`, resolves with `undefined`.
4. Otherwise resolves with the parsed JSON body.

## `tests.ts`: API tests module
Everything under `/api/tests`.

| Function | Method and path | Returns |
|---|---|---|
| `listTests()` | `GET /api/tests` | `ApiTest[]` |
| `createTest(input)` | `POST /api/tests` (body: `input`) | `ApiTest` |
| `updateTest(id, input)` | `PUT /api/tests/:id` (body: `input`) | `ApiTest` |
| `deleteTest(id)` | `DELETE /api/tests/:id` | `void` |
| `runTest(test)` | `POST /api/tests/:id/run` (id taken from `test.id`) | `TestRun` |
| `getTestDurationHistory(testId)` | `GET /api/tests/:testId/duration-history` | `TestDurationPoint[]` |
| `getPassingTestsStats()` | `GET /api/tests/passing-stats` | `PassingTestStat[]` |
| `getFailingTestsStats()` | `GET /api/tests/failing-stats` | `FailingTestStat[]` |

### `runAll(onResult)`
`POST /api/tests/run-all`. Runs the whole suite and delivers results as they arrive instead of waiting for the end.

- Does not use `request`; calls `fetch` directly.
- If the response is not `ok` or has no body, throws `Error("HTTP <status>")`. Unlike `request`, the backend's `error` field is not read here.
- The response body is a stream of newline-delimited JSON (NDJSON): one JSON object per line, each shaped `{ testId: number } & TestRun`.
- The stream is decoded incrementally. Lines are buffered, so a line split across chunks is only parsed once complete. Blank lines are skipped.
- `onResult` is called once per parsed line, in arrival order.
- Resolves with `void` when the stream ends.

## `suiteRuns.ts`: suite runs module
Everything under `/api/suite-runs`.

| Function | Method and path | Returns |
|---|---|---|
| `listSuiteRuns()` | `GET /api/suite-runs` | `SuiteRun[]` |
| `getSuiteRunExecutions(id)` | `GET /api/suite-runs/:id/executions` | `SuiteRunExecution[]` |
| `setSuiteRunHidden(id, hidden)` | `PATCH /api/suite-runs/:id/hidden` (body: `{ hidden }`) | `void` |
| `getGlobalStats()` | `GET /api/suite-runs/statistics` | `GlobalStats` |

## `docs.ts`: OpenAPI documentation module
Everything related to OpenAPI documentation.

| Function | Method and path | Returns |
|---|---|---|
| `listDocRoutes()` | `GET /api/doc-routes` | `DocRoute[]` |
| `createDocRoute(input)` | `POST /api/doc-routes` (body: `input`) | `DocRoute` |
| `updateDocRoute(id, input)` | `PUT /api/doc-routes/:id` (body: `input`) | `DocRoute` |
| `deleteDocRoute(id)` | `DELETE /api/doc-routes/:id` | `void` |
| `getOpenApiStatus()` | `GET /api/openapi-status` | `OpenApiStatus` |

## Error contract
- Every function except `runAll` rejects with an `Error` whose message is the backend's `error` field, or `HTTP <status>` as a fallback.
- Network failures (no response) reject with the native `fetch` error and are not wrapped.
- No retries, timeouts, caching or request cancellation.

## Points to review in this spec
- Placement decision: `getTestDurationHistory`, `getPassingTestsStats` and `getFailingTestsStats` were grouped under suite runs / OpenAPI in the old file, but they call `/api/tests/...`. This spec puts them in `tests.ts`, grouping by backend route prefix. Confirm that is what you want; the alternative is to keep them where they were.
- `getGlobalStats` and the pass/fail stats are all "statistics" and could instead form a fourth `stats.ts` module. Not done, since you asked for three modules.
- `runAll` duplicates part of the error handling in `request` and ignores the backend `error` message (candidate for DRY, per CLAUDE.md). With `request` in its own file, `runAll` could reuse a shared error-from-response helper.
- `runAll` has no error handling for a malformed NDJSON line: `JSON.parse` throws and aborts the whole stream.
- `runAll` does not parse a final line that lacks a trailing newline: it remains in `buffer` and is dropped when the stream ends.
- `runAll` is long for a single function; CLAUDE.md asks for small, testable functions. Splitting the NDJSON line parsing into its own function would make it testable.
- `runTest` receives a whole `ApiTest` but only uses its `id`; every other function takes an `id` number.
- All 8 existing imports of `services/api` must be changed to the new path, because the module moves from `src/services/api.ts` to `src/api/`. The old `src/services/api.ts` must be removed, and `src/services/` too once it is empty. Files to update (all use `import * as api`, so `index.ts` must export the same function names):
  - `src/hooks/useDocRoutes.ts`, `src/hooks/useOpenApiStatus.ts`, `src/hooks/useTests.ts`, `src/hooks/useSuiteRuns.ts`: `'../services/api'` becomes `'../api'`
  - `src/modules/statistics/AvgDurationModal.tsx`, `FailingTestsModal.tsx`, `PassingTestsModal.tsx`, `SlowestTestModal.tsx`: `'../../services/api'` becomes `'../../api'`
- Section comments in the old code are in Portuguese; the spec is in English.
- The routes `/api/tests/passing-stats`, `/api/tests/failing-stats` and `/api/tests/run-all` must be registered before `/api/tests/:id`-style routes in the backend; not verified in this spec.
- No automated tests exist for this module yet; per CLAUDE.md, tests must be written before any change to it.
