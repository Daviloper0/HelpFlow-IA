const textEncoder = new TextEncoder();

/**
 * Builds a JSON `Response` with the `Content-Type: application/json` header.
 * @param body Value serialized with `JSON.stringify`.
 * @param status HTTP status code (default 200).
 */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Builds a plain-text `Response`, useful for error bodies.
 * @param body Raw text of the response.
 * @param status HTTP status code.
 */
export function textResponse(body: string, status: number): Response {
  return new Response(body, { status });
}

/**
 * Builds a `Response` with no body, such as a 204.
 * @param status HTTP status code.
 */
export function emptyResponse(status: number): Response {
  return new Response(null, { status });
}

/**
 * Creates a readable byte stream that emits the given chunks in order and then closes.
 * @param chunks Strings (UTF-8 encoded) or raw bytes, one stream chunk each.
 */
export function streamFromChunks(chunks: (string | Uint8Array)[]): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(typeof chunk === 'string' ? textEncoder.encode(chunk) : chunk);
      }
      controller.close();
    },
  });
}

/**
 * Builds a streaming `Response`, used to test chunked reading such as NDJSON.
 * @param chunks Strings or raw bytes, one stream chunk each.
 * @param status HTTP status code (default 200).
 */
export function streamResponse(chunks: (string | Uint8Array)[], status = 200): Response {
  return new Response(streamFromChunks(chunks), { status });
}
