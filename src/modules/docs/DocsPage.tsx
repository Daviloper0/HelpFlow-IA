import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { PlusIcon } from '../../components/ui/icons';
import { PageHeader } from '../../components/ui/PageHeader';
import type { ApiTest, DocRoute, DocRouteInput } from '../../types';
import { RouteCard } from './RouteCard';
import { RouteFormModal } from './RouteFormModal';
import styles from './DocsPage.module.css';

interface DocsPageProps {
  routes: DocRoute[];
  tests: ApiTest[];
  loading: boolean;
  onAddRoute: (input: DocRouteInput) => Promise<DocRoute>;
  onUpdateRoute: (id: number, input: DocRouteInput) => Promise<DocRoute>;
  onDeleteRoute: (id: number) => Promise<void>;
}

interface RouteGroup {
  key: string; // "METHOD:route"
  successCandidates: ApiTest[];
  errorTests: ApiTest[];
}

function buildInputFromGroup(winner: ApiTest, errorTests: ApiTest[]): DocRouteInput {
  return {
    method: winner.method,
    route: winner.route,
    title: winner.name,
    description: '',
    requestBody: winner.requestBody,
    successStatus: winner.expectedStatus,
    successBody: winner.expectedBody,
    errors: errorTests.map((t) => ({ status: t.expectedStatus, body: t.expectedBody })),
  };
}

