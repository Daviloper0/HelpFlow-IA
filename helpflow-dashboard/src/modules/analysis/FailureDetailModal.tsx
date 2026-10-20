import { useState } from 'react';
import { CategoryTag, MethodBadge } from '../../components/ui/Badges';
import { cx } from '../../utils/cx';
import { Button } from '../../components/ui/Button';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { ArrowRightIcon } from '../../components/ui/icons';
import { Modal, ModalSection } from '../../components/ui/Modal';
import type { TestView } from '../../types';
import styles from './FailureDetailModal.module.css';

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== (b as unknown[]).length) return false;
    return a.every((item, i) => deepEqual(item, (b as unknown[])[i]));
  }
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => Object.prototype.hasOwnProperty.call(bObj, key) && deepEqual(aObj[key], bObj[key]));
}

function bodiesMatch(actual: string, expected: string): boolean {
  const actualEmpty = !actual.trim();
  const expectedEmpty = !expected.trim();
  if (expectedEmpty && actualEmpty) return true;
  if (expectedEmpty !== actualEmpty) return false;
  try {
    return deepEqual(JSON.parse(actual), JSON.parse(expected));
  } catch {
    return actual.trim() === expected.trim();
  }
}

function buildDebugPrompt(test: TestView): string {
  const lines: string[] = [
    `I'm developing HelpFlow, a Haskell backend API, and I'm using a dashboard to automate API testing.`,
    `One of my tests is failing and I need help figuring out why.`,
    ``,
    `## Context`,
    `HelpFlow is a Haskell backend. Haskell has a strong type system with strict rules, so failures`,
    `can come from type mismatches, missing fields, unexpected nulls, or business logic constraints`,
    `in addition to regular HTTP errors.`,
    ``,
    `## Failing test: ${test.name}`,
    test.description ? `Description: ${test.description}` : '',
    `Category: ${test.category}`,
    ``,
    `## Request sent`,
    `${test.method} ${test.route}`,
    (test.lastRun?.actualRequestBody || test.requestBody).trim()
      ? `Body:\n${test.lastRun?.actualRequestBody || test.requestBody}`
      : `(no request body)`,
    ``,
    `## Expected response`,
    `Status: ${test.expectedStatus}`,
    test.expectedBody.trim()
      ? `Body:\n${test.expectedBody}`
      : `(no expected body)`,
    ``,
    `## Actual response received`,
    `Status: ${test.lastRun?.actualStatus ?? 'unknown'}`,
    test.lastRun?.actualBody?.trim()
      ? `Body:\n${test.lastRun.actualBody}`
      : `(no response body)`,
    ``,
    `## Failure message`,
    test.failureMessage || test.lastRun?.failureMessage || '(none)',
    ``,
    `What could be causing this failure, and how should I fix it?`,
  ];

  return lines.filter((l) => l !== null).join('\n');
}

interface FailureDetailModalProps {
  test: TestView;
  onClose: () => void;
  onGoToTest: () => void;
}

/** Detalhes de um teste que falhou, com atalho para abri-lo no módulo de testes. */
export function FailureDetailModal({ test, onClose, onGoToTest }: FailureDetailModalProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(buildDebugPrompt(test)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
          <div className={cx(styles.statusBox, test.lastRun?.actualStatus !== test.expectedStatus && styles.statusBad)}>
            <span className={styles.statusLabel}>Status recebido</span>
            <span className={styles.statusValue}>{test.lastRun?.actualStatus}</span>
          </div>
        </div>
        <p className={styles.failure}>{test.failureMessage}</p>
      </ModalSection>

      <ModalSection title="Requisição">
        <code className={styles.route}>{test.route}</code>
        <CodeBlock tone="light" wrap>
          {test.lastRun?.actualRequestBody || test.requestBody || 'Sem corpo na requisição.'}
        </CodeBlock>
      </ModalSection>

      <ModalSection title="Valor esperado na resposta">
        <CodeBlock tone="light" wrap>
          {test.expectedBody || 'Sem corpo esperado.'}
        </CodeBlock>
      </ModalSection>

      <ModalSection title="Resposta recebida">
        <div className={cx(styles.bodyBox, !bodiesMatch(test.lastRun?.actualBody ?? '', test.expectedBody) && styles.bodyBad)}>
          <CodeBlock tone="light" wrap>
            {test.lastRun?.actualBody || 'Sem corpo na resposta.'}
          </CodeBlock>
        </div>
      </ModalSection>

      <ModalSection title="Prompt de depuração">
        <p className={styles.promptHint}>
          Copie este prompt e cole em qualquer assistente de IA para obter ajuda com a falha.
        </p>
        <CodeBlock tone="light" wrap>
          {buildDebugPrompt(test)}
        </CodeBlock>
        <Button onClick={handleCopy}>{copied ? 'Copiado!' : 'Copiar prompt'}</Button>
      </ModalSection>
    </Modal>
  );
}
