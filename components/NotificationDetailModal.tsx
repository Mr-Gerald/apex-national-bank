
import React from 'react';
import { Link } from 'react-router-dom'; 
import Modal from './Modal'; 
import { AppNotification } from '../types';
import { formatDate } from '../utils/formatters';
import Button from './Button';
import { TrashIcon } from '../constants';

interface NotificationDetailModalProps {
  notification: AppNotification;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void; 
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({ notification, isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  const handleDeleteClick = () => {
    onClose(); 
    onDelete(); 
  };
  
  const handlePrimaryAction = () => {
    onClose();
  };

  const isExternalOrMailtoLink = (link: string) => /^(https?|mailto):/i.test(link);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notification Details"
      primaryActionText="Close"
      onPrimaryAction={handlePrimaryAction}
      secondaryActionText="Delete Notification"
      onSecondaryAction={handleDeleteClick} 
    >
      <div className="space-y-3">
        <p className="text-xs text-neutral-500">
          Received: {formatDate(notification.date, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
        <p className="text-sm text-neutral-700 whitespace-pre-wrap">
          {notification.message}
        </p>
        {notification.linkTo && (
            <div className="mt-3">
                {isExternalOrMailtoLink(notification.linkTo) ? (
                    <a 
                        href={notification.linkTo} 
                        target={notification.linkTo.startsWith('mailto') ? '_self' : '_blank'}
                        rel="noopener noreferrer" 
                        className="inline-block"
                        onClick={onClose} // Close modal when link is clicked
                    >
                        <Button variant="outline" size="sm">
                           {notification.linkTo.startsWith('mailto') ? 'Contact Support via Email' : 'Open External Link'}
                        </Button>
                    </a>
                ) : (
                    <Link to={notification.linkTo} onClick={onClose} className="inline-block">
                        <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                )}
            </div>
        )}
      </div>
    </Modal>
  );
};

export default NotificationDetailModal;