import { CategoryTag, MethodBadge } from '../../components/ui/Badges';
import { Button } from '../../components/ui/Button';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { ArrowRightIcon } from '../../components/ui/icons';
import { Modal, ModalSection } from '../../components/ui/Modal';
import type { TestView } from '../../types';
import styles from './FailureDetailModal.module.css';

interface FailureDetailModalProps {
  test: TestView;
  onClose: () => void;
  onGoToTest: () => void;
}

/** Detalhes de um teste que falhou, com atalho para abri-lo no módulo de testes. */
export function FailureDetailModal({ test, onClose, onGoToTest }: FailureDetailModalProps) {
  return (
    <Modal
      title={test.name}
      badge={<MethodBadge method={test.method} />}
      size="md"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Fechar</Button>
          <Button variant="primary" icon={<ArrowRightIcon />} onClick={onGoToTest}>
            Ir para o teste
          </Button>
        </>
      }
    >
      <div className={styles.intro}>
        <p className={styles.description}>{test.description}</p>
        <CategoryTag category={test.category} />
      </div>

      <ModalSection title="O que aconteceu">
        <div className={styles.compare}>
          <div className={styles.statusBox}>
            <span className={styles.statusLabel}>Status esperado</span>
            <span className={styles.statusValue}>{test.expectedStatus}</span>
          </div>
          <div className={`${styles.statusBox} ${styles.statusBad}`}>
            <span className={styles.statusLabel}>Status recebido</span>
            <span className={styles.statusValue}>{test.lastRun?.actualStatus}</span>
          </div>
        </div>
        <p className={styles.failure}>{test.failureMessage}</p>
      </ModalSection>

      <ModalSection title="Requisição">
        <code className={styles.route}>{test.route}</code>
        <CodeBlock tone="light" wrap>
          {test.requestBody || 'Sem corpo na requisição.'}
        </CodeBlock>
      </ModalSection>

      <ModalSection title="Valor esperado na resposta">
        <CodeBlock tone="light" wrap>
          {test.expectedBody || 'Sem corpo esperado.'}
        </CodeBlock>
      </ModalSection>
    </Modal>
  );
}
