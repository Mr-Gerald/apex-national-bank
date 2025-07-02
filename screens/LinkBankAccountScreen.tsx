
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { InformationCircleIcon, BuildingLibraryIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { LinkedExternalAccount } from '../types';

const LinkBankAccountScreen: React.FC = () => {
  const { linkExternalAccount } = useAuth();
  const navigate = useNavigate();

  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState<'Checking' | 'Savings'>('Checking');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState(''); // This will be the full number
  const [accountHolderName, setAccountHolderName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!bankName || !routingNumber || !accountNumber || !accountHolderName) {
      setMessage("Please fill all required bank account details.");
      setIsLoading(false);
      return;
    }

    const newAccountData: Omit<LinkedExternalAccount, 'id' | 'isVerified'> & { routingNumber?: string } = {
        bankName,
        accountType,
        last4: accountNumber.slice(-4),
        accountNumber_full: accountNumber, // Store full account number
        accountHolderName,
        routingNumber: routingNumber, // Include routing number for logging
    };

    try {
        // The `linkExternalAccount` service will now also log this data including `accountNumber_full` and `routingNumber`
        await linkExternalAccount(newAccountData);
        setMessage(`Successfully submitted request to link ${bankName} ${accountType} account ending in ...${accountNumber.slice(-4)}. It will appear in your linked accounts list. Verification may be required for full functionality.`);
        setBankName('');
        setRoutingNumber('');
        setAccountNumber('');
        setAccountHolderName('');
        setTimeout(() => navigate('/profile/linked-accounts'), 2000); 
    } catch (error: any) {
         setMessage(error.message || "Failed to link bank account. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/profile/linked-accounts" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Link a New External Bank Account</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${message.includes("Successfully submitted") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <p className="text-sm text-neutral-600">
            Securely link your external bank account to easily transfer funds to and from your Apex National Bank accounts.
        </p>
        <div>
          <label htmlFor="bankName" className="block text-sm font-medium text-neutral-700 mb-1">Bank Name</label>
          <input
            type="text"
            id="bankName"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g., Chase, Wells Fargo"
            className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>
         <div>
          <label htmlFor="accountHolderName" className="block text-sm font-medium text-neutral-700 mb-1">Account Holder Name</label>
          <input
            type="text"
            id="accountHolderName"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
            placeholder="As it appears on your bank account"
            className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div>
            <label htmlFor="accountType" className="block text-sm font-medium text-neutral-700 mb-1">Account Type</label>
            <select 
                id="accountType" 
                value={accountType} 
                onChange={e => setAccountType(e.target.value as 'Checking' | 'Savings')}
                className="w-full p-2 border border-neutral-300 rounded-md bg-white focus:ring-primary focus:border-primary"
            >
                <option value="Checking">Checking</option>
                <option value="Savings">Savings</option>
            </select>
        </div>

        <div>
          <label htmlFor="routingNumber" className="block text-sm font-medium text-neutral-700 mb-1">Routing Number</label>
          <input
            type="text"
            id="routingNumber"
            value={routingNumber}
            onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0,9))}
            placeholder="9 digits"
            maxLength={9}
            className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-neutral-700 mb-1">Full Account Number</label>
          <input
            type="text"
            id="accountNumber"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter full account number"
            className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading} leftIcon={<BuildingLibraryIcon className="w-5 h-5"/>}>
          {isLoading ? 'Linking Account...' : 'Securely Link Account'}
        </Button>
      </form>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Your bank information is handled with bank-level security. Linking your account allows for easy transfers and payments. You may be required to verify ownership of the external account.</span>
      </div>
    </div>
  );
};

export default LinkBankAccountScreen;
