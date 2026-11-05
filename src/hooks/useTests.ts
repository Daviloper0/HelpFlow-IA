import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../services/api';
import type { ApiTest, ApiTestInput } from '../types';
import { toTestView } from '../utils/testStatus';

function withId(ids: ReadonlySet<number>, id: number, present: boolean): ReadonlySet<number> {
  const next = new Set(ids);
  if (present) next.add(id);
  else next.delete(id);
  return next;
}

/** Guarda a lista de testes, quais estão rodando e as ações sobre eles. */
export function useTests() {
  const [tests, setTests] = useState<ApiTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningIds, setRunningIds] = useState<ReadonlySet<number>>(new Set());

  // Cópia sempre atual da lista, para as ações lerem sem depender de closures antigas.
  const testsRef = useRef(tests);
  testsRef.current = tests;

  useEffect(() => {
    let cancelled = false;
    api.listTests().then((list) => {
      if (cancelled) return;
      setTests(list);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const runTest = useCallback(async (id: number, startDelayMs = 0) => {
    const test = testsRef.current.find((item) => item.id === id);
    if (!test) return;

    setRunningIds((ids) => withId(ids, id, true));
    try {
      if (startDelayMs > 0) await sleep(startDelayMs);
      const run = await api.runTest(test);
      // Se o teste foi editado durante a execução, o resultado antigo é descartado.
      setTests((list) => list.map((item) => (item === test ? { ...item, lastRun: run } : item)));
    } finally {
      setRunningIds((ids) => withId(ids, id, false));
    }
  }, []);

  const runAll = useCallback(async () => {
    setRunningIds(new Set(testsRef.current.map((t) => t.id)));
    try {
      await api.runAll((result) => {
        const { testId, ...run } = result;
        setRunningIds((ids) => withId(ids, testId, false));
        setTests((list) =>
          list.map((item) => (item.id === testId ? { ...item, lastRun: run } : item)),
        );
      });
    } finally {
      setRunningIds(new Set());
    }
  }, []);

  /** Cria um teste novo, ou atualiza o existente quando recebe o id. */
  const saveTest = useCallback(async (input: ApiTestInput, id?: number) => {
    if (id === undefined) {
      const created = await api.createTest(input);
      setTests((list) => [created, ...list]);
    } else {
      const updated = await api.updateTest(id, input);
      setTests((list) => list.map((item) => (item.id === id ? updated : item)));
    }
  }, []);

  const deleteTest = useCallback(async (id: number) => {
    await api.deleteTest(id);
    setTests((list) => list.filter((item) => item.id !== id));
  }, []);

  const views = useMemo(() => tests.map((test) => toTestView(test, runningIds)), [tests, runningIds]);

  return {
    tests: views,
    loading,
    isRunningAny: runningIds.size > 0,
    runTest,
    runAll,
    saveTest,
    deleteTest,
  };
}
