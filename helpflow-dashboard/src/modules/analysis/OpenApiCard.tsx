import type { OpenApiStatus, OpenApiValidation } from '../../types';
import { absoluteTime, relativeTime } from '../../utils/time';
import styles from './OpenApiCard.module.css';

const VALIDATION_STYLES: Record<OpenApiValidation, { label: string; bg: string; fg: string; dot: string }> = {
  valid: { label: 'Válida', bg: '#E3F4EA', fg: '#0F6B3A', dot: '#1F9254' },
  warnings: { label: 'Válida com avisos', bg: '#FDF0D8', fg: '#8A5300', dot: '#B87503' },
  invalid: { label: 'Inválida', bg: '#FDE8E6', fg: '#A3231A', dot: '#D23B2E' },
  unvalidated: { label: 'Não validada', bg: '#EEF0F3', fg: '#4B5565', dot: '#8791A3' },
};

interface PillProps {
  label: string;
  bg: string;
  fg: string;
  dot: string;
}

function Pill({ label, bg, fg, dot }: PillProps) {
  return (
    <span className={styles.pill} style={{ backgroundColor: bg, color: fg }}>
      <span className={styles.dot} style={{ backgroundColor: dot }} />
      {label}
    </span>
  );
}

/** Situação do arquivo OpenAPI: existe, atualização, validação e local. */
export function OpenApiCard({ status }: { status: OpenApiStatus | null }) {
  return (
    <section aria-labelledby="openapi-title" className={styles.section}>
      <h2 id="openapi-title" className={styles.title}>
        Documentação OpenAPI
      </h2>

      {status ? <StatusDetails status={status} /> : <p className={styles.loading}>Carregando situação do arquivo…</p>}
    </section>
  );
}

function StatusDetails({ status }: { status: OpenApiStatus }) {
  // Sem arquivo, não há o que validar.
  const validation = VALIDATION_STYLES[status.exists ? status.validation : 'unvalidated'];

  return (
    <dl className={styles.card}>
      <div className={styles.item}>
        <dt className={styles.term}>Existe</dt>
        <dd>
          {status.exists ? (
            <Pill label="Existe" bg="#E3F4EA" fg="#0F6B3A" dot="#1F9254" />
          ) : (
            <Pill label="Não encontrada" bg="#FDE8E6" fg="#A3231A" dot="#D23B2E" />
          )}
        </dd>
      </div>

      <div className={styles.item}>
        <dt className={styles.term}>Última atualização</dt>
        <dd className={styles.stack}>
          <span className={styles.strong}>{status.exists && status.updatedAt ? relativeTime(status.updatedAt) : '—'}</span>
          <span className={styles.note}>
            {status.exists && status.updatedAt ? absoluteTime(status.updatedAt) : 'Sem arquivo para atualizar'}
          </span>
        </dd>
      </div>

      <div className={styles.item}>
        <dt className={styles.term}>Status de validação</dt>
        <dd className={styles.stack}>
          <Pill {...validation} />
          <span className={styles.note}>{status.exists ? status.note : 'Adicione o arquivo para validar.'}</span>
        </dd>
      </div>

      <div className={styles.item}>
        <dt className={styles.term}>Local do arquivo</dt>
        <dd>
          <code className={styles.path}>{status.path}</code>
        </dd>
      </div>
    </dl>
  );
}
