import { useEffect, useState } from 'react';
import * as api from '../services/api';
import type { OpenApiStatus } from '../types';

/** Situação do arquivo OpenAPI. Fica null enquanto carrega. */
export function useOpenApiStatus(): OpenApiStatus | null {
  const [status, setStatus] = useState<OpenApiStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.getOpenApiStatus().then((result) => {
      if (!cancelled) setStatus(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
