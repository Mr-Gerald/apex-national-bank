
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BANK_NAME, BANK_SLOGAN, ArrowRightOnRectangleIcon, BellIcon, RefreshCcwIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useAccounts } from '../contexts/AccountContext'; // For refresh
import Button from './Button';

const Header: React.FC = () => {
  const { isAuthenticated, requestLogout, user, fetchLatestUserData } = useAuth();
  const { refreshUserAccounts } = useAccounts();
  const navigate = useNavigate();

  const unreadNotifications = user?.notifications?.filter(n => !n.read).length || 0;

  const handleRefresh = () => {
    fetchLatestUserData(); // Refreshes user data including notifications
    refreshUserAccounts(); // Refreshes account data
    // Could add a small visual cue or toast that data has been refreshed
  };

  return (
    <header className="bg-primary text-white p-3 shadow-md sticky top-0 z-50 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-accent">
            <path d="M12 2L2 22h20L12 2zm0 3.54L17.71 20H6.29L12 5.54z" />
            <path fillRule="evenodd" d="M12 5.536l-5.714 14.464h11.428L12 5.536zM7.5 20l4.5-10 4.5 10H7.5z" clipRule="evenodd" opacity="0.6" />
          </svg>
          <div>
            <h1 className="text-lg font-semibold leading-tight">{BANK_NAME}</h1>
            <p className="text-xs opacity-80 leading-tight">{BANK_SLOGAN}</p>
          </div>
        </div>
        
        {isAuthenticated && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-1.5 relative"
              aria-label="Refresh Data"
            >
              <RefreshCcwIcon className="w-5 h-5" />
            </Button>
            <Button 
                onClick={() => navigate('/notifications')}
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/20 p-1.5 relative"
                aria-label="Notifications"
            >
                <BellIcon className="w-5 h-5" />
                {unreadNotifications > 0 && (
                     <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
                        <span className="flex items-center justify-center text-[0.6rem] font-bold text-white bg-red-600 rounded-full min-w-[1rem] h-4 px-1">
                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                    </span>
                )}
            </Button>
            <Button 
              onClick={requestLogout}
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20 p-1.5"
              aria-label="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;