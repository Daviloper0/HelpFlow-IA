export interface ValidationResult {
  passed: boolean;
  failureMessage: string;
}

/**
 * Determines whether a test execution passed or failed.
 *
 * Rules (evaluated in order; first failure wins):
 * 1. If the request itself failed (actualStatus === 0), fail immediately.
 * 2. actualStatus must equal expectedStatus.
 * 3. If expectedBody is non-empty, the actual response body must be an exact
 *    JSON match (deep equality, key order ignored).
 */
export function validate(
  actualStatus: number,
  actualBody: string,
  expectedStatus: number,
  expectedBody: string,
  executionError?: string,
): ValidationResult {
  if (actualStatus === 0) {
    return { passed: false, failureMessage: executionError ?? 'Request failed' };
  }

  if (actualStatus !== expectedStatus) {
    return {
      passed: false,
      failureMessage: `Status: esperado ${expectedStatus}, recebido ${actualStatus}`,
    };
  }

  const bodyResult = compareJson(actualBody, expectedBody);
  if (!bodyResult.match) {
    return { passed: false, failureMessage: bodyResult.reason };
  }

  return { passed: true, failureMessage: '' };
}


function compareJson(
  actual: string,
  expected: string,
): { match: true } | { match: false; reason: string } {
  const actualEmpty = !actual.trim();
  const expectedEmpty = !expected.trim();

  if (expectedEmpty && actualEmpty) return { match: true };
  if (expectedEmpty && !actualEmpty) return { match: false, reason: 'Nenhum body era esperado, mas a resposta contém um body' };
  if (!expectedEmpty && actualEmpty) return { match: false, reason: 'Body esperado, mas a resposta não contém body' };

  let parsedActual: unknown;
  let parsedExpected: unknown;

  try {
    parsedExpected = JSON.parse(expected);
  } catch {
    return { match: false, reason: 'expectedBody não é JSON válido' };
  }

  try {
    parsedActual = JSON.parse(actual);
  } catch {
    return { match: false, reason: 'Resposta recebida não é JSON válido' };
  }

  if (!deepEqual(parsedActual, parsedExpected)) {
    return { match: false, reason: 'Body não corresponde ao esperado' };
  }

  return { match: true };
}

function deepEqual(a: unknown, b: unknown): boolean {
  // "{{any}}" in the expected (b) side matches any actual value
  if (b === '{{any}}') return true;

  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, (b as unknown[])[i]));
  }

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);

  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => Object.prototype.hasOwnProperty.call(bObj, key) && deepEqual(aObj[key], bObj[key]));
}
