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

function buildPrompt(created: DocRouteInput[]): string {
  const lines: string[] = [
    'Você é um especialista em APIs REST. As rotas abaixo foram geradas automaticamente a partir de testes de API do projeto HelpFlow (backend Haskell/Servant).',
    'Para cada rota, faça o seguinte:',
    '1. Escreva uma descrição clara e objetiva do que a rota faz.',
    '2. Adicione casos de erro que o backend realmente retorna mas que não estão cobertos pelos testes (ex.: autenticação, permissão, conflito, recurso não encontrado). Não invente erros que não existem no backend.',
    '3. Não altere os campos já preenchidos (método, rota, status de sucesso, corpo de sucesso, corpo da requisição).',
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

type Modal =
  | { kind: 'allDone' }
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

  async function handleGenerate() {
    const docKeys = new Set(routes.map((r) => `${r.method}:${r.route}`));
    const missing = tests.filter((t) => !docKeys.has(`${t.method}:${t.route}`));

    if (missing.length === 0) {
      setModal({ kind: 'allDone' });
      return;
    }

    setGenerating(true);
    const inputs: DocRouteInput[] = missing.map((t) => ({
      method: t.method,
      route: t.route,
      title: t.name,
      requestBody: t.requestBody,
      successStatus: t.category === 'success' ? t.expectedStatus : 200,
      successBody: t.category === 'success' ? t.expectedBody : '',
      errors: t.category !== 'success'
        ? [{ status: t.expectedStatus, body: t.expectedBody }]
        : [],
    }));

    for (const input of inputs) {
      await onAddRoute(input);
    }

    setGenerating(false);
    setModal({ kind: 'prompt', prompt: buildPrompt(inputs), copied: false });
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
          <div className={styles.dialog}>
            <p className={styles.dialogText}>
              Rotas criadas com sucesso. Deseja copiar o prompt para o assistente de IA preencher as descrições e erros adicionais?
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
        </div>
      )}
    </div>
  );
}
