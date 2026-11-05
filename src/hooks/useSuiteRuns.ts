import { useCallback, useEffect, useState } from 'react';
import * as api from '../services/api';
import type { GlobalStats, SuiteRun } from '../types';

export function useSuiteRuns() {
  const [runs, setRuns] = useState<SuiteRun[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([api.listSuiteRuns(), api.getGlobalStats()]).then(([list, globalStats]) => {
      setRuns(list);
      setStats(globalStats);
      setLoading(false);
    });
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const toggleHidden = useCallback(async (id: number, hidden: boolean) => {
    await api.setSuiteRunHidden(id, hidden);
    reload();
  }, [reload]);

  const batchHidden = useCallback(async (ids: number[], hidden: boolean) => {
    await Promise.all(ids.map((id) => api.setSuiteRunHidden(id, hidden)));
    reload();
  }, [reload]);

  return { runs, stats, loading, reload, toggleHidden, batchHidden };
}
