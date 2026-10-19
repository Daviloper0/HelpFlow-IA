import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { PlusIcon } from '../../components/ui/icons';
import { PageHeader } from '../../components/ui/PageHeader';
import type { DocRoute, DocRouteInput } from '../../types';
import { RouteCard } from './RouteCard';
import { RouteFormModal } from './RouteFormModal';
import styles from './DocsPage.module.css';

interface DocsPageProps {
  routes: DocRoute[];
  loading: boolean;
  onAddRoute: (input: DocRouteInput) => Promise<DocRoute>;
}

/** Módulo "Documentação OpenAPI": lista das rotas, cada uma em um card que abre e fecha. */
export function DocsPage({ routes, loading, onAddRoute }: DocsPageProps) {
  // Só um card fica aberto por vez. null = todos recolhidos.
  const [openId, setOpenId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  async function handleAdd(input: DocRouteInput) {
    const created = await onAddRoute(input);
    setOpenId(created.id);
    setAdding(false);
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Documentação OpenAPI"
        description="Rotas da API do HelpFlow, com exemplo de requisição e das respostas esperadas, incluindo erros."
        actions={
          <Button variant="primary" icon={<PlusIcon />} onClick={() => setAdding(true)}>
            Adicionar rota
          </Button>
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
    </div>
  );
}