function buildPrompt(created: DocRouteInput[]): string {
  const lines: string[] = [
    'Você é um especialista em APIs REST. As rotas abaixo foram geradas automaticamente a partir de testes de API do projeto HelpFlow (backend Haskell/Servant).',
    'Para cada rota, faça o seguinte:',
    '1. Escreva uma descrição clara e objetiva do que a rota faz.',
    '2. IMPORTANTE: alguns testes de casos extremos (edge cases) foram descartados durante a geração. Esses cenários DEVEM ser mencionados na descrição da rota, mesmo que não apareçam como erros listados.',
    '3. Adicione casos de erro que o backend realmente retorna mas que não estão cobertos pelos testes (ex.: autenticação, permissão, conflito, recurso não encontrado). Não invente erros que não existem no backend.',
    '4. Não altere os campos já preenchidos (método, rota, status de sucesso, corpo de sucesso, corpo da requisição).',
    '',
    'Rotas criadas:',
    '',
  ];

  for (const r of created) {
    lines.push(`### ${r.method} ${r.route}`);
    lines.push(`Título: ${r.title}`);
    if (r.requestBody) lines.push(`Corpo da requisição: ${r.requestBody}`);
    lines.push(`Sucesso: ${r.successStatus}${r.successBody ? ` — ${r.successBody}` : ''}`);
    if (r.errors.length > 0) {
      lines.push('Erros já documentados (dos testes):');
      for (const e of r.errors) lines.push(`  - ${e.status}: ${e.body}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function CompareCandidate({ test, selected, onSelect }: {
  test: ApiTest;
  selected: boolean;
  onSelect: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.candidate} ${selected ? styles.candidateSelected : ''}`}>
      <div className={styles.candidateHeader}>
        <input
          type="radio"
          checked={selected}
          onChange={onSelect}
          className={styles.candidateRadio}
        />
        <button className={styles.candidateToggle} onClick={() => setOpen((o) => !o)}>
          <span className={styles.candidateName}>{test.name}</span>
          <span className={styles.candidateChevron}>{open ? '▲' : '▼'}</span>
        </button>
      </div>
      {open && (
        <div className={styles.candidateBody}>
          {test.requestBody && (
            <div className={styles.candidateField}>
              <span className={styles.candidateLabel}>Corpo da requisição</span>
              <pre className={styles.candidatePre}>{test.requestBody}</pre>
            </div>
          )}
          {test.expectedBody && (
            <div className={styles.candidateField}>
              <span className={styles.candidateLabel}>Corpo esperado</span>
              <pre className={styles.candidatePre}>{test.expectedBody}</pre>
            </div>
          )}
          {test.description && (
            <div className={styles.candidateField}>
              <span className={styles.candidateLabel}>Descrição do teste</span>
              <span>{test.description}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type Modal =
  | { kind: 'allDone' }
  | { kind: 'compare'; groups: RouteGroup[]; selections: Record<string, number>; pendingSingle: DocRouteInput[] }
  | { kind: 'prompt'; prompt: string; copied: boolean };

/** Módulo "Documentação OpenAPI": lista das rotas, cada uma em um card que abre e fecha. */
export function DocsPage({ routes, tests, loading, onAddRoute, onUpdateRoute, onDeleteRoute }: DocsPageProps) {
  // Só um card fica aberto por vez. null = todos recolhidos.
  const [openId, setOpenId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<DocRoute | null>(null);
  const [modal, setModal] = useState<Modal | null>(null);
  const [generating, setGenerating] = useState(false);

  async function handleAdd(input: DocRouteInput) {
    const created = await onAddRoute(input);
    setOpenId(created.id);
    setAdding(false);
  }

  async function handleEdit(input: DocRouteInput) {
    if (!editing) return;
    await onUpdateRoute(editing.id, input);
    setEditing(null);
  }

  async function handleDelete(id: number) {
    await onDeleteRoute(id);
    if (openId === id) setOpenId(null);
  }

  async function createAndShowPrompt(inputs: DocRouteInput[]) {
    setGenerating(true);
    for (const input of inputs) await onAddRoute(input);
    setGenerating(false);
    setModal({ kind: 'prompt', prompt: buildPrompt(inputs), copied: false });
  }

  async function handleGenerate() {
    const docKeys = new Set(routes.map((r) => `${r.method}:${r.route}`));

    // Group tests by method+route, only for routes not yet documented
    const groupMap = new Map<string, RouteGroup>();
    for (const t of tests) {
      const key = `${t.method}:${t.route}`;
      if (docKeys.has(key)) continue;
      if (!groupMap.has(key)) groupMap.set(key, { key, successCandidates: [], errorTests: [] });
      const g = groupMap.get(key)!;
      if (t.category === 'success') g.successCandidates.push(t);
      else g.errorTests.push(t);
    }

    // Only keep groups that have at least one success candidate
    const groups = [...groupMap.values()].filter((g) => g.successCandidates.length > 0);

    if (groups.length === 0) {
      setModal({ kind: 'allDone' });
      return;
    }

    const needsComparison = groups.filter((g) => g.successCandidates.length > 1);
    const singleGroups = groups.filter((g) => g.successCandidates.length === 1);
    const pendingSingle = singleGroups.map((g) => buildInputFromGroup(g.successCandidates[0], g.errorTests));

    if (needsComparison.length > 0) {
      setModal({ kind: 'compare', groups: needsComparison, selections: {}, pendingSingle });
      return;
    }

    await createAndShowPrompt(pendingSingle);
  }

  async function handleConfirmCompare() {
    if (modal?.kind !== 'compare') return;
    const allComplete = modal.groups.every((g) => modal.selections[g.key] !== undefined);
    if (!allComplete) return;

    const fromComparison = modal.groups.map((g) => {
      const winner = g.successCandidates[modal.selections[g.key]];
      return buildInputFromGroup(winner, g.errorTests);
    });

    setModal(null);
    await createAndShowPrompt([...modal.pendingSingle, ...fromComparison]);
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Documentação OpenAPI"
        description="Rotas da API do HelpFlow, com exemplo de requisição e das respostas esperadas, incluindo erros."
        actions={
          <div className={styles.headerActions}>
            <Button
              variant="secondary"
              onClick={handleGenerate}
              disabled={generating || loading}
            >
              {generating ? 'Gerando…' : 'Gerar à partir dos testes'}
            </Button>
            <Button variant="primary" icon={<PlusIcon />} onClick={() => setAdding(true)}>
              Adicionar rota
            </Button>
          </div>
        }
      />

      <span className={styles.count}>
        {routes.length} {routes.length === 1 ? 'rota documentada' : 'rotas documentadas'}
      </span>

      {loading ? (
        <p className={styles.loading}>Carregando rotas…</p>
      ) : (
        <ul className={styles.list}>
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              open={route.id === openId}
              onToggle={() => setOpenId(route.id === openId ? null : route.id)}
              onEdit={() => setEditing(route)}
              onDelete={() => handleDelete(route.id)}
            />
          ))}
        </ul>
      )}

      {!loading && routes.length === 0 && (
        <EmptyState>
          <p>Nenhuma rota documentada ainda. Use “Adicionar rota” para criar a primeira.</p>
        </EmptyState>
      )}

      {adding && <RouteFormModal onClose={() => setAdding(false)} onSubmit={handleAdd} />}
      {editing && <RouteFormModal onClose={() => setEditing(null)} onSubmit={handleEdit} initialRoute={editing} />}

      {modal?.kind === 'compare' && (
        <div className={styles.overlay}>
          <div className={styles.compareDialog}>
            <h2 className={styles.compareTitle}>Selecione o teste principal de cada rota</h2>
            <p className={styles.compareSubtitle}>
              Algumas rotas têm mais de um teste de sucesso. Escolha qual representa o caso geral.
              Os demais serão descartados, mas o prompt gerado irá instruir a IA a cobri-los na descrição da rota.
            </p>
            <div className={styles.compareGroups}>
              {modal.groups.map((g) => (
                <div key={g.key} className={styles.compareGroup}>
                  <p className={styles.compareGroupTitle}>{g.key.replace(':', ' ')}</p>
                  {g.successCandidates.map((t, idx) => {
                    const selected = modal.selections[g.key] === idx;
                    return (
                      <CompareCandidate
                        key={t.id}
                        test={t}
                        selected={selected}
                        onSelect={() => setModal({
                          ...modal,
                          selections: { ...modal.selections, [g.key]: idx },
                        })}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className={styles.dialogActions}>
              <Button
                variant="primary"
                disabled={!modal.groups.every((g) => modal.selections[g.key] !== undefined)}
                onClick={handleConfirmCompare}
              >
                Confirmar seleções
              </Button>
              <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {modal?.kind === 'allDone' && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <p className={styles.dialogText}>Todos os testes já estão documentados.</p>
            <Button variant="primary" onClick={() => setModal(null)}>Fechar</Button>
          </div>
        </div>
      )}

      {modal?.kind === 'prompt' && (
        <div className={styles.overlay}>
          <div className={styles.promptDialog}>
            <div className={styles.promptHeader}>
              <p className={styles.dialogText}>
                Rotas criadas. Copie o prompt abaixo e cole em um assistente de IA para preencher as descrições e erros adicionais.
              </p>
              <div className={styles.dialogActions}>
                <Button
                  variant="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(modal.prompt);
                    setModal({ ...modal, copied: true });
                  }}
                >
                  {modal.copied ? 'Copiado!' : 'Copiar prompt'}
                </Button>
                <Button variant="secondary" onClick={() => setModal(null)}>Fechar</Button>
              </div>
            </div>
            <pre className={styles.promptPre}>{modal.prompt}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
