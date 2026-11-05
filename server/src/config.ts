/** Runtime configuration read from environment variables. */
export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  /** Base URL of the running HelpFlow API. Test routes are appended to this. */
  helpflowBaseUrl: process.env.HELPFLOW_BASE_URL ?? 'http://localhost:4284',
  /** Milliseconds before an outbound test request is aborted. */
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS ?? '10000', 10),
};
