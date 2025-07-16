

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import { User, AppNotification } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { InformationCircleIcon, BellIcon as SendIcon } from '../../constants';

const AdminSendNotificationScreen: React.FC = () => {
    const { fetchAllUsersForAdmin, sendNotificationFromAdmin } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState<AppNotification['type']>('admin_message');
    const [linkTo, setLinkTo] = useState(''); 
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadUsers = async () => {
            setError(null);
            try {
                const fetchedUsers = await fetchAllUsersForAdmin(); 
                setUsers(fetchedUsers);
                if (fetchedUsers.length > 0) {
                    setSelectedUserId(fetchedUsers[0].id);
                }
            } catch (e: any) {
                console.error("Failed to load users for notification screen:", e);
                setError("Could not load users. Please try again later.");
            }
        };
        loadUsers();
    }, [fetchAllUsersForAdmin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        if (!selectedUserId || !notificationMessage) {
            setMessage("Please select a user and enter a notification message.");
            setIsLoading(false);
            return;
        }
        
        const finalLinkTo = linkTo.trim() ? linkTo.trim() : undefined;


        try {
            await sendNotificationFromAdmin(selectedUserId, notificationMessage, notificationType, finalLinkTo);
            setMessage(`Notification successfully sent to ${users.find(u=>u.id === selectedUserId)?.username || 'user'}.`);
            setNotificationMessage('');
            setNotificationType('admin_message');
            setLinkTo(''); 
        } catch (error: any) {
            setMessage(`Error sending notification: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-neutral-800">Send Notification</h1>

            {message && (
                <div className={`p-3 rounded-md ${message.includes("successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <div>
                    <label htmlFor="selectedUserId" className="block text-sm font-medium text-neutral-700 mb-1">Select User</label>
                    <select
                        id="selectedUserId"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full p-2 border border-neutral-300 rounded-md bg-white focus:ring-primary focus:border-primary"
                        required
                        disabled={users.length === 0}
                    >
                        <option value="" disabled>{users.length === 0 ? 'Loading or no users available...' : 'Select a user...'}</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.fullName} ({user.username})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="notificationType" className="block text-sm font-medium text-neutral-700 mb-1">Notification Type</label>
                    <select
                        id="notificationType"
                        value={notificationType}
                        onChange={(e) => setNotificationType(e.target.value as AppNotification['type'])}
                        className="w-full p-2 border border-neutral-300 rounded-md bg-white focus:ring-primary focus:border-primary"
                    >
                        <option value="admin_message">Admin Message</option>
                        <option value="general">General Information</option>
                        <option value="security">Security Alert</option>
                        <option value="transaction_update">Transaction Update</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="notificationMessage" className="block text-sm font-medium text-neutral-700 mb-1">Notification Message</label>
                    <textarea
                        id="notificationMessage"
                        value={notificationMessage}
                        onChange={(e) => setNotificationMessage(e.target.value)}
                        rows={4}
                        placeholder="Enter the notification content here..."
                        className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="linkTo" className="block text-sm font-medium text-neutral-700 mb-1">Link To (Optional)</label>
                    <input
                        type="text"
                        id="linkTo"
                        value={linkTo}
                        onChange={(e) => setLinkTo(e.target.value)}
                        placeholder="e.g., /dashboard OR https://www.externalsite.com"
                        className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                     <p className="text-xs text-neutral-500 mt-1">Enter an internal app path (e.g., `/accounts/xyz`) or a full external URL (e.g., `https://example.com`).</p>
                </div>
                
                <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading || users.length === 0} leftIcon={<SendIcon className="w-5 h-5"/>}>
                    {isLoading ? 'Sending...' : 'Send Notification'}
                </Button>
            </form>
            
            <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
                <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                <span>Use this tool to send important updates or messages to users. Notifications will appear in their in-app notification center.</span>
            </div>
        </div>
    );
};

export default AdminSendNotificationScreen;