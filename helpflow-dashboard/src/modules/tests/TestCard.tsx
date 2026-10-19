import { CategoryTag, MethodBadge, StatusPill } from '../../components/ui/Badges';
import { Button, IconButton } from '../../components/ui/Button';
import { AlertCircleIcon, EditIcon, PlayIcon, TrashIcon } from '../../components/ui/icons';
import type { TestView } from '../../types';
import { cx } from '../../utils/cx';
import styles from './TestCard.module.css';

interface TestCardProps {
  test: TestView;
  /** Destaque temporário, usado ao chegar da tela de Análise. */
  highlighted: boolean;
  onRun: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Um teste da lista: nome, método, descrição, rota, resultado e ações. */
export function TestCard({ test, highlighted, onRun, onEdit, onDelete }: TestCardProps) {
  return (
    <li id={`test-${test.id}`} className={cx(styles.card, highlighted && styles.highlighted)}>
      <div className={styles.row}>
        <div className={styles.info}>
          <div className={styles.titleRow}>
            <MethodBadge method={test.method} />
            <h3 className={styles.name}>{test.name}</h3>
          </div>
          <p className={styles.description}>{test.description}</p>
          <div className={styles.meta}>
            <code className={styles.route}>{test.route}</code>
            <span className={styles.expected}>
              Espera <strong>{test.expectedStatus}</strong>
            </span>
            <CategoryTag category={test.category} />
          </div>
        </div>

        <div className={styles.actions}>
          <StatusPill status={test.status} />
          <Button
            variant="outline"
            icon={<PlayIcon />}
            disabled={test.status === 'running'}
            aria-label={`Rodar teste ${test.name}`}
            onClick={onRun}
          >
            Rodar
          </Button>
          <IconButton aria-label={`Editar teste ${test.name}`} title="Editar" onClick={onEdit}>
            <EditIcon />
          </IconButton>
          <IconButton tone="danger" aria-label={`Excluir teste ${test.name}`} title="Excluir" onClick={onDelete}>
            <TrashIcon />
          </IconButton>
        </div>
      </div>

      {test.status === 'fail' && (
        <div className={styles.failure}>
          <AlertCircleIcon />
          <span>{test.failureMessage}</span>
        </div>
      )}
    </li>
  );
}
