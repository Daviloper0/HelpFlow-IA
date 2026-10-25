import { useCallback, useEffect, useState } from 'react';
import * as api from '../services/api';
import type { OpenApiStatus } from '../types';

/** Situação do arquivo OpenAPI. Fica null enquanto carrega. */
export function useOpenApiStatus(): { status: OpenApiStatus | null; refresh: () => void } {
  const [status, setStatus] = useState<OpenApiStatus | null>(null);

  const refresh = useCallback(() => {
    api.getOpenApiStatus().then(setStatus);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, refresh };
}
