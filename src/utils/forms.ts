import type {
  ApiTest,
  ApiTestInput,
  DocRouteInput,
  RouteFormValues,
  TestFormValues,
} from '../types';

// Conversões entre os dados da API e os valores (sempre texto) dos formulários.

export function emptyTestForm(): TestFormValues {
  return {
    name: '',
    method: 'GET',
    description: '',
    route: '/api/',
    requestBody: '',
    expectedStatus: '200',
    category: 'success',
    expectedBody: '',
  };
}

export function testToForm(test: ApiTest): TestFormValues {
  return {
    name: test.name,
    method: test.method,
    description: test.description,
    route: test.route,
    requestBody: test.requestBody,
    expectedStatus: String(test.expectedStatus),
    category: test.category,
    expectedBody: test.expectedBody,
  };
}

/** Só chame depois de validar o formulário. */
export function formToTestInput(values: TestFormValues): ApiTestInput {
  return {
    name: values.name.trim(),
    method: values.method,
    description: values.description.trim(),
    route: values.route.trim(),
    requestBody: values.requestBody,
    expectedStatus: Number(values.expectedStatus.trim()),
    category: values.category,
    expectedBody: values.expectedBody,
  };
}

export function routeToForm(route: import('../types').DocRoute): RouteFormValues {
  return {
    title: route.title,
    method: route.method,
    route: route.route,
    description: route.description,
    requestBody: route.requestBody,
    successStatus: String(route.successStatus),
    successBody: route.successBody,
    errors: route.errors.map((e) => ({ status: String(e.status), body: e.body })),
  };
}

export function emptyRouteForm(): RouteFormValues {
  return {
    title: '',
    method: 'GET',
    route: '/api/',
    description: '',
    requestBody: '',
    successStatus: '200',
    successBody: '',
    errors: [],
  };
}

/** Só chame depois de validar o formulário. */
export function formToRouteInput(values: RouteFormValues): DocRouteInput {
  return {
    title: values.title.trim(),
    method: values.method,
    route: values.route.trim(),
    description: values.description.trim(),
    requestBody: values.requestBody,
    successStatus: Number(values.successStatus.trim()),
    successBody: values.successBody,
    errors: values.errors.map((error) => ({
      status: Number(error.status.trim()),
      body: error.body,
    })),
  };
}
