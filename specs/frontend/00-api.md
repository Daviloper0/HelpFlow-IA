# 00 - API

Folder: `src/api/` (replaces the single file `src/services/api.ts`)

## Purpose
HTTP layer between the React frontend and the dashboard backend. Components never call `fetch` directly; they call the functions exported by this folder. The HelpFlow API under test is never called from the frontend; only the dashboard backend does that.

## Folder structure
One file per frontend module that calls the backend, plus a shared HTTP helper and an entry point:

```
src/api/
  request.ts      shared helpers `request<T>` and `buildUrl` (not part of the public API)
  ndjson.ts       NDJSON stream parsing used by `runAll` (not part of the public API)
  apiTests.ts     testing module: create, edit, delete and run tests
  statistics.ts   statistics module: suite runs and test statistics
  docs.ts         docs module: OpenAPI documentation
  index.ts        re-exports every public function of the modules above
  index.test.ts   tests of the public surface
  tests/          unit tests, one file per module
    helpers/      shared test helpers (fake fetch, data builders)
    integration/  tests against the real backend
      helpers/    backend launcher and HelpFlow stub
```

- Consumers import from `src/api/index.ts` (the `index.ts`), never from an individual module file. Because without it, there would be multiple imports on the components
- `request.ts` and `ndjson.ts` are not re-exported by `index.ts`.
- Modules import `request` from `./request` and types from `src/types`.
- Modules must not import from each other.
- The grouping follows the frontend modules in `src/modules/` (tests, statistics, docs). The `analysis` module has no API calls of its own, since it only displays data fetched for the other modules, so it has no file here.
- Comments in the code of this folder are written in English. The section headers of the old single file (in Portuguese) are not carried over, since each module is now its own file.

## Transport
- All calls use paths starting with `/api/...`, prefixed by a base URL built by `buildUrl(path)` (in `request.ts`, used by both `request` and `runAll`). The base URL comes from `VITE_API_URL` (read through `import.meta.env`). When it is not set it is empty, so paths stay relative and the Vite proxy handles them exactly as today. Tests set it to the address of a real backend. `buildUrl` reads `VITE_API_URL` each time it is called, so tests can set it after importing.
- Vite proxies `/api` to the dashboard backend (`http://localhost:3001`, see `vite.config.ts`).
- Request and response bodies are JSON, except the `runAll` response, which is NDJSON (one JSON object per line) streamed as the tests finish (see below).
- Types (`DocsOpenApiFileStatus`, `DocsRoute`, `DocsRouteDraft`, `EndpointTestCase`, `EndpointTestCaseDraft`, `EndpointTestCaseResult`, `StatisticsEndpointTestDuration`, `StatisticsEndpointTestResultInSuite`, `StatisticsFailingEndpointTest`, `StatisticsOverview`, `StatisticsPassingEndpointTest`, `StatisticsSuiteExecution`) come from `src/types`. They were renamed by `01-type-names.md`.

## `request.ts`: `request<T>(path, init?)` and `buildUrl(path)`
`buildUrl(path)` returns the base URL (see Transport) followed by `path`.

`request` wraps `fetch` for every function except `runAll`.

Behavior:
1. Sends the request to `buildUrl(path)` with the header `Content-Type: application/json`. `init` only accepts `method` and `body`; passing headers is not supported, and this is enforced by the type of `init` (no function needs custom headers today; a header needed on every call, such as a token, would be added to the defaults in `request.ts`).
2. If the response is not `ok` (status outside 200-299):
   - Reads the body as text (an empty string if reading fails).
   - Tries to parse it as JSON and use its `error` field as the message.
   - If parsing fails or `error` is missing, the message is `HTTP <status>`.
   - Throws `Error(message)`.
3. If the status is `204`, resolves with `undefined`.
4. Otherwise resolves with the parsed JSON body.

## `apiTests.ts`: testing module
Creating, editing, deleting and running tests.

