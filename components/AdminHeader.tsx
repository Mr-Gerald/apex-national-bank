

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BANK_NAME, ArrowRightOnRectangleIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

const AdminHeader: React.FC = () => {
  const { requestAdminLogout } = useAuth();

  return (
    <header className="bg-slate-800 text-white p-3 shadow-md sticky top-0 z-50 border-b border-slate-700">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-accent">
            <path d="M12 2L2 22h20L12 2zm0 3.54L17.71 20H6.29L12 5.54z" />
            <path fillRule="evenodd" d="M12 5.536l-5.714 14.464h11.428L12 5.536zM7.5 20l4.5-10 4.5 10H7.5z" clipRule="evenodd" opacity="0.6" />
          </svg>
          <div>
            <h1 className="text-lg font-semibold leading-tight">{BANK_NAME} - Admin Panel</h1>
            <p className="text-xs opacity-80 leading-tight">Management Console</p>
          </div>
        </div>
        
        <nav className="flex items-center space-x-4">
            <Link to="/admin/dashboard" className="text-sm hover:text-accent-100">Dashboard</Link>
            <Link to="/admin/users" className="text-sm hover:text-accent-100">Users</Link>
            <Link to="/admin/notifications" className="text-sm hover:text-accent-100">Send Notification</Link>
            <Button 
              onClick={requestAdminLogout}
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-slate-700 p-1.5"
              aria-label="Admin Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </Button>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;