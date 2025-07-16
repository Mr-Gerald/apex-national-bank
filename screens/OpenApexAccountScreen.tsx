
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { AccountType, Account } from '../types'; 
import { InformationCircleIcon, BuildingLibraryIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext'; 
import { useAccounts } from '../contexts/AccountContext'; 

const OpenApexAccountScreen: React.FC = () => {
  const { addApexAccount } = useAuth(); 
  const { refreshUserAccounts } = useAccounts(); 
  const [accountType, setAccountType] = useState<AccountType>(AccountType.CHECKING);
  const [accountName, setAccountName] = useState<string>(AccountType.CHECKING); 
  const [initialDeposit, setInitialDeposit] = useState<string>('0');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccountTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as AccountType;
    setAccountType(newType);
    setAccountName(newType); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!agreedToTerms) {
      setMessage("You must agree to the terms and conditions to open an account.");
      setIsLoading(false);
      return;
    }
    if (!accountName.trim()) {
        setMessage("Please provide a name for your new account.");
        setIsLoading(false);
        return;
    }

    const depositAmount = parseFloat(initialDeposit) || 0;

    try {
        const newAccount = await addApexAccount({ 
            name: accountName, 
            type: accountType,
            initialBalance: depositAmount 
        }); 

        if (newAccount) {
            setMessage(`Application for a new ${accountName} (${accountType}) submitted successfully! Your new account will appear in your accounts list shortly.`);
            refreshUserAccounts(); 
            setAgreedToTerms(false);
            setAccountName(AccountType.CHECKING); 
            setAccountType(AccountType.CHECKING);
            setInitialDeposit('0');
        } else {
            throw new Error("Failed to create account through context.");
        }
    } catch (error: any) {
        setMessage(error.message || "Failed to submit account application.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/add-account-options" className="text-primary hover:text-accent-700" aria-label="Back to Add Account Options">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Open New Apex Account</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${message.includes("successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="accountType" className="block text-sm font-medium text-neutral-700 mb-1">Select Account Type</label>
          <select
            id="accountType"
            value={accountType}
            onChange={handleAccountTypeChange}
            className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary bg-white"
            required
          >
            <option value={AccountType.CHECKING}>Primary Checking</option>
            <option value={AccountType.SAVINGS}>High-Yield Savings</option>
            <option value={AccountType.BUSINESS_CHECKING}>Business Checking</option>
            <option value={AccountType.IRA}>IRA Account (Retirement)</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="accountName" className="block text-sm font-medium text-neutral-700 mb-1">Account Nickname</label>
          <input
            type="text"
            id="accountName"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="e.g., My Travel Fund"
            className="w-full p-2 border border-neutral-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label htmlFor="initialDeposit" className="block text-sm font-medium text-neutral-700 mb-1">Initial Deposit Amount (Optional)</label>
          <input
            type="number"
            id="initialDeposit"
            value={initialDeposit}
            onChange={(e) => setInitialDeposit(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full p-2 border border-neutral-300 rounded-md"
          />
        </div>


        {accountType === AccountType.BUSINESS_CHECKING && (
            <p className="text-sm text-neutral-600 p-2 bg-neutral-50 rounded-md">
                For Business Checking, additional documentation (e.g., EIN, business registration) would typically be required.
            </p>
        )}
         {accountType === AccountType.IRA && (
            <p className="text-sm text-neutral-600 p-2 bg-neutral-50 rounded-md">
                IRA accounts have specific contribution limits and tax implications. Please consult a financial advisor for details.
            </p>
        )}

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="agreedToTerms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded mt-1"
          />
          <label htmlFor="agreedToTerms" className="text-sm text-neutral-600">
            I have read and agree to the <Link to="/profile/terms" className="text-primary hover:underline">Account Terms & Conditions</Link> and <Link to="/profile/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </label>
        </div>
        
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading || !agreedToTerms} leftIcon={<BuildingLibraryIcon className="w-5 h-5"/>}>
          {isLoading ? 'Submitting Application...' : 'Submit Application'}
        </Button>
      </form>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>The account opening process is subject to review and approval. Initial deposits will be processed upon account activation.</span>
      </div>
    </div>
  );
};

export default OpenApexAccountScreen;