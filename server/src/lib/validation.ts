/** Input validation for test case fields coming from the frontend. */

const VALID_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
const VALID_CATEGORIES = ['success', 'validation', 'expected-error'] as const;

export interface ValidatedTestInput {
  name: string;
  method: string;
  description: string;
  route: string;
  requestBody: string;
  expectedStatus: number;
  expectedBody: string;
  category: string;
}

export function validateTestInput(body: unknown): { ok: true; data: ValidatedTestInput } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const b = body as Record<string, unknown>;

  if (typeof b.name !== 'string' || !b.name.trim()) {
    return { ok: false, error: 'name is required' };
  }

  if (!VALID_METHODS.includes(b.method as never)) {
    return { ok: false, error: `method must be one of ${VALID_METHODS.join(', ')}` };
  }

  if (typeof b.route !== 'string' || !b.route.startsWith('/')) {
    return { ok: false, error: 'route must be a string starting with /' };
  }

  const expectedStatus = Number(b.expectedStatus);
  if (!Number.isInteger(expectedStatus) || expectedStatus < 100 || expectedStatus > 599) {
    return { ok: false, error: 'expectedStatus must be an integer between 100 and 599' };
  }

  if (!VALID_CATEGORIES.includes(b.category as never)) {
    return { ok: false, error: `category must be one of ${VALID_CATEGORIES.join(', ')}` };
  }

  const requestBody = typeof b.requestBody === 'string' ? b.requestBody : '';
  if (requestBody.trim()) {
    try { JSON.parse(requestBody); } catch {
      return { ok: false, error: 'requestBody must be valid JSON when provided' };
    }
  }

  const expectedBody = typeof b.expectedBody === 'string' ? b.expectedBody : '';
  if (expectedBody.trim()) {
    try { JSON.parse(expectedBody); } catch {
      return { ok: false, error: 'expectedBody must be valid JSON when provided' };
    }
  }

  return {
    ok: true,
    data: {
      name: b.name.trim(),
      method: b.method as string,
      description: typeof b.description === 'string' ? b.description : '',
      route: b.route,
      requestBody,
      expectedStatus,
      expectedBody,
      category: b.category as string,
    },
  };
}

export function validateDocRouteInput(body: unknown): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const b = body as Record<string, unknown>;

  if (typeof b.title !== 'string' || !b.title.trim()) {
    return { ok: false, error: 'title is required' };
  }

  if (!VALID_METHODS.includes(b.method as never)) {
    return { ok: false, error: `method must be one of ${VALID_METHODS.join(', ')}` };
  }

  if (typeof b.route !== 'string' || !b.route.startsWith('/')) {
    return { ok: false, error: 'route must start with /' };
  }

  const successStatus = Number(b.successStatus);
  if (!Number.isInteger(successStatus) || successStatus < 100 || successStatus > 599) {
    return { ok: false, error: 'successStatus must be an integer between 100 and 599' };
  }

  return { ok: true, data: b };
}
