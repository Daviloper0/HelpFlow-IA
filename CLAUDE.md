# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

HelpFlow Dashboard is a React + Express tool for testing and analyzing the [HelpFlow](https://github.com/Daviloper0/helpflow) Haskell API. It lets you define HTTP test cases, run them as a suite against the live HelpFlow backend, inspect results, and generate OpenAPI documentation from tests.'

## Running locally

The project has two independent processes. Run each in a separate terminal from the repo root:

```bash
# Frontend (Vite + React)
npm run dev

# Backend (Express + SQLite)
cd server
npm run dev
```

The backend watches `server/src/` and restarts on change. Frontend hot-reloads via Vite.

## Build & type-check

```bash
# Frontend
npm run build        # tsc --noEmit + vite build
npm run typecheck    # tsc --noEmit only

# Backend
cd server
npm run typecheck
```

There are no automated tests in this repo.

## Architecture

**Frontend** (`src/`) — React SPA built with Vite. Uses Recharts for graphs. API calls go through `src/api/` using relative `/api/...` paths; `vite.config.ts` proxies `/api` to `http://localhost:3001`. No routing library; it's a single-page dashboard.

**Backend** (`server/src/`) — Express server with four route files:
- `routes/tests.ts` — CRUD for test definitions
- `routes/runner.ts` — executes a suite or individual test against the HelpFlow target URL
- `routes/suiteRuns.ts` — history and stats for past suite runs
- `routes/docs.ts` — generates and serves OpenAPI YAML from stored test data

**Database** (`server/src/db/`) — SQLite via `better-sqlite3`. Schema is applied on startup in `schema.ts`. Migrations are done inline with `addCol()` helper (swallows "duplicate column" errors). DB file lives at `server/data/helpflow.db` by default; override with `DB_PATH` env var.

**Config** (`server/src/config.ts`) — reads `PORT` (default 3001), `HELPFLOW_BASE_URL` (target API under test, default `http://localhost:4284`) and `REQUEST_TIMEOUT_MS` (default 10000) and `OPENAPI_PATH` (where the generated OpenAPI file is written, default `docs/openapi.yaml`). The frontend also hardcodes the HelpFlow URL in `src/constants/http.ts`.

**OpenAPI generation** (`routes/docs.ts`) — builds an OpenAPI 3 spec from the `doc_routes` and `doc_route_errors` tables, then validates it with `@apidevtools/swagger-parser`.

## Prerequisites

- Node.js
- Desktop Development with C++ (Visual Studio) — required by `better-sqlite3` native bindings

## Spec Driven Development
Before writing any code, check the specs in specs/. Don't implement anything until there is a spec for your development. All codes MUST have tests before implementation, and you shouldn't do the implementation without my approval to do it. In the specs folder, ignore the dashboard-bspec.md and dashboard-vspec.md files, every full_log.md file (they are historic logs), and specs/frontend/features.md (also historic). Everything else you should look.

There is also a problems folder. Everytime you are implementing a spec, and there is a problem, you should look into the problems/ folder. Every file in the problems file is related to a spec. For example, if you are developing an ficticious spec 00-automated-tests.md, and you encounter a problem, you should check the problems folder, if there is no 00-automated-tests.md, you should create it. Notice that that is just an example.

Everytime you change something in the code, you should make a list, of all the files that were changed. Show the list on the chat, no need to create a new file.

## What you shouldn't do
* Don't implement anything that isn't on spec.
* Always try to find errors or incoherences in the spec.
* If there is not a SPEC, don't create it without my explicit authorization.
* You must not access other files in my folders, stay here in the HelpFlow-IA folder. 
* If something changes, AFTER i created the spec files, you should update it.

## What you must do before and while coding
1. Always plan before coding, and wait for my permission to continue
2. If it's a bug, then check the problems/ folder when you run into it. If it's the first time you are running into this problem, then create a file, incrementating the "id" from the problems. The ID should match the spec you are working.
3. Check if there is already a library that does what you want, and if it exists, then tell me.

## How you should code
1. Small and testable functions, ALWAYS, as well as folders. Group them in modules.
2. Readable names that tell what's going on, so, no variables called a, b, c, or something that isn't meaningful.
3. Use the don't repeat yourself principle.
4. If a function uses a type, then it should match the type/interface it's based on.
5. There should NEVER be any kind of MOCK server in the application code. Exception: tests may use fakes and stub servers (for example a stub of the HelpFlow API, or fake `fetch` responses).
6. If you change a file name, change the imports for every other file that uses it.
7. If you are writing comments on code, then it should be in english