| Function | Method and path | Returns |
|---|---|---|
| `listTests()` | `GET /api/tests` | `EndpointTestCase[]` |
| `createTest(input)` | `POST /api/tests` (body: `input`) | `EndpointTestCase` |
| `updateTest(id, input)` | `PUT /api/tests/:id` (body: `input`) | `EndpointTestCase` |
| `deleteTest(id)` | `DELETE /api/tests/:id` | `void` |
| `runTest(test)` | `POST /api/tests/:id/run` (id taken from `test.id`) | `EndpointTestCaseResult` |

### `runAll(onResult)`
`POST /api/tests/run-all`. Runs the whole suite and delivers results as they arrive instead of waiting for the end.

- Does not use `request`; calls `fetch` directly (through `buildUrl`).
- If the response is not `ok` or has no body, throws `Error("HTTP <status>")`. Unlike `request`, the backend's `error` field is not read here.
- The response body is a stream of newline-delimited JSON (NDJSON): one JSON object per line, each shaped `{ testId: number } & EndpointTestCaseResult`.
- The stream is decoded incrementally. Lines are buffered, so a line split across chunks is only parsed once complete. Blank lines are skipped. When the stream ends, a non-empty leftover (a last line without a trailing newline) is parsed like any other line.
- A line that is not valid JSON makes `runAll` reject and stops the stream. Results already delivered stay delivered.
- Reading the stream is done by `readNdjsonStream` (see `ndjson.ts` below), so it can be tested directly.
- `onResult` is called once per parsed line, in arrival order.
- Resolves with `void` when the stream ends.

## `ndjson.ts`: NDJSON helpers
Internal, used by `runAll`. Small functions so each rule can be tested alone.

| Function | Behavior |
|---|---|
| `splitBufferIntoLines(buffer)` | Splits on `\n`. Returns `{ completeLines, remainder }`, where `remainder` is the text after the last newline. Blank lines are kept as empty strings. |
| `parseNdjsonLine<T>(line)` | Returns the parsed JSON. Returns `undefined` for an empty or whitespace-only line. Throws when the line is not valid JSON. |
| `readNdjsonStream<T>(body, onItem)` | Reads a `ReadableStream<Uint8Array>`. Decodes incrementally (a multi-byte character split across chunks is decoded correctly), buffers partial lines, calls `onItem` once per parsed line in arrival order, and parses a non-empty leftover at the end. Rejects when a line is not valid JSON; items delivered before it stay delivered. |

## `statistics.ts`: statistics module
Suite run history and test statistics. It mixes `/api/suite-runs` and `/api/tests` URLs because it is grouped by what the statistics screens use.

| Function | Method and path | Returns |
|---|---|---|
| `listSuiteRuns()` | `GET /api/suite-runs` | `StatisticsSuiteExecution[]` |
| `getSuiteRunExecutions(id)` | `GET /api/suite-runs/:id/executions` | `StatisticsEndpointTestResultInSuite[]` |
| `setSuiteRunHidden(id, hidden)` | `PATCH /api/suite-runs/:id/hidden` (body: `{ hidden }`) | `void` |
| `getGlobalStats()` | `GET /api/suite-runs/statistics` | `StatisticsOverview` |
| `getTestDurationHistory(testId)` | `GET /api/tests/:testId/duration-history` | `StatisticsEndpointTestDuration[]` |
| `getPassingTestsStats()` | `GET /api/tests/passing-stats` | `StatisticsPassingEndpointTest[]` |
| `getFailingTestsStats()` | `GET /api/tests/failing-stats` | `StatisticsFailingEndpointTest[]` |

## `docs.ts`: docs module
Everything related to OpenAPI documentation. `getOpenApiStatus` stays here even though the analysis module displays it, because its data is about the documentation.

| Function | Method and path | Returns |
|---|---|---|
| `listDocRoutes()` | `GET /api/doc-routes` | `DocsRoute[]` |
| `createDocRoute(input)` | `POST /api/doc-routes` (body: `input`) | `DocsRoute` |
| `updateDocRoute(id, input)` | `PUT /api/doc-routes/:id` (body: `input`) | `DocsRoute` |
| `deleteDocRoute(id)` | `DELETE /api/doc-routes/:id` | `void` |
| `getOpenApiStatus()` | `GET /api/openapi-status` | `DocsOpenApiFileStatus` |

