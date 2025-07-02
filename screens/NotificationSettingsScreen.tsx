
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InformationCircleIcon } from '../constants';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserNotificationPreferences } from '../types';

const NotificationSettingsScreen: React.FC = () => {
  const { user, updateUserNotificationPreferences } = useAuth();
  
  const initialPreferences: UserNotificationPreferences = {
    transactions: true,
    lowBalance: true,
    securityAlerts: true,
    promotions: false,
    appUpdates: true,
    lowBalanceThreshold: 100,
  };

  const [preferences, setPreferences] = useState<UserNotificationPreferences>(
    user?.notificationPreferences || initialPreferences
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.notificationPreferences) {
      setPreferences(user.notificationPreferences);
    }
  }, [user?.notificationPreferences]);

  const handleToggle = async (key: keyof Pick<UserNotificationPreferences, 'transactions' | 'lowBalance' | 'securityAlerts' | 'promotions' | 'appUpdates'>) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);
    await handleSavePreferences(newPreferences);
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({ ...prev, lowBalanceThreshold: parseInt(e.target.value, 10) || 0 }));
  };
  
  const handleSaveThreshold = async () => {
    await handleSavePreferences(preferences);
  };

  const handleSavePreferences = async (currentPrefs: UserNotificationPreferences) => {
    setIsSaving(true);
    setMessage(null);
    try {
      await updateUserNotificationPreferences(currentPrefs);
      setMessage("Notification preferences updated successfully.");
    } catch (error: any) {
      setMessage(error.message || "Failed to save preferences.");
    } finally {
      setIsSaving(false);
    }
  };


  const ToggleOption: React.FC<{id: keyof Pick<UserNotificationPreferences, 'transactions' | 'lowBalance' | 'securityAlerts' | 'promotions' | 'appUpdates'>, label: string, description: string}> = ({id, label, description}) => (
    <div className="flex justify-between items-center py-3">
        <div>
            <h3 className="text-md font-medium text-neutral-800">{label}</h3>
            <p className="text-sm text-neutral-500">{description}</p>
        </div>
        <button
            type="button"
            className={`${
            preferences[id] ? 'bg-primary' : 'bg-neutral-200'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
            role="switch"
            aria-checked={preferences[id]}
            onClick={() => handleToggle(id)}
            disabled={isSaving}
        >
            <span
            aria-hidden="true"
            className={`${
                preferences[id] ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    </div>
  );


  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Notification Settings</h1>
      </div>

      {message && <div className={`p-3 rounded-md my-2 ${message.includes("successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

      <div className="bg-white p-4 rounded-lg shadow-md divide-y divide-neutral-100">
        <ToggleOption 
            id="transactions"
            label="Transaction Alerts"
            description="Receive alerts for deposits, withdrawals, and payments."
        />
        <ToggleOption 
            id="lowBalance"
            label="Low Balance Warnings"
            description="Get notified if your balance drops below a set threshold."
        />
        {preferences.lowBalance && (
            <div className="py-3 pl-4 space-y-2">
                <label htmlFor="lowBalanceThreshold" className="block text-sm font-medium text-neutral-600">Low Balance Threshold ($)</label>
                <div className="flex items-center space-x-2">
                    <input 
                        type="number" 
                        id="lowBalanceThreshold"
                        value={preferences.lowBalanceThreshold}
                        onChange={handleThresholdChange}
                        className="w-full max-w-xs p-2 border border-neutral-300 rounded-md"
                        min="0"
                        step="10"
                        disabled={isSaving}
                    />
                    <Button size="sm" variant="outline" onClick={handleSaveThreshold} isLoading={isSaving} disabled={isSaving}>Save Threshold</Button>
                </div>
            </div>
        )}
         <ToggleOption 
            id="securityAlerts"
            label="Security Alerts"
            description="Important notifications about your account security."
        />
        <ToggleOption 
            id="promotions"
            label="Promotions & Offers"
            description="Receive updates on new products and special offers."
        />
         <ToggleOption 
            id="appUpdates"
            label="App Updates & News"
            description="Stay informed about new app features and bank news."
        />
      </div>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Manage your notification preferences here. Changes are saved to your profile.</span>
      </div>
    </div>
  );
};

export default NotificationSettingsScreen;