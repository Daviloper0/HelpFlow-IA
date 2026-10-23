// Tipos compartilhados por todo o painel.

export type View = 'analysis' | 'tests' | 'docs';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Categoria do caso de teste: o que ele espera da API. */
export type TestCategory = 'success' | 'validation' | 'expected-error';

/** Situação de um teste na tela. "running" existe só enquanto ele roda. */
export type TestStatus = 'idle' | 'running' | 'pass' | 'fail';

/** Resultado de uma execução de teste. */
export interface TestRun {
  actualStatus: number;
  /** Corpo da resposta recebida, como texto. */
  actualBody: string;
  /** Corpo da requisição enviada, com placeholders já substituídos. */
  actualRequestBody: string;
  /** Rota usada na requisição, com placeholders já substituídos. */
  actualRoute: string;
  /** Momento da execução, em milissegundos (Date.now). */
  at: number;
  /** Determinado pelo backend com base no status e no body esperados. */
  passed: boolean;
  /** Mensagem de falha. Vazia quando passou. */
  failureMessage: string;
}

export interface ApiTest {
  id: number;
  name: string;
  method: HttpMethod;
  description: string;
  route: string;
  /** Corpo enviado na requisição, como texto JSON. Vazio quando não há corpo. */
  requestBody: string;
  expectedStatus: number;
  /** Corpo esperado na resposta, como texto JSON. */
  expectedBody: string;
  category: TestCategory;
  /** Última execução. Fica vazia quando o teste nunca rodou ou foi editado. */
  lastRun?: TestRun;
}

/** Dados que o usuário informa ao criar ou editar um teste. */
export type ApiTestInput = Omit<ApiTest, 'id' | 'lastRun'>;

/** Teste com a situação já calculada, pronto para exibir. */
export interface TestView extends ApiTest {
  status: TestStatus;
  /** Ex.: "Esperado 422, recebido 500". Vazio quando o teste não falhou. */
  failureMessage: string;
}

export interface StatusCounts {
  total: number;
  pass: number;
  fail: number;
  idle: number;
  running: number;
}

// ---- Documentação OpenAPI ----

export interface DocError {
  status: number;
  body: string;
}

export interface DocRoute {
  id: number;
  method: HttpMethod;
  route: string;
  title: string;
  requestBody: string;
  successStatus: number;
  successBody: string;
  errors: DocError[];
}

export type DocRouteInput = Omit<DocRoute, 'id'>;

export type OpenApiValidation = 'valid' | 'warnings' | 'invalid' | 'unvalidated';

export interface OpenApiStatus {
  exists: boolean;
  /** Local do arquivo, ex.: docs/openapi.yaml. */
  path: string;
  updatedAt: number | null;
  validation: OpenApiValidation;
  note: string;
}

// ---- Formulários (os campos são sempre texto até a validação) ----

export interface TestFormValues {
  name: string;
  method: HttpMethod;
  description: string;
  route: string;
  requestBody: string;
  expectedStatus: string;
  category: TestCategory;
  expectedBody: string;
}

export interface RouteFormError {
  /** Identificador estável da linha, usado como key no React. */
  key: number;
  status: string;
  body: string;
}

export interface RouteFormValues {
  title: string;
  method: HttpMethod;
  route: string;
  requestBody: string;
  successStatus: string;
  successBody: string;
  errors: RouteFormError[];
}
