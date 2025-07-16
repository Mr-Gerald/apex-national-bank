
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InformationCircleIcon } from '../constants';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

const BiometricLoginScreen: React.FC = () => {
  const { user, updateSecuritySettings } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(user?.securitySettings?.isBiometricEnabled || false); 
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.securitySettings) {
        setBiometricEnabled(user.securitySettings.isBiometricEnabled);
    }
  }, [user?.securitySettings]);


  const handleToggleBiometrics = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
        const newSetting = !biometricEnabled;
        await updateSecuritySettings({ isBiometricEnabled: newSetting });
        setBiometricEnabled(newSetting); // Local state update after successful save
        setMessage(`Biometric login has been ${newSetting ? 'enabled' : 'disabled'}.`);
    } catch (error: any) {
        setMessage(error.message || "Failed to update biometric setting.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile/security" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Biometric Login</h1>
      </div>

      {message && <div className={`p-3 rounded-md ${message.includes('enabled') ? 'bg-green-100 text-green-700' : message.includes('disabled') ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}


      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-lg font-medium text-neutral-800">Enable Biometric Login</h2>
                <p className="text-sm text-neutral-500">Use fingerprint or face recognition to log in quickly and securely (if supported by your device).</p>
            </div>
            <button
                type="button"
                className={`${
                biometricEnabled ? 'bg-primary' : 'bg-neutral-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                role="switch"
                aria-checked={biometricEnabled}
                onClick={handleToggleBiometrics}
                disabled={isLoading}
            >
                <span
                aria-hidden="true"
                className={`${
                    biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </div>
         {isLoading && <p className="text-sm text-primary mt-2">Updating setting...</p>}
      </div>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Biometric login availability depends on your device capabilities and operating system settings. You must have biometrics set up on your device first. This setting is saved to your profile.</span>
      </div>
    </div>
  );
};

export default BiometricLoginScreen;