## Error contract
- Every function except `runAll` rejects with an `Error` whose message is the backend's `error` field, or `HTTP <status>` as a fallback.
- Network failures (no response) reject with the native `fetch` error and are not wrapped.
- No retries, timeouts, caching or request cancellation.

## Tests
Written before the code, as CLAUDE.md requires. All tests import from their final location, so they all fail at first because `src/api/` does not exist yet. The tests for existing behavior must then pass, unchanged, after the split; the tests for new behavior (the base URL, the leftover last line, `ndjson.ts`) describe the new behavior. `src/services/api.ts` stays untouched until the tests pass.

**Tooling:** Vitest (new dev dependency) in a Node environment. `npm test` runs `vitest run`. `@types/node` (dev dependency) is needed so the integration test helpers type-check.

**Unit tests** (fake responses, no server):
- `index.test.ts`: does not export `request`, `buildUrl` or the NDJSON helpers.
- `tests/request.test.ts`: default and merged headers, base URL applied, parsed JSON body, status 204 gives `undefined`, error with a JSON `error` field, error with a non-JSON body, JSON error body without `error`, unreadable body.
- `tests/ndjson.test.ts`: one line per chunk, a line split across chunks, blank lines skipped, leftover last line parsed, malformed line throws, results in arrival order.
- `tests/apiTests.test.ts`, `tests/statistics.test.ts`, `tests/docs.test.ts`: each function sends the right method, path and body, and returns the parsed result. Also `runTest` uses `test.id`, and `runAll` throws `HTTP <status>` on a non-ok or body-less response.

**Integration tests** (`tests/integration/`): they start the real dashboard backend as a separate process on a free port, with a temporary `DB_PATH`. `HELPFLOW_BASE_URL` points to a small HelpFlow stub started by the test, which returns statuses and bodies chosen per test (allowed by the testing exception in CLAUDE.md). The stub has no database and never contacts the real HelpFlow. The tests call the real `api` functions with `VITE_API_URL` set to the backend. Cases:
- the test lifecycle (create, list, update, delete)
- `runTest` with one passing and one failing expectation
- `runAll` returns one result per test, in order, and creates a suite run
- suite run list, executions, hide and statistics
- doc routes lifecycle and OpenAPI status
- passing and failing stats, and duration history

**Test order and isolation:**
- Each integration file starts its own backend with its own temporary database, so files running in parallel cannot affect each other.
- The test lifecycle is a single test with ordered steps (create, list, update, delete), because each step depends on the previous one.
- Every other test creates the data it needs, so it does not depend on another test having run first.

The backend process and the temporary database are removed after each run.

## Order
- This spec is implemented after `01-type-names.md`.
- Nothing is implemented until every file has been reviewed manually, which means committing the changes.

## Points to review in this spec
- `runAll` duplicates part of the error handling in `request` and ignores the backend `error` message (candidate for DRY, per CLAUDE.md). Decided not to change the error handling for now.
- All 8 existing imports of `services/api` must be changed to the new path, because the module moves from `src/services/api.ts` to `src/api/`. The old `src/services/api.ts` must be removed, and `src/services/` too once it is empty. Files to update (all use `import * as api`, so `index.ts` must export the same function names):
  - `src/hooks/useDocRoutes.ts`, `src/hooks/useOpenApiStatus.ts`, `src/hooks/useTests.ts`, `src/hooks/useSuiteRuns.ts`: `'../services/api'` becomes `'../api'`
  - `src/modules/statistics/AvgDurationModal.tsx`, `FailingTestsModal.tsx`, `PassingTestsModal.tsx`, `SlowestTestModal.tsx`: `'../../services/api'` becomes `'../../api'`
- The integration tests of the doc routes rely on the backend variable `OPENAPI_PATH`, added as a one-time exception without its own spec (see `problems/00-api.md`, problem 2). That backend change still has no spec of its own.
- `VITE_API_URL` is new configuration; once implemented, document it in CLAUDE.md.
- `npm run typecheck` currently reports 23 errors in files unrelated to this spec. This spec only requires that the change adds no new errors.
