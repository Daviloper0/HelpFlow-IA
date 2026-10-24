import { useCallback, useEffect, useState } from 'react';
import * as api from '../services/api';
import type { DocRoute, DocRouteInput } from '../types';

/** Guarda as rotas documentadas e a ação de adicionar uma nova. */
export function useDocRoutes() {
  const [routes, setRoutes] = useState<DocRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.listDocRoutes().then((list) => {
      if (cancelled) return;
      setRoutes(list);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addRoute = useCallback(async (input: DocRouteInput) => {
    const created = await api.createDocRoute(input);
    setRoutes((list) => [...list, created]);
    return created;
  }, []);

  const updateRoute = useCallback(async (id: number, input: DocRouteInput) => {
    const updated = await api.updateDocRoute(id, input);
    setRoutes((list) => list.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const deleteRoute = useCallback(async (id: number) => {
    await api.deleteDocRoute(id);
    setRoutes((list) => list.filter((r) => r.id !== id));
  }, []);

  return { routes, loading, addRoute, updateRoute, deleteRoute };
}
