import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { PlayIcon, PlusIcon, SearchIcon } from '../../components/ui/icons';
import { PageHeader } from '../../components/ui/PageHeader';
import { getCategory } from '../../constants/http';
import type { ApiTestInput, StatusCounts, TestView } from '../../types';
import { normalizeText } from '../../utils/text';
import { countStatuses } from '../../utils/testStatus';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { TestCard } from './TestCard';
import { TestFormModal } from './TestFormModal';
import styles from './TestsPage.module.css';

/** Por quanto tempo o teste fica destacado depois de vir da tela de Análise. */
const HIGHLIGHT_MS = 3200;

interface TestsPageProps {
  tests: TestView[];
  loading: boolean;
  isRunningAny: boolean;
  /** Teste a destacar e rolar até ele (vindo da tela de Análise). */
  focusTestId: number | null;
  onFocusDone: () => void;
  onRunTest: (id: number) => void;
  onRunAll: () => void;
  /** Cria um teste, ou atualiza o existente quando recebe o id. */
  onSave: (input: ApiTestInput, id?: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

/** Módulo "Testes de API": lista, busca, execução e edição dos testes. */
export function TestsPage({
  tests,
  loading,
  isRunningAny,
  focusTestId,
  onFocusDone,
  onRunTest,
  onRunAll,
  onSave,
  onDelete,
}: TestsPageProps) {
  const [query, setQuery] = useState('');
  // "new" = formulário de novo teste; um teste = formulário de edição.
  const [editing, setEditing] = useState<TestView | 'new' | null>(null);
  const [deleting, setDeleting] = useState<TestView | null>(null);

  const counts = useMemo(() => countStatuses(tests), [tests]);
  const filteredTests = useMemo(() => filterTests(tests, query), [tests, query]);
  const hasQuery = query.trim() !== '';

  // Rola até o teste pedido pela tela de Análise e remove o destaque depois de um tempo.
  useEffect(() => {
    if (focusTestId === null || loading) return;

    const element = document.getElementById(`test-${focusTestId}`);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });

    const timer = setTimeout(onFocusDone, HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [focusTestId, loading, onFocusDone]);

  async function handleSave(input: ApiTestInput) {
    await onSave(input, editing && editing !== 'new' ? editing.id : undefined);
    setEditing(null);
  }

  async function handleDelete(test: TestView) {
    await onDelete(test.id);
    setDeleting(null);
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Testes de API"
        description="Valide as rotas do backend: método, corpo enviado, status HTTP e valor esperado da resposta."
        actions={
          <>
            <Button icon={<PlusIcon />} onClick={() => setEditing('new')}>
              Novo teste
            </Button>
            <Button
              variant="primary"
              icon={<PlayIcon size={18} />}
              disabled={isRunningAny || tests.length === 0}
              onClick={onRunAll}
            >
              {isRunningAny ? 'Executando…' : 'Rodar todos'}
            </Button>
          </>
        }
      />

      <StatusSummary counts={counts} />

      <div className={styles.searchRow}>
        <div className={styles.search}>
          <span className={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            type="search"
            className={styles.searchInput}
            aria-label="Buscar testes"
            placeholder="Buscar por nome, rota, método ou descrição"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <span className={styles.shownText}>
          {hasQuery
            ? `Mostrando ${filteredTests.length} de ${tests.length} testes`
            : `${tests.length} ${tests.length === 1 ? 'teste' : 'testes'}`}
        </span>
      </div>

      {loading ? (
        <p className={styles.loading}>Carregando testes…</p>
      ) : (
        <ul className={styles.list}>
          {filteredTests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              highlighted={test.id === focusTestId}
              onRun={() => onRunTest(test.id)}
              onEdit={() => setEditing(test)}
              onDelete={() => setDeleting(test)}
            />
          ))}
        </ul>
      )}

      {!loading && filteredTests.length === 0 && (
        <EmptyState>
          <p>
            {hasQuery
              ? `Nenhum teste encontrado para “${query.trim()}”.`
              : 'Nenhum teste cadastrado ainda. Crie o primeiro em “Novo teste”.'}
          </p>
          {hasQuery && <Button onClick={() => setQuery('')}>Limpar busca</Button>}
        </EmptyState>
      )}

      {editing && (
        <TestFormModal
          test={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSubmit={handleSave}
        />
      )}

      {deleting && (
        <ConfirmDeleteModal
          testName={deleting.name}
          onCancel={() => setDeleting(null)}
          onConfirm={() => handleDelete(deleting)}
        />
      )}
    </div>
  );
}

/** Filtra por nome, descrição, rota, método e categoria, ignorando acentos e maiúsculas. */
function filterTests(tests: TestView[], query: string): TestView[] {
  const normalizedQuery = normalizeText(query.trim());
  if (!normalizedQuery) return tests;

  return tests.filter((test) => {
    const text = [test.name, test.description, test.route, test.method, getCategory(test.category).label].join(' ');
    return normalizeText(text).includes(normalizedQuery);
  });
}

function StatusSummary({ counts }: { counts: StatusCounts }) {
  const items = [
    { label: 'testes', value: counts.total, color: '#121722' },
    { label: 'aprovados', value: counts.pass, color: '#1F9254' },
    { label: 'falharam', value: counts.fail, color: '#D23B2E' },
    { label: 'não executados', value: counts.idle, color: '#8791A3' },
  ];

  return (
    <div className={styles.summary} aria-live="polite">
      {items.map((item) => (
        <span key={item.label} className={styles.summaryItem}>
          <span className={styles.summaryDot} style={{ backgroundColor: item.color }} />
          <strong>{item.value}</strong> {item.label}
        </span>
      ))}
      {counts.running > 0 && (
        <span className={styles.summaryItem}>
          <span className={`${styles.summaryDot} ${styles.pulse}`} style={{ backgroundColor: '#2347C5' }} />
          <strong>{counts.running}</strong> em execução
        </span>
      )}
    </div>
  );
}
