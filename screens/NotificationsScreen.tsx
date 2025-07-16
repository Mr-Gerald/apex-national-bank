
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppNotification } from '../types';
import Button from '../components/Button';
import Modal from '../components/Modal'; // Import Modal for confirmation
import { BellIcon, CheckCircleIcon, InformationCircleIcon, TrashIcon, XCircleIcon, HourglassIcon } from '../constants';
import { formatDate } from '../utils/formatters';
import NotificationDetailModal from '../components/NotificationDetailModal';

const NotificationsScreen: React.FC = () => {
  const { user, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, deleteAllReadNotifications } = useAuth();
  const navigate = useNavigate();
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [showDeleteAllReadConfirmModal, setShowDeleteAllReadConfirmModal] = useState(false);


  const handleViewNotification = async (notification: AppNotification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  const confirmDeleteNotification = (notificationId: string) => {
    setNotificationToDelete(notificationId);
    setShowDeleteConfirmModal(true);
  };

  const executeDeleteNotification = async () => {
    if (!notificationToDelete) return;
    setIsLoading(true);
    try {
      await deleteNotification(notificationToDelete);
      if(selectedNotification?.id === notificationToDelete) setSelectedNotification(null); 
    } catch (e) {
      console.error("Failed to delete notification:", e);
      alert("Error deleting notification.");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirmModal(false);
      setNotificationToDelete(null);
    }
  };
  
  const confirmDeleteAllRead = () => {
    setShowDeleteAllReadConfirmModal(true);
  };

  const executeDeleteAllRead = async () => {
    setIsLoading(true);
    try {
      await deleteAllReadNotifications();
      if(selectedNotification && selectedNotification.read) setSelectedNotification(null);
    } catch (e) {
       console.error("Failed to delete all read notifications:", e);
      alert("Error deleting all read notifications.");
    } finally {
      setIsLoading(false);
      setShowDeleteAllReadConfirmModal(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount > 0) {
        setIsLoading(true);
        try {
            await markAllNotificationsAsRead();
        } catch (e) {
            console.error("Failed to mark all as read:", e);
            alert("Error marking all notifications as read.");
        } finally {
            setIsLoading(false);
        }
    }
  };


  const sortedNotifications = user?.notifications?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
  const unreadCount = sortedNotifications.filter(n => !n.read).length;
  const readCount = sortedNotifications.filter(n => n.read).length;

  const getNotificationIcon = (type: AppNotification['type']): React.ReactNode => {
    switch (type) {
        case 'general': 
        case 'funds_released': 
        case 'profile_verification': 
        case 'transfer_success': // Added for successful transfers
            return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        
        case 'identity_rejected': 
        case 'profile_rejected': 
             return <XCircleIcon className="w-5 h-5 text-red-500" />;
        
        case 'security': 
            return <InformationCircleIcon className="w-5 h-5 text-red-600" />; 
        
        case 'admin_message': 
            return <InformationCircleIcon className="w-5 h-5 text-orange-500" />;
        
        case 'verification': 
            return <HourglassIcon className="w-5 h-5 text-yellow-500" />;
        
        case 'transaction_update': 
        default:
            return <InformationCircleIcon className="w-5 h-5 text-primary" />;
    }
  };


  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="text-primary hover:text-accent-700 p-1" aria-label="Go back">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <h1 className="text-2xl font-semibold text-neutral-800">Notifications</h1>
        </div>
        <div className="flex space-x-2">
            {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={isLoading}>
                    Mark All Read
                </Button>
            )}
            {readCount > 0 && sortedNotifications.length > 0 && (
                 <Button variant="ghost" size="sm" onClick={confirmDeleteAllRead} className="text-red-600 hover:bg-red-50" disabled={isLoading}>
                    Delete All Read
                </Button>
            )}
        </div>
      </div>

      {sortedNotifications.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <BellIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900">No Notifications Yet</h3>
          <p className="mt-1 text-sm text-neutral-500">We'll let you know when there's something new.</p>
        </div>
      ) : (
        <ul className="bg-white rounded-lg shadow-md divide-y divide-neutral-100">
          {sortedNotifications.map(notification => (
            <li 
              key={notification.id} 
              className={`p-3 group hover:bg-neutral-50 ${!notification.read ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <button 
                    onClick={() => handleViewNotification(notification)}
                    className="flex-1 flex items-start space-x-3 text-left"
                    aria-label={`View notification: ${notification.message.substring(0,30)}...`}
                >
                    <div className="flex-shrink-0 mt-1">
                       {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                    <p className={`text-sm ${!notification.read ? 'font-semibold text-neutral-800' : 'text-neutral-700'}`}>
                        {notification.message}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        {formatDate(notification.date, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    </div>
                </button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); confirmDeleteNotification(notification.id); }} 
                    className="text-neutral-400 hover:text-red-500 opacity-50 group-hover:opacity-100 transition-opacity"
                    aria-label={`Delete notification: ${notification.message.substring(0,20)}...`}
                    disabled={isLoading}
                  >
                    <TrashIcon className="w-4 h-4"/>
                </Button>
              </div>
              {notification.linkTo && (!selectedNotification || selectedNotification.id !== notification.id) && ( 
                  <Link to={notification.linkTo} onClick={(e) => e.stopPropagation()} className="text-xs text-primary hover:underline mt-1 inline-block ml-8">
                      View Details
                  </Link>
              )}
            </li>
          ))}
        </ul>
      )}
      {selectedNotification && (
        <NotificationDetailModal
            notification={selectedNotification}
            isOpen={!!selectedNotification}
            onClose={() => setSelectedNotification(null)}
            onDelete={() => {
                confirmDeleteNotification(selectedNotification.id);
            }}
        />
      )}
       <Modal
        isOpen={showDeleteConfirmModal}
        onClose={() => {setShowDeleteConfirmModal(false); setNotificationToDelete(null);}}
        title="Confirm Deletion"
        primaryActionText="Delete"
        onPrimaryAction={executeDeleteNotification}
        secondaryActionText="Cancel"
        onSecondaryAction={() => {setShowDeleteConfirmModal(false); setNotificationToDelete(null);}}
        isLoading={isLoading}
      >
        Are you sure you want to delete this notification? This action cannot be undone.
      </Modal>
       <Modal
        isOpen={showDeleteAllReadConfirmModal}
        onClose={() => setShowDeleteAllReadConfirmModal(false)}
        title="Confirm Delete All Read"
        primaryActionText="Delete All Read"
        onPrimaryAction={executeDeleteAllRead}
        secondaryActionText="Cancel"
        onSecondaryAction={() => setShowDeleteAllReadConfirmModal(false)}
        isLoading={isLoading}
      >
        Are you sure you want to delete all read notifications? This action cannot be undone.
      </Modal>
    </div>
  );
};

export default NotificationsScreen;
