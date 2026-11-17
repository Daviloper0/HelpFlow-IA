# Problems: 00-api

## 1. `request` replaces the default headers instead of merging them
- **Found:** while writing the tests for `specs/frontend/00-api.md`.
- **Where:** `src/services/api.ts`, function `request`. It calls `fetch(path, { headers: { 'Content-Type': ..., ...init?.headers }, ...init })`. Since `...init` comes last, a caller that passes `init.headers` overwrites the merged headers, and `Content-Type` is lost.
- **Impact today:** none, because no caller passes headers.
- **Decision:** `init.headers` is removed instead of fixed, since no caller needs it. The new `request` only accepts `method` and `body`.
- **Status:** resolved by the decision above. The test for merged headers was removed.

## 2. Doc route changes rewrite the tracked `docs/openapi.yaml`
- **Found:** while planning the integration tests for `specs/frontend/00-api.md`.
- **Where:** `server/src/routes/docs.ts:11`, `OPENAPI_PATH` is fixed to `docs/openapi.yaml` in the repository (a tracked file). Creating, updating or deleting a doc route rewrites it, even when the backend uses a temporary database.
- **Impact:** integration tests for `createDocRoute`, `updateDocRoute`, `deleteDocRoute` and `getOpenApiStatus` would overwrite the real file.
- **Test:** `src/api/tests/integration/docs.test.ts`. Every integration run also guards the real file and restores it if it ever changes (`guardRealOpenApiFile.ts`).
- **Fix (one-time exception, done without a spec):** the backend reads the file location from `OPENAPI_PATH`, defaulting to the same `docs/openapi.yaml` as before (`server/src/config.ts`, `server/src/routes/docs.ts`). The test launcher sets it to a temporary file.
- **Verified:** with `OPENAPI_PATH` set, a created doc route wrote the temporary file and left the real file identical. Without it, the resolved path is the same as the old one.
- **Status:** resolved. Left over: the status response still reports `path: "docs/openapi.yaml"` whatever the real location is.
