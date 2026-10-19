import { useId } from 'react';
import { MethodBadge, ResponseBadge } from '../../components/ui/Badges';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { ChevronDownIcon } from '../../components/ui/icons';
import type { DocRoute } from '../../types';
import { buildCurl } from '../../utils/curl';
import { prettyJson } from '../../utils/json';
import { cx } from '../../utils/cx';
import styles from './RouteCard.module.css';

interface RouteCardProps {
  route: DocRoute;
  open: boolean;
  onToggle: () => void;
}

const NO_BODY = 'Sem corpo na resposta.';

/**
 * Card de uma rota documentada.
 * Resumido: método, rota e título. Ampliado: acrescenta o exemplo de requisição,
 * a resposta de sucesso e os erros possíveis.
 */
export function RouteCard({ route, open, onToggle }: RouteCardProps) {
  const detailsId = useId();

  return (
    <li className={styles.card}>
      <button type="button" className={styles.summary} aria-expanded={open} aria-controls={detailsId} onClick={onToggle}>
        <MethodBadge method={route.method} />
        <code className={styles.route}>{route.route}</code>
        <span className={styles.title}>{route.title}</span>
        <span className={cx(styles.chevron, open && styles.chevronOpen)}>
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div id={detailsId} className={styles.details}>
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
