import path from 'path';

/** Runtime configuration that comes from environment variables. */
export const config = {
  /** Port the dashboard server listens on. Env: PORT (default 3001). */
  port: parseInt(process.env.PORT ?? '3001', 10),

  /** Base URL of the HelpFlow API under test. Env: HELPFLOW_BASE_URL (default http://localhost:4284). */
  helpflowBaseUrl: process.env.HELPFLOW_BASE_URL ?? 'http://localhost:4284',

  /** Milliseconds before an outbound test request is aborted. Env: REQUEST_TIMEOUT_MS (default 10000). */
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS ?? '10000', 10),

  /** Where the generated OpenAPI file is written. Env: OPENAPI_PATH (default docs/openapi.yaml at the dashboard root). */
  openApiPath: process.env.OPENAPI_PATH ?? path.join(__dirname, '../../docs/openapi.yaml'),
};
