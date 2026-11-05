import { useId } from 'react';
import { MethodBadge, ResponseBadge } from '../../components/ui/Badges';
import { IconButton } from '../../components/ui/Button';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { ChevronDownIcon, EditIcon, TrashIcon } from '../../components/ui/icons';
import type { DocRoute } from '../../types';
import { buildCurl } from '../../utils/curl';
import { prettyJson } from '../../utils/json';
import { cx } from '../../utils/cx';
import styles from './RouteCard.module.css';

interface RouteCardProps {
  route: DocRoute;
  open: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const NO_BODY = 'Sem corpo na resposta.';

/**
 * Card de uma rota documentada.
 * Resumido: método, rota e título. Ampliado: acrescenta o exemplo de requisição,
 * a resposta de sucesso e os erros possíveis.
 */
export function RouteCard({ route, open, onToggle, onEdit, onDelete }: RouteCardProps) {
  const detailsId = useId();

  return (
    <li className={styles.card}>
      <div className={styles.header}>
        <button type="button" className={styles.summary} aria-expanded={open} aria-controls={detailsId} onClick={onToggle}>
          <MethodBadge method={route.method} />
          <code className={styles.route}>{route.route}</code>
          <span className={styles.title}>{route.title}</span>
          <span className={cx(styles.chevron, open && styles.chevronOpen)}>
            <ChevronDownIcon />
          </span>
        </button>
        <div className={styles.cardActions}>
          <IconButton aria-label={`Editar rota ${route.route}`} title="Editar" onClick={onEdit}>
            <EditIcon />
          </IconButton>
          <IconButton tone="danger" aria-label={`Excluir rota ${route.route}`} title="Excluir" onClick={onDelete}>
            <TrashIcon />
          </IconButton>
        </div>
      </div>

      {open && (
        <div id={detailsId} className={styles.details}>
          {route.description && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Descrição</h3>
              <p className={styles.description}>{route.description}</p>
            </section>
          )}

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Exemplo de requisição</h3>
            <CodeBlock>{buildCurl(route)}</CodeBlock>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Resposta esperada</h3>
            <div className={styles.response}>
              <ResponseBadge status={route.successStatus} label="Sucesso" />
              <CodeBlock>{route.successBody.trim() ? prettyJson(route.successBody) : NO_BODY}</CodeBlock>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Erros possíveis</h3>
            {route.errors.map((error, index) => (
              <div key={`${error.status}-${index}`} className={styles.response}>
                <ResponseBadge status={error.status} label="Erro" />
                <CodeBlock>{error.body.trim() ? prettyJson(error.body) : NO_BODY}</CodeBlock>
              </div>
            ))}
            {route.errors.length === 0 && <p className={styles.empty}>Nenhum erro documentado para esta rota.</p>}
          </section>
        </div>
      )}
    </li>
  );
}
