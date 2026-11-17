# 01 - Type names

File affected: `src/types/index.ts`, and every file that uses these types (45 files in `src/`, including the tests in `src/api/`).

## Purpose
Rename the types whose names do not say what they are. Behavior does not change; only names do.

Problems with the current names:
- The `Api` prefix says nothing: the whole app is about API testing.
- `Input` does not say input to what, and `Doc` is an abbreviation.
- `TestRun`, `SuiteRun` and `SuiteRunExecution` look alike but are three different things.

## Naming scheme
- A type used only by one frontend module gets the name of that module as a prefix: `Docs` for the docs module and `Statistics` for the statistics module.
- The `analysis` module owns no types of its own: it only displays data that belongs to the others.
- The types about tests are used by several modules (tests, analysis, docs), so they do not get a module prefix. They use the concept name `EndpointTest` instead: a test that calls an endpoint of the HelpFlow API.
- A `Draft` suffix means the object as the user fills it in, before it is saved, so it has no `id`.
- Long names are accepted when they explain more.

## Names
Every name below is approved.

| Today | New name | What it is | Decision |
|---|---|---|---|
| `ApiTest` | `EndpointTestCase` | A test case that calls a HelpFlow endpoint and checks the answer, as the backend stores it (has an `id`). | approved |
| `ApiTestInput` | `EndpointTestCaseDraft` | The same, as the user fills it in, before it is saved (no `id`). | approved |
| `TestRun` | `EndpointTestCaseResult` | The result of running one test case. | approved |
| `TestView` | `EndpointTestCaseView` | A test case with its status already computed for display. | approved |
| `TestFormValues` | `EndpointTestCaseFormValues` | The text fields of the test form. | approved |
| `StatusCounts` | `EndpointTestStatusCounts` | How many test cases are in each status. | approved |
| `TestStatus` | `EndpointTestStatus` | The situation of a test case on screen: `idle`, `running`, `pass` or `fail`. | approved |
| `TestCategory` | `EndpointTestCategory` | What a test case expects from the API: `success`, `validation` or `expected-error`. | approved |
| `DocRoute` | `DocsRoute` | The documentation of one route, as the backend stores it (has an `id`). | approved |
| `DocRouteInput` | `DocsRouteDraft` | The same, as the user fills it in, before it is saved (no `id`). | approved |
| `DocError` | `DocsErrorResponse` | One documented error answer of a route. | approved |
| `OpenApiStatus` | `DocsOpenApiFileStatus` | The status of the generated OpenAPI file. | approved |
| `RouteFormValues` | `DocsRouteFormValues` | The text fields of the route documentation form. | approved |
| `RouteFormError` | `DocsRouteFormError` | One error row of the route documentation form. | approved |
| `SuiteRun` | `StatisticsSuiteExecution` | All test cases run together, with totals and timing. | approved |
| `SuiteRunExecution` | `StatisticsEndpointTestResultInSuite` | One test case's result inside a suite execution. | approved |
| `GlobalStats` | `StatisticsOverview` | The overall numbers of the statistics page. | approved |
| `TestDurationPoint` | `StatisticsEndpointTestDuration` | How long one test took in one suite execution. | approved |
| `PassingTestStat` | `StatisticsPassingEndpointTest` | Pass streak and pass rate of one test. | approved |
| `FailingTestStat` | `StatisticsFailingEndpointTest` | Fail streak and fail rate of one test. | approved |
| `SuiteRunSpeedEntry` | `StatisticsSpeedEntry` | The fastest or slowest test of a suite execution. | approved |
| `PassRatePoint` | `StatisticsPassRatePoint` | One point of the pass rate chart. | approved |
| `RegressionEntry` | `StatisticsRegressionEntry` | One test that regressed. | approved |

Not renamed: `View`, `HttpMethod`, and all field names.

## Rules
- Only type names change. Field names, functions and behavior stay as they are.
- A new name must not collide with an existing identifier. Check before renaming.
- Every use is renamed in the same change: `src/` (hooks, modules, utils, `src/api/` and its tests).
- `specs/frontend/00-api.md` already uses the new names, and so does the code since this spec was implemented.
- A builder in `src/api/tests/helpers/builders.ts` is named `build` plus the name of the type it returns. For example `buildEndpointTestCaseDraft` and `buildDocsRoute`. The comment at the top of that file, which explains "Unsaved" and "Saved", changes to explain `Draft` instead.
- The comments in `src/types/index.ts` are in Portuguese and are translated to English in the same change (CLAUDE.md rule 7).

## Verification
There is no new behavior, so no new tests. The checks are:
- `npm run typecheck`: the list of errors must be the same as before the rename (12 errors today), only with the new names where a type is mentioned.
- `npm test`: the result must be the same as before.
- A search for the old names finds nothing in `src/` or in the specs that are read (see CLAUDE.md for the ignored ones).

## Order
- This spec is implemented before `00-api`, so the new `src/api/` files use the final names from the start.

## Points to review in this spec
None open.
