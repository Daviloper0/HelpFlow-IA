# Server crash: `Assertion failed: (env) != nullptr`

## The crash

```
node::RemoveEnvironmentCleanupHook - Assertion failed: (env) != nullptr
Statement::scalar deleting destructor
```

This crash comes from `better-sqlite3`. Every `db.prepare(sql)` call creates a Statement object
that registers a **cleanup hook** with the Node.js V8 environment. When that Statement is
garbage-collected, its finalizer runs `RemoveEnvironmentCleanupHook` to unregister the hook.
If the V8 environment has already been torn down by the time the GC runs that finalizer → crash.

## Three triggers (all produce the same crash)

1. Clicking "Incluir/Ignorar offline" toggle repeatedly
2. Switching rapidly between the Failed Tests modal and Passing Tests modal
3. (Earlier) clicking batch-hide for many offline runs

**What is common:** All three involve **multiple rapid HTTP requests** hitting the server in quick
succession. Each request calls `db.prepare(sql)` inside the route handler. That creates a new
Statement object, uses it, and drops the reference. The Statement is now eligible for GC but
has not been collected yet. After many requests, many of these orphaned Statement objects are
sitting in GC limbo.

At some point `node --watch` detects a file change and sends SIGTERM to restart the process.
The process starts shutting down. V8 eventually runs the GC finalizers for those orphaned
Statements — but by then the Node environment is already gone → assertion failure.

---

## What was tried and did NOT fix it

### 1. `--watch-path src` (space syntax)
```
node --watch --watch-path src --require tsx/cjs src/index.ts
```
Tried to limit what `node --watch` restarts on. Did not fix the crash. Likely never took
effect — the argument parser may need `--watch-path=./src` (equals sign).

### 2. Switching to `tsx watch`
```
tsx watch src/index.ts
```
Made things worse: server crashed on startup, before any request was made. `tsx watch` appears
to detect our recently-edited files immediately and restart the child process before it finishes
initializing, causing SIGTERM to arrive mid-startup when better-sqlite3 hasn't finished its
migration queries yet.

### 3. SIGTERM handler with `process.exit(0)`
```ts
process.on('SIGTERM', () => { db.close(); process.exit(0); });
```
`process.exit(0)` tears down the V8 environment **synchronously and immediately**. Any
Statement objects still in GC limbo are finalized AFTER this call, after the environment
is already gone → same crash.

### 4. SIGTERM handler with re-raise (`process.kill(process.pid, 'SIGTERM')`)
```ts
process.once('SIGTERM', () => { closeDb(); process.kill(process.pid, 'SIGTERM'); });
process.on('exit', closeDb);
```
Current state. `db.close()` is called, which finalizes all *known* live Statements. But
orphaned Statements (went out of scope before `db.close()` was called, not yet GC'd) are
**not known to the database** — they removed themselves from `db.stmts` when they went out
of scope. So `db.close()` does not close them, their hooks remain registered, and if the GC
runs their finalizers after teardown → still crashes.

---

## Root cause (revised)

The problem is architectural: **`db.prepare(sql)` is called inside every request handler**,
creating a new Statement object on each call. These ephemeral Statements go out of scope
immediately but are not GC'd right away. They accumulate in GC limbo during a burst of
requests. When `node --watch` restarts the process (for any reason), those orphaned
Statements crash the shutdown.

`db.close()` only helps for Statements that are still referenced (still in `db.stmts`).
An out-of-scope Statement that hasn't been GC'd yet has already removed itself from `db.stmts`,
so `db.close()` cannot reach it.

---

## What should actually fix it

**Prepare statements once at module level and reuse them.** If a Statement is prepared once
and kept alive (referenced by a module-level variable), it is always in `db.stmts`. When
`db.close()` is called, it properly finalizes it and removes its cleanup hook. No orphaned
Statements → no crash.

This means refactoring all `db.prepare(sql).all(...)` / `.run(...)` / `.get(...)` calls that
are currently inside route handlers or query functions, moving the `db.prepare()` call to
module level and reusing the Statement object per call.

Alternatively: a single batch API endpoint that replaces N individual requests with 1,
reducing the number of Statement objects created per user action — a band-aid but not a
real fix.

---

## Fix applied

All `db.prepare()` calls moved to module level in:
- `server/src/db/queries.ts` — every query function now reuses a module-level Statement constant
- `server/src/routes/docs.ts` — all inline prepares in route handlers and `rowToJson` hoisted to top of file
- `server/src/routes/tests.ts` — duration-history inline prepare replaced with exported `stmtDurationHistory` from queries.ts

`getPassingTestsStats` and `getFailingTestsStats` now share a single `stmtAllExecHistory` statement
since they use identical SQL.

The `process.once('SIGTERM')` / `process.on('exit')` cleanup handlers in `schema.ts` remain as a
safety net: `db.close()` finalizes all live module-level Statements cleanly on shutdown.

---

## Server crash: `"await" can only be used inside an "async" function`

### The crash

```
Error: Transform failed with 1 error:
docs.ts:196:2: ERROR: "await" can only be used inside an "async" function
```

esbuild (used by tsx/cjs) rejects `await` inside a non-async function at compile time, so the
server fails to start entirely.

### Cause

After adding `async writeOpenApi()` and calling `await writeOpenApi()` inside the three Express
route handlers (POST, PUT, DELETE on `/doc-routes`), the handler callbacks were still declared
as plain synchronous functions `(req, res) => { ... }` instead of `async (req, res) => { ... }`.

### Fix applied

Added `async` to the three handler callbacks in `server/src/routes/docs.ts`:
- `docsRouter.post('/doc-routes', async (req, res) => {`
- `docsRouter.put('/doc-routes/:id', async (req, res) => {`
- `docsRouter.delete('/doc-routes/:id', async (req, res) => {`
