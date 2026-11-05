import { useRef, useState } from 'react';
import { Button, IconButton } from '../../components/ui/Button';
import { ChoiceGroup } from '../../components/ui/ChoiceGroup';
import { Field, TextArea, TextInput } from '../../components/ui/Field';
import { PlusIcon, TrashIcon } from '../../components/ui/icons';
import { Modal, ModalSection } from '../../components/ui/Modal';
import { HTTP_METHODS, METHOD_COLORS } from '../../constants/http';
import type { DocRouteInput, RouteFormValues } from '../../types';
import { emptyRouteForm, formToRouteInput, routeToForm } from '../../utils/forms';
import { hasRouteFormErrors, validateRouteForm } from '../../utils/validation';
import styles from './RouteFormModal.module.css';

const METHOD_OPTIONS = HTTP_METHODS.map((method) => ({
  value: method,
  label: method,
  color: METHOD_COLORS[method],
  mono: true,
}));

interface RouteFormModalProps {
  onClose: () => void;
  onSubmit: (input: DocRouteInput) => Promise<void>;
  initialRoute?: import('../../types').DocRoute;
}

/** Janela para documentar uma rota nova ou editar uma existente. */
export function RouteFormModal({ onClose, onSubmit, initialRoute }: RouteFormModalProps) {
  const [values, setValues] = useState<RouteFormValues>(
    initialRoute ? routeToForm(initialRoute) : emptyRouteForm,
  );
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const nextErrorKey = useRef(1);

  const errors = validateRouteForm(values);
  const shown = (message: string) => (tried ? message : '');

  function setField<K extends keyof RouteFormValues>(key: K, value: RouteFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function addError() {
    const row = { key: nextErrorKey.current++, status: '400', body: '' };
    setField('errors', [...values.errors, row]);
  }

  function updateError(key: number, field: 'status' | 'body', value: string) {
    setField(
      'errors',
      values.errors.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
  }

  function removeError(key: number) {
    setField(
      'errors',
      values.errors.filter((row) => row.key !== key),
    );
  }

  async function handleSave() {
    if (hasRouteFormErrors(errors)) {
      setTried(true);
      return;
    }
    setSaving(true);
    try {
      await onSubmit(formToRouteInput(values));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={initialRoute ? 'Editar rota' : 'Adicionar rota'}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" disabled={saving} onClick={handleSave}>
            {initialRoute ? 'Salvar alterações' : 'Adicionar rota'}
          </Button>
        </>
      }
    >
      <ModalSection title="Identificação da rota">
        <Field label="Título" htmlFor="route-title" error={shown(errors.title)}>
          <TextInput
            id="route-title"
            placeholder="Ex.: Criar chamado"
            value={values.title}
            invalid={tried && !!errors.title}
            onChange={(event) => setField('title', event.target.value)}
          />
        </Field>

        <ChoiceGroup
          legend="Método HTTP"
          options={METHOD_OPTIONS}
          value={values.method}
          onChange={(method) => setField('method', method)}
        />

        <Field label="Rota" htmlFor="route-path" error={shown(errors.route)}>
          <TextInput
            id="route-path"
            mono
            placeholder="/api/recurso/{id}"
            value={values.route}
            invalid={tried && !!errors.route}
            onChange={(event) => setField('route', event.target.value)}
          />
        </Field>

        <Field label="Descrição" htmlFor="route-description" hint="O que esta rota faz.">
          <TextArea
            id="route-description"
            placeholder="Descreva o propósito desta rota…"
            value={values.description}
            onChange={(event) => setField('description', event.target.value)}
          />
        </Field>
      </ModalSection>

      <ModalSection title="Exemplo de requisição">
        <Field
          label="Corpo enviado (JSON)"
          htmlFor="route-request-body"
          hint="O comando curl de exemplo é montado a partir do método, da rota e deste corpo."
          error={shown(errors.requestBody)}
        >
          <TextArea
            id="route-request-body"
            code
            rows={5}
            spellCheck={false}
            placeholder="Deixe vazio quando a requisição não tiver corpo"
            value={values.requestBody}
            invalid={tried && !!errors.requestBody}
            onChange={(event) => setField('requestBody', event.target.value)}
          />
        </Field>
      </ModalSection>

      <ModalSection title="Resposta de sucesso">
        <div className={styles.successRow}>
          <Field
            label="Status HTTP"
            htmlFor="route-success-status"
            error={shown(errors.successStatus)}
            className={styles.statusField}
          >
            <TextInput
              id="route-success-status"
              mono
              inputMode="numeric"
              maxLength={3}
              placeholder="200"
              value={values.successStatus}
              invalid={tried && !!errors.successStatus}
              onChange={(event) => setField('successStatus', event.target.value)}
            />
          </Field>
          <Field
            label="Corpo da resposta (JSON)"
            htmlFor="route-success-body"
            error={shown(errors.successBody)}
            className={styles.bodyField}
          >
            <TextArea
              id="route-success-body"
              code
              rows={5}
              spellCheck={false}
              placeholder="Corpo que a API devolve em caso de sucesso"
              value={values.successBody}
              invalid={tried && !!errors.successBody}
              onChange={(event) => setField('successBody', event.target.value)}
            />
          </Field>
        </div>
      </ModalSection>

      <ModalSection title="Erros possíveis">
        {values.errors.map((row, index) => (
          <div key={row.key} className={styles.errorRow}>
            <Field
              label="Status"
              htmlFor={`route-error-status-${row.key}`}
              error={shown(errors.errors[index].status)}
              className={styles.errorStatus}
            >
              <TextInput
                id={`route-error-status-${row.key}`}
                mono
                inputMode="numeric"
                maxLength={3}
                placeholder="400"
                value={row.status}
                invalid={tried && !!errors.errors[index].status}
                onChange={(event) => updateError(row.key, 'status', event.target.value)}
              />
            </Field>
            <Field
              label="Corpo da resposta (JSON)"
              htmlFor={`route-error-body-${row.key}`}
              error={shown(errors.errors[index].body)}
              className={styles.errorBody}
            >
              <TextArea
                id={`route-error-body-${row.key}`}
                code
                rows={3}
                spellCheck={false}
                placeholder="Mensagem de erro devolvida pela API"
                value={row.body}
                invalid={tried && !!errors.errors[index].body}
                onChange={(event) => updateError(row.key, 'body', event.target.value)}
              />
            </Field>
            <IconButton
              tone="danger"
              className={styles.removeError}
              aria-label={`Remover erro ${index + 1}`}
              title="Remover erro"
              onClick={() => removeError(row.key)}
            >
              <TrashIcon />
            </IconButton>
          </div>
        ))}

        <Button icon={<PlusIcon size={16} />} className={styles.addError} onClick={addError}>
          Adicionar erro
        </Button>
      </ModalSection>
    </Modal>
  );
}
