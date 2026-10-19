import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { ChoiceGroup } from '../../components/ui/ChoiceGroup';
import { Field, TextArea, TextInput } from '../../components/ui/Field';
import { Modal, ModalSection } from '../../components/ui/Modal';
import { CATEGORIES, HTTP_METHODS, METHOD_COLORS } from '../../constants/http';
import type { ApiTestInput, TestFormValues, TestView } from '../../types';
import { emptyTestForm, formToTestInput, testToForm } from '../../utils/forms';
import { hasTestFormErrors, validateTestForm } from '../../utils/validation';
import styles from './TestFormModal.module.css';

const METHOD_OPTIONS = HTTP_METHODS.map((method) => ({
  value: method,
  label: method,
  color: METHOD_COLORS[method],
  mono: true,
}));

const CATEGORY_OPTIONS = CATEGORIES.map(({ value, label, dot }) => ({ value, label, dot }));

interface TestFormModalProps {
  /** Teste a editar. Sem ele, o formulário cria um teste novo. */
  test?: TestView;
  onClose: () => void;
  onSubmit: (input: ApiTestInput) => Promise<void>;
}

/** Janela para criar ou editar um teste, com três seções: identificação, requisição e resultado. */
export function TestFormModal({ test, onClose, onSubmit }: TestFormModalProps) {
  const [values, setValues] = useState<TestFormValues>(() => (test ? testToForm(test) : emptyTestForm()));
  // Os erros só aparecem depois da primeira tentativa de salvar.
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors = validateTestForm(values);
  const shown = (message: string) => (tried ? message : '');

  function setField<K extends keyof TestFormValues>(key: K, value: TestFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    if (hasTestFormErrors(errors)) {
      setTried(true);
      return;
    }
    setSaving(true);
    try {
      await onSubmit(formToTestInput(values));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={test ? 'Editar teste' : 'Novo teste'}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" disabled={saving} onClick={handleSave}>
            {test ? 'Salvar alterações' : 'Criar teste'}
          </Button>
        </>
      }
    >
      <ModalSection title="Identificação do teste">
        <Field label="Nome" htmlFor="test-name" error={shown(errors.name)}>
          <TextInput
            id="test-name"
            placeholder="O que este teste verifica"
            value={values.name}
            invalid={tried && !!errors.name}
            onChange={(event) => setField('name', event.target.value)}
          />
        </Field>

        <ChoiceGroup
          legend="Identificador (método HTTP)"
          options={METHOD_OPTIONS}
          value={values.method}
          onChange={(method) => setField('method', method)}
        />

        <Field label="Descrição" htmlFor="test-description">
          <TextArea
            id="test-description"
            rows={2}
            placeholder="Explique o que o teste faz"
            value={values.description}
            onChange={(event) => setField('description', event.target.value)}
          />
        </Field>
      </ModalSection>

      <ModalSection title="Requisição">
        <Field label="Rota" htmlFor="test-route" error={shown(errors.route)}>
          <TextInput
            id="test-route"
            mono
            placeholder="/api/recurso/1"
            value={values.route}
            invalid={tried && !!errors.route}
            onChange={(event) => setField('route', event.target.value)}
          />
        </Field>

        <Field label="Objeto enviado por HTTP (JSON)" htmlFor="test-request-body" error={shown(errors.requestBody)}>
          <TextArea
            id="test-request-body"
            code
            rows={6}
            spellCheck={false}
            placeholder="Deixe vazio quando a requisição não tiver corpo"
            value={values.requestBody}
            invalid={tried && !!errors.requestBody}
            onChange={(event) => setField('requestBody', event.target.value)}
          />
        </Field>
      </ModalSection>

      <ModalSection title="Resultado esperado">
        <div className={styles.statusRow}>
          <Field
            label="Status HTTP"
            htmlFor="test-expected-status"
            error={shown(errors.expectedStatus)}
            className={styles.statusField}
          >
            <TextInput
              id="test-expected-status"
              mono
              inputMode="numeric"
              maxLength={3}
              placeholder="200"
              value={values.expectedStatus}
              invalid={tried && !!errors.expectedStatus}
              onChange={(event) => setField('expectedStatus', event.target.value)}
            />
          </Field>

          <div className={styles.categoryField}>
            <ChoiceGroup
              legend="Categoria do teste"
              options={CATEGORY_OPTIONS}
              value={values.category}
              onChange={(category) => setField('category', category)}
            />
          </div>
        </div>

        <Field label="Valor esperado na resposta (JSON)" htmlFor="test-expected-body" error={shown(errors.expectedBody)}>
          <TextArea
            id="test-expected-body"
            code
            rows={5}
            spellCheck={false}
            placeholder="Corpo que a API deve devolver"
            value={values.expectedBody}
            invalid={tried && !!errors.expectedBody}
            onChange={(event) => setField('expectedBody', event.target.value)}
          />
        </Field>
      </ModalSection>
    </Modal>
  );
}
