
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InformationCircleIcon, ShieldCheckIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const TwoFactorAuthScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile/security" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Two-Factor Authentication (2FA)</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-3 mb-3">
            <ShieldCheckIcon className="w-8 h-8 text-primary"/>
            <div>
                <h2 className="text-lg font-semibold">Current 2FA Status</h2>
                <p className={`text-md ${user?.securitySettings?.is2FAEnabled ? 'text-green-600' : 'text-red-600'}`}>
                    {user?.securitySettings?.is2FAEnabled ? `Enabled (${user.securitySettings.twoFAMethod || 'Method not set'})` : 'Disabled'}
                </p>
            </div>
        </div>
        
        <p className="text-sm text-neutral-600 mb-4">
          Two-Factor Authentication adds an extra layer of security to your account by requiring a second form of verification in addition to your password.
        </p>

        <Button 
            variant="primary" 
            onClick={() => navigate('/profile/security/2fa-setup')}
            className="w-full"
        >
            {user?.securitySettings?.is2FAEnabled ? 'Manage 2FA Settings' : 'Set Up Two-Factor Authentication'}
        </Button>
      </div>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>We strongly recommend enabling 2FA to protect your account against unauthorized access.</span>
      </div>
    </div>
  );
};

export default TwoFactorAuthScreen;
