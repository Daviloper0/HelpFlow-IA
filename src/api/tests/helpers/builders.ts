/**
 * Helpers that build test data.
 *
 * A helper is a small function shared by several tests, so each test does not
 * repeat the same setup. These helpers are builders: each returns a complete,
 * valid object, and a test overrides only the fields it is about. That way the
 * reader sees what matters in the test:
 *
 *   createTest(buildEndpointTestCaseDraft({ route: 'tickets' }))  // only the route matters: it is invalid
 *
 * "Draft" objects are what the user sends to the backend to create or edit
 * something, so they have no id yet. The objects without the "Draft" suffix are
 * what the backend sends back, with the id it assigned.
 */
import type { EndpointTestCase, EndpointTestCaseDraft, DocsRoute, DocsRouteDraft, EndpointTestCaseResult } from '../../../types';

/**
 * Builds an endpoint test case as the user enters it, before the backend saves it (a draft), so it has no id.
 *
 * @param overrides - Fields to replace in the default test.
 * @returns A complete `EndpointTestCaseDraft`.
 */
export function buildEndpointTestCaseDraft(overrides: Partial<EndpointTestCaseDraft> = {}): EndpointTestCaseDraft {
  return {
    name: 'List tickets',
    method: 'GET',
    description: '',
    route: '/tickets',
    requestBody: '',
    expectedStatus: 200,
    expectedBody: '',
    category: 'success',
    ...overrides,
  };
}

/**
 * Builds an endpoint test case as the backend returns it after saving, so it has an id.
 *
 * @param overrides - Fields to replace in the default test, including `id` and `lastRun`.
 * @returns A complete `EndpointTestCase`.
 */
export function buildEndpointTestCase(overrides: Partial<EndpointTestCase> = {}): EndpointTestCase {
  return { id: 1, ...buildEndpointTestCaseDraft(), ...overrides };
}

/**
 * Builds the result of running one endpoint test case, as the backend returns it.
 *
 * @param overrides - Fields to replace in the default result.
 * @returns A complete `EndpointTestCaseResult`.
 */
export function buildEndpointTestCaseResult(overrides: Partial<EndpointTestCaseResult> = {}): EndpointTestCaseResult {
  return {
    actualStatus: 200,
    actualBody: '',
    actualRequestBody: '',
    actualRoute: '/tickets',
    at: 1_700_000_000_000,
    passed: true,
    failureMessage: '',
    ...overrides,
  };
}

/**
 * Builds the documentation of a route as the user enters it, before the backend saves it (a draft), so it has no id.
 *
 * @param overrides - Fields to replace in the default documentation.
 * @returns A complete `DocsRouteDraft`.
 */
export function buildDocsRouteDraft(overrides: Partial<DocsRouteDraft> = {}): DocsRouteDraft {
  return {
    method: 'GET',
    route: '/tickets',
    title: 'List tickets',
    description: '',
    requestBody: '',
    successStatus: 200,
    successBody: '[]',
    errors: [],
    ...overrides,
  };
}

/**
 * Builds the documentation of a route as the backend returns it after saving, so it has an id.
 *
 * @param overrides - Fields to replace in the default documentation, including `id`.
 * @returns A complete `DocsRoute`.
 */
export function buildDocsRoute(overrides: Partial<DocsRoute> = {}): DocsRoute {
  return { id: 1, ...buildDocsRouteDraft(), ...overrides };
}
