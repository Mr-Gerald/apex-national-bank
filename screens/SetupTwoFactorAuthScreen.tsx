
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { InformationCircleIcon, ShieldCheckIcon } from '../constants';

const SetupTwoFactorAuthScreen: React.FC = () => {
  const { user, updateSecuritySettings } = useAuth();
  const navigate = useNavigate();

  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.securitySettings?.is2FAEnabled || false);
  const [authMethod, setAuthMethod] = useState<'app' | 'sms' | undefined>(user?.securitySettings?.twoFAMethod);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.securitySettings) {
      setIs2FAEnabled(user.securitySettings.is2FAEnabled);
      setAuthMethod(user.securitySettings.twoFAMethod);
    }
  }, [user?.securitySettings]);

  const handleToggle2FA = async () => {
    setIsLoading(true);
    setMessage(null);
    const new2FAStatus = !is2FAEnabled;
    try {
      // If disabling, clear method. If enabling and no method, default to 'app'.
      const newMethod = new2FAStatus ? (authMethod || 'app') : undefined;
      await updateSecuritySettings({ is2FAEnabled: new2FAStatus, twoFAMethod: newMethod });
      setIs2FAEnabled(new2FAStatus);
      setAuthMethod(newMethod);
      setMessage(`Two-Factor Authentication has been ${new2FAStatus ? 'enabled' : 'disabled'}.`);
      if (!new2FAStatus) { // If disabling, no further steps
         setTimeout(() => navigate('/profile/security'), 1500);
      }
    } catch (error: any) {
      setMessage(error.message || "Failed to update 2FA status.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSetAuthMethod = async (method: 'app' | 'sms') => {
    if (!is2FAEnabled) { // Enable 2FA first if it's off
        await handleToggle2FA(); // This will enable it and set a default or the chosen method
    }
    // If already enabled, just update the method
    setIsLoading(true);
    setMessage(null);
    try {
        await updateSecuritySettings({ is2FAEnabled: true, twoFAMethod: method });
        setAuthMethod(method);
        setMessage(`2FA method set to ${method === 'app' ? 'Authenticator App' : 'SMS/Text Message'}.`);
        // Here you would typically show QR code for app or ask for phone number for SMS
        alert(`Illustrative: 2FA method set. ${method === 'app' ? 'Scan QR code (not shown).' : 'Verify phone number (not shown).'}`);
    } catch (error: any) {
        setMessage(error.message || "Failed to set 2FA method.");
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
        <h1 className="text-2xl font-semibold text-neutral-800">Two-Factor Authentication (2FA)</h1>
      </div>

      {message && <div className={`p-3 my-2 rounded-md ${message.includes('enabled') || message.includes('set to') ? 'bg-green-100 text-green-700' : message.includes('disabled') ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-lg font-medium text-neutral-800">Enable 2FA</h2>
                <p className="text-sm text-neutral-500">Add an extra layer of security to your account.</p>
            </div>
            <button
                type="button"
                className={`${is2FAEnabled ? 'bg-primary' : 'bg-neutral-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                role="switch"
                aria-checked={is2FAEnabled}
                onClick={handleToggle2FA}
                disabled={isLoading}
            >
                <span aria-hidden="true" className={`${is2FAEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
            </button>
        </div>

        {is2FAEnabled && (
          <div className="border-t pt-4 space-y-3">
            <h3 className="text-md font-semibold text-neutral-700">Choose Your Verification Method</h3>
            <div className="space-y-2">
                <Button 
                    variant={authMethod === 'app' ? "primary" : "outline"} 
                    className="w-full"
                    onClick={() => handleSetAuthMethod('app')}
                    disabled={isLoading}
                >
                    Authenticator App (Recommended)
                </Button>
                <Button 
                    variant={authMethod === 'sms' ? "primary" : "outline"} 
                    className="w-full"
                    onClick={() => handleSetAuthMethod('sms')}
                    disabled={isLoading}
                >
                    SMS/Text Message
                </Button>
            </div>
            {authMethod === 'app' && <p className="text-xs text-neutral-500 mt-2">You'll need an authenticator app like Google Authenticator or Authy. A QR code would be displayed here to scan.</p>}
            {authMethod === 'sms' && <p className="text-xs text-neutral-500 mt-2">Codes will be sent to your registered phone number. Ensure your phone number is up to date.</p>}
          </div>
        )}
         {isLoading && <p className="text-sm text-primary mt-2 text-center">Updating 2FA settings...</p>}
      </div>

      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Using 2FA significantly increases your account security. Choose the method that works best for you.</span>
      </div>
    </div>
  );
};

export default SetupTwoFactorAuthScreen;
