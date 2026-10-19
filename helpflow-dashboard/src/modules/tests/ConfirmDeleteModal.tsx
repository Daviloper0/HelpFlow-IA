import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import styles from './ConfirmDeleteModal.module.css';

interface ConfirmDeleteModalProps {
  testName: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

/** Pede confirmação antes de excluir um teste. */
export function ConfirmDeleteModal({ testName, onCancel, onConfirm }: ConfirmDeleteModalProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      title="Excluir este teste?"
      size="sm"
      onClose={onCancel}
      footer={
        <>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button variant="danger" disabled={deleting} onClick={handleConfirm}>
            Excluir
          </Button>
        </>
      }
    >
      <p className={styles.text}>“{testName}” será removido da lista. Essa ação não pode ser desfeita.</p>
    </Modal>
  );
}
