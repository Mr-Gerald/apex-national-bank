
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { LinkedExternalAccount } from '../types';
import { InformationCircleIcon, BanknotesIcon, TrashIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';

const ManageLinkedAccountScreen: React.FC = () => {
  const { externalAccountId } = useParams<{ externalAccountId: string }>();
  const { user, unlinkExternalAccount } = useAuth();
  const navigate = useNavigate();
  
  const [account, setAccount] = useState<LinkedExternalAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true); // General loading for initial fetch
  const [actionLoading, setActionLoading] = useState(false); // Specific loading for actions like unlink
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    if (externalAccountId && user && user.linkedExternalAccounts) {
      const foundAccount = user.linkedExternalAccounts.find(acc => acc.id === externalAccountId);
      setAccount(foundAccount || null);
    } else {
      setAccount(null);
    }
    setIsLoading(false);
  }, [externalAccountId, user]);

  const handleRemoveAccount = async () => {
    if (!account) return;
    if (window.confirm(`Are you sure you want to remove the ${account.bankName} account ending in ...${account.last4}?`)) {
      setActionLoading(true);
      setMessage(null);
      try {
        await unlinkExternalAccount(account.id); // Use AuthContext function
        setMessage(`${account.bankName} account (...${account.last4}) has been unlinked.`);
        setTimeout(() => navigate('/profile/linked-accounts'), 1500);
      } catch (error: any) {
        setMessage(error.message || "Failed to unlink account.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleVerifyAccount = () => { 
    if (!account || account.isVerified) return;
    setActionLoading(true);
    setMessage(null);
    setTimeout(() => {
        // Simulate backend update and then reflect in AuthContext state
        const updatedAccount = { ...account, isVerified: true };
        // In a real app, you'd call a service to verify and then update user in AuthContext
        // For now, we assume the service would update the user object, which triggers re-render
        // For direct local demo of change:
        // setAccount(updatedAccount); 
        // if (user && user.updateExternalAccount) { // Fictional function for demo
        //   user.updateExternalAccount(updatedAccount); // This would update the user in AuthContext
        // }
        setMessage(`${account.bankName} account (...${account.last4}) verification process initiated. The account will show as verified once processed.`);
        // Manually update the local state for demo, AuthContext change would be ideal
        setAccount(prev => prev ? {...prev, isVerified: true} : null);
        alert("Verification initiated. The account status will update once processed.");
        setActionLoading(false);
    }, 1200);
  };


  if (isLoading) {
    return <div className="p-4 text-center">Loading account details...</div>;
  }

  if (!account) {
    return <div className="p-4 text-center text-red-500">Linked account not found. <Link to="/profile/linked-accounts" className="text-primary">Go back</Link>.</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile/linked-accounts" className="text-primary hover:text-accent-700" aria-label="Back to Linked Accounts">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Manage Linked Account</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${message.includes("unlinked") || message.includes("verified") || message.includes("verification process") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md space-y-3">
        <div className="flex items-center space-x-3">
            <BanknotesIcon className="w-10 h-10 text-accent"/>
            <div>
                <h2 className="text-xl font-semibold text-neutral-800">{account.bankName} - {account.accountType}</h2>
                <p className="text-md text-neutral-600">Account ending in ...{account.last4}</p>
            </div>
        </div>
        
        <div className="border-t pt-3">
            <p className="text-sm"><span className="font-medium text-neutral-700">Account Holder:</span> {account.accountHolderName}</p>
            <p className="text-sm">
                <span className="font-medium text-neutral-700">Status:</span> 
                {account.isVerified ? <span className="text-green-600 ml-1">Verified</span> : <span className="text-orange-500 ml-1">Verification Pending</span>}
            </p>
        </div>

        <div className="pt-3 space-y-2">
            {!account.isVerified && (
                <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleVerifyAccount}
                    isLoading={actionLoading}
                    disabled={actionLoading}
                >
                    Complete Verification
                </Button>
            )}
             <Button variant="outline" className="w-full" onClick={() => alert("Editing external account details requires re-linking the account for security reasons.")}>
                Edit Details
            </Button>
            <Button 
                variant="secondary" 
                className="w-full bg-red-500 hover:bg-red-700 text-white" 
                onClick={handleRemoveAccount}
                isLoading={actionLoading}
                disabled={actionLoading}
                leftIcon={<TrashIcon className="w-5 h-5"/>}
            >
                Unlink This Account
            </Button>
        </div>
      </div>
      
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Manage your linked external bank account. Unlinking will remove it from your profile. Account verification may be required for certain transactions.</span>
      </div>
    </div>
  );
};

export default ManageLinkedAccountScreen;