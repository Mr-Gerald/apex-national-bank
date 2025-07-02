import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAccounts } from '../contexts/AccountContext';
import { formatCurrency } from '../utils/formatters';
import { InformationCircleIcon, LinkIcon, ArrowDownCircleIcon } from '../constants';
import { LinkedExternalAccount } from '../types'; 
import { useAuth } from '../contexts/AuthContext'; // Import useAuth to get user-specific linked accounts

const TransferFromLinkedScreen: React.FC = () => {
  const { accounts } = useAccounts(); 
  const { user } = useAuth(); // Get current user

  // Use user's linked accounts, fallback to empty array if none or user not loaded
  const linkedAccountsData = user?.linkedExternalAccounts || [];

  const [toAccount, setToAccount] = useState<string>(''); 
  const [fromLinkedAccount, setFromLinkedAccount] = useState<string>(linkedAccountsData[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (accounts.length > 0 && !toAccount) {
      setToAccount(accounts[0].id);
    }
    if (linkedAccountsData.length > 0 && !fromLinkedAccount) {
      setFromLinkedAccount(linkedAccountsData[0].id);
    }
  }, [accounts, toAccount, linkedAccountsData, fromLinkedAccount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!toAccount || !fromLinkedAccount || !amount || parseFloat(amount) <= 0) {
      setMessage("Please select accounts and enter a valid amount.");
      setIsLoading(false);
      return;
    }
    
    // This remains illustrative as actual transfer isn't implemented
    setTimeout(() => {
      setIsLoading(false);
      const targetApexAccount = accounts.find(acc => acc.id === toAccount);
      const sourceLinkedAccount = linkedAccountsData.find(acc => acc.id === fromLinkedAccount);
      setMessage(`Successfully initiated transfer of ${formatCurrency(parseFloat(amount))} from ${sourceLinkedAccount?.bankName} (...${sourceLinkedAccount?.last4}) to your ${targetApexAccount?.name} account. Funds may take 1-3 business days to become available.`);
      setAmount('');
    }, 1500);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/deposit" className="text-primary hover:text-accent-700" aria-label="Back to Deposit Options">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Transfer from Linked Account</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${message.includes("Successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="fromLinkedAccount" className="block text-sm font-medium text-neutral-700 mb-1">From (External Linked Account)</label>
          <select id="fromLinkedAccount" value={fromLinkedAccount} onChange={(e) => setFromLinkedAccount(e.target.value)} className="w-full p-2 border border-neutral-300 rounded-md bg-white" required disabled={linkedAccountsData.length === 0}>
            <option value="" disabled>{linkedAccountsData.length === 0 ? 'No external accounts linked' : 'Select linked account'}</option>
            {linkedAccountsData.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.bankName} - {acc.accountType} (...{acc.last4})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="toAccount" className="block text-sm font-medium text-neutral-700 mb-1">To (Your Apex National Bank Account)</label>
          <select id="toAccount" value={toAccount} onChange={(e) => setToAccount(e.target.value)} className="w-full p-2 border border-neutral-300 rounded-md bg-white" required disabled={accounts.length === 0}>
             <option value="" disabled>{accounts.length === 0 ? 'No Apex accounts available' : 'Select your account'}</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (...{acc.accountNumber.slice(-4)})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-1">Amount to Transfer</label>
          <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>
        
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading || linkedAccountsData.length === 0 || accounts.length === 0} leftIcon={<ArrowDownCircleIcon className="w-5 h-5"/>}>
          {isLoading ? 'Processing Transfer...' : 'Initiate Transfer'}
        </Button>
      </form>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Funds transferred from linked external accounts are typically processed via ACH and may take 1-3 business days to become available. Ensure your external accounts are verified for seamless transfers.</span>
      </div>
       <Link to="/profile/linked-accounts">
            <Button variant='outline' className="w-full mt-2">Manage Linked Accounts</Button>
        </Link>
    </div>
  );
};

export default TransferFromLinkedScreen;