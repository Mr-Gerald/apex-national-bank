import React, { ReactNode } from 'react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  isLoading?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  primaryActionText = "Confirm",
  onPrimaryAction,
  secondaryActionText = "Cancel",
  onSecondaryAction,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[100]"> {/* Increased z-index */}
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm transform transition-all">
        <h2 className="text-xl font-semibold text-neutral-800 mb-4">{title}</h2>
        <div className="text-sm text-neutral-600 mb-6">
          {children}
        </div>
        <div className="flex justify-end space-x-3">
          {onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction || onClose} disabled={isLoading}>
              {secondaryActionText}
            </Button>
          )}
          {onPrimaryAction && (
            <Button variant="primary" onClick={onPrimaryAction} isLoading={isLoading} disabled={isLoading}>
              {primaryActionText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;