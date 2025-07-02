
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InformationCircleIcon, ShieldCheckIcon } from '../constants';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

const StartIdentityVerificationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine if it's for top-tier or generic/on-hold funds. For now, this screen is specifically for profile verification for top-tier.
  const isProfileTopTierVerification = true; 

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <button onClick={() => navigate(-1)} className="text-primary hover:text-accent-700 p-1" aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </button>
        <h1 className="text-2xl font-semibold text-neutral-800">Identity Verification</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <ShieldCheckIcon className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-neutral-700 mb-2">
            {isProfileTopTierVerification ? "Unlock Top-Tier Account Features" : "Protecting Your Account"}
        </h2>
        <p className="text-sm text-neutral-600 mb-4">
          To ensure the security of your account, comply with financial regulations, and {isProfileTopTierVerification ? "provide you access to enhanced account features" : "release on-hold funds"}, we require identity verification.
          This process helps us confirm that you are the rightful owner of the account and protects you from unauthorized access.
        </p>

        {isProfileTopTierVerification && (
            <>
                <p className="text-sm text-neutral-600">
                By completing this verification, you'll gain access to benefits such as:
                </p>
                <ul className="list-disc list-inside text-left text-sm text-neutral-600 my-3 mx-auto max-w-xs">
                    <li>Higher transaction limits</li>
                    <li>Access to premium support</li>
                    <li>Eligibility for exclusive products and offers</li>
                </ul>
                 <Button variant="primary" onClick={() => navigate('/profile-verification/data')} className="w-full max-w-xs mx-auto">
                    Start Verification for Top-Tier Access
                </Button>
            </>
        )}

        {!isProfileTopTierVerification && (
            <>
                <p className="text-sm text-neutral-600">
                Identity verification is typically required for specific actions, such as:
                </p>
                <ul className="list-disc list-inside text-left text-sm text-neutral-600 my-3 mx-auto max-w-xs">
                    <li>Receiving certain types of payments or large transfers.</li>
                    <li>Accessing high-value services.</li>
                    <li>When unusual activity is detected on your account.</li>
                </ul>
                <p className="text-sm text-neutral-600">
                If a transaction you initiated is on hold pending verification, please return to that transaction's details page and follow the specific verification link provided there.
                </p>
                 <Button variant="outline" onClick={() => navigate('/profile')} className="w-full max-w-xs mx-auto mt-3">
                    Back to Profile
                </Button>
            </>
        )}
      </div>

      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>
            {isProfileTopTierVerification 
                ? "This verification flow is designed to enhance your account. Your data is handled securely."
                : "Specific verification flows are usually initiated from the context of a transaction or service requiring it."
            }
        </span>
      </div>
    </div>
  );
};

export default StartIdentityVerificationScreen;
