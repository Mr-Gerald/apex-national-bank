
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, InformationCircleIcon, KeyIcon, IdentificationIcon, ShieldCheckIcon as ShieldCheckHeroIcon, BellIcon as BellHeroIcon, QuestionMarkCircleIcon as QuestionMarkHeroIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatters';

const SecuritySettingsScreen: React.FC = () => {
  const { user } = useAuth();

  const SecurityOption: React.FC<{title: string, description: string, to: string, icon?: React.ReactNode}> = 
    ({title, description, to, icon}) => {
    const content = (
        <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
                {icon && <span className="text-primary">{icon}</span>}
                <div>
                    <h3 className="text-md font-medium text-neutral-800">{title}</h3>
                    <p className="text-sm text-neutral-500">{description}</p>
                </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-neutral-400" />
        </div>
    );
    return <Link to={to} className="block hover:bg-neutral-50 px-1 rounded-md">{content}</Link>;
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Security Settings</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md divide-y divide-neutral-100">
        <SecurityOption 
            title="Change Password" 
            description={user?.lastPasswordChange ? `Last changed: ${formatDate(user.lastPasswordChange)}` : "Set or change your account password"}
            to="/profile/security/change-password"
            icon={<KeyIcon className="w-5 h-5"/>}
        />
        <SecurityOption 
            title="Two-Factor Authentication (2FA)" 
            description={user?.securitySettings?.is2FAEnabled ? `Enabled (${user.securitySettings.twoFAMethod || 'Method not set'})` : "Disabled - Enhance account security"}
            to="/profile/security/2fa-setup" // Link to setup screen
            icon={<ShieldCheckHeroIcon className="w-5 h-5"/>} 
        />
         <SecurityOption 
            title="Security Questions" 
            description={user?.securitySettings?.hasSecurityQuestionsSet ? "Configured" : "Not set - Add questions for account recovery"}
            to="/profile/security/questions-setup" // Link to setup screen
            icon={<QuestionMarkHeroIcon className="w-5 h-5"/>}
        />
        <SecurityOption 
            title="Login History" 
            description="View recent login activity" 
            to="/profile/security/login-history"
            icon={<IdentificationIcon className="w-5 h-5"/>}
        />
         <SecurityOption 
            title="Recognized Devices" 
            description="Manage devices with trusted access" 
            to="/profile/security/devices"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>}
        />
        <SecurityOption 
            title="Security Alerts" 
            description="Customize your security notifications" 
            to="/profile/notifications"
            icon={<BellHeroIcon className="w-5 h-5"/>}
        />
         <SecurityOption 
            title="Biometric Login" 
            description={user?.securitySettings?.isBiometricEnabled ? "Enabled" : "Disabled - Enable fingerprint/face login"}
            to="/profile/security/biometrics"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Review your security settings regularly. For any concerns, contact support immediately.</span>
      </div>
    </div>
  );
};

export default SecuritySettingsScreen;
