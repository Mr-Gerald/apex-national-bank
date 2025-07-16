
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { InformationCircleIcon, TrashIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatters';
import Button from '../components/Button';

const LoginHistoryScreen: React.FC = () => {
  const { user, clearLoginHistory } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  // loginHistory will update when user object in AuthContext updates
  const loginHistory = user?.loginHistory || [];

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear your login history? This action cannot be undone.")) {
        setIsLoading(true);
        setMessage(null);
        try {
            await clearLoginHistory();
            setMessage("Login history cleared successfully.");
        } catch (error: any) {
            setMessage(error.message || "Failed to clear login history.");
        } finally {
            setIsLoading(false);
        }
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
            <Link to="/profile/security" className="text-primary hover:text-accent-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            </Link>
            <h1 className="text-2xl font-semibold text-neutral-800">Login History</h1>
        </div>
        {loginHistory.length > 0 && (
            <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearHistory} 
                isLoading={isLoading}
                disabled={isLoading}
                leftIcon={<TrashIcon className="w-4 h-4"/>}
            >
                Clear History
            </Button>
        )}
      </div>
      {message && (
        <div className={`p-3 rounded-md my-2 ${message.includes("successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <p className="text-sm text-neutral-600 mb-3">
          This page displays recent login attempts to your account. Review this regularly for any suspicious activity.
        </p>
        {loginHistory.length > 0 ? (
            <ul className="divide-y divide-neutral-100">
                {loginHistory.map(item => (
                    <li key={item.id} className="py-2">
                        <p className="text-sm font-medium text-neutral-800">
                            {formatDate(item.timestamp, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - {item.deviceInfo}
                        </p>
                        <p className="text-xs text-neutral-500">
                            IP: {item.ipAddress} - Status: <span className={item.status === 'Success' ? 'text-green-600' : 'text-red-600'}>{item.status}</span>
                        </p>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-neutral-500">No login history available yet.</p>
        )}
      </div>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>If you see any suspicious activity, please change your password immediately and contact support.</span>
      </div>
    </div>
  );
};

export default LoginHistoryScreen;