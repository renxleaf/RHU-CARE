import Modal from './Modal';
import { cn } from '../lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-bold bg-bg text-txt border border-border hover:bg-neutral-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl font-black text-white shadow-sh-sm transition-transform active:scale-95",
              variant === 'danger' ? "bg-red border-b-4 border-red-700" : "bg-blue border-b-4 border-blue-700"
            )}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p className="text-[14px] text-txt2 leading-relaxed">
        {message}
      </p>
    </Modal>
  );
}
