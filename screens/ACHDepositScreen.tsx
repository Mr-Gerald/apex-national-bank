
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAccounts } from '../contexts/AccountContext';
import { formatCurrency } from '../utils/formatters';
import { InformationCircleIcon, BuildingLibraryIcon, ArrowDownCircleIcon } from '../constants';

const ACHDepositScreen: React.FC = () => {
  const { accounts } = useAccounts();
  const [toAccount, setToAccount] = useState<string>('');
  const [externalBankName, setExternalBankName] = useState('');
  const [externalRoutingNumber, setExternalRoutingNumber] = useState('');
  const [externalAccountNumber, setExternalAccountNumber] = useState('');
  const [externalAccountType, setExternalAccountType] = useState<'checking' | 'savings'>('checking');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (accounts.length > 0 && !toAccount) {
      setToAccount(accounts[0].id);
    }
  }, [accounts, toAccount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!toAccount || !externalBankName || !externalRoutingNumber || !externalAccountNumber || !amount || parseFloat(amount) <= 0) {
      setMessage("Please fill all required fields correctly.");
      setIsLoading(false);
      return;
    }

    // Simulate API call for ACH pull
    setTimeout(() => {
      setIsLoading(false);
      const targetAccount = accounts.find(acc => acc.id === toAccount);
      setMessage(`Successfully initiated ACH deposit of ${formatCurrency(parseFloat(amount))} from ${externalBankName} (ending ...${externalAccountNumber.slice(-4)}) to your ${targetAccount?.name} account. Funds may take 1-3 business days to become available.`);
      // Reset form
      setExternalBankName('');
      setExternalRoutingNumber('');
      setExternalAccountNumber('');
      setAmount('');
    }, 2000);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/deposit" className="text-primary hover:text-accent-700" aria-label="Back to Deposit Options">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Deposit via ACH Pull</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${message.includes("Successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="toAccount" className="block text-sm font-medium text-neutral-700 mb-1">Deposit to (Your Account)</label>
          <select id="toAccount" value={toAccount} onChange={(e) => setToAccount(e.target.value)} className="w-full p-2 border border-neutral-300 rounded-md bg-white" required>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (...{acc.accountNumber.slice(-4)})
              </option>
            ))}
          </select>
        </div>
        
        <h3 className="text-md font-semibold text-neutral-700 pt-2 border-t mt-4">External Account Details</h3>

        <div>
          <label htmlFor="externalBankName" className="block text-sm font-medium text-neutral-700 mb-1">External Bank Name</label>
          <input type="text" id="externalBankName" value={externalBankName} onChange={(e) => setExternalBankName(e.target.value)} placeholder="e.g., Chase, Bank of America" className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>
        
        <div>
          <label htmlFor="externalRoutingNumber" className="block text-sm font-medium text-neutral-700 mb-1">External Routing Number</label>
          <input type="text" id="externalRoutingNumber" value={externalRoutingNumber} onChange={(e) => setExternalRoutingNumber(e.target.value.replace(/\D/g, '').slice(0,9))} placeholder="9 digits" maxLength={9} className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>

        <div>
          <label htmlFor="externalAccountNumber" className="block text-sm font-medium text-neutral-700 mb-1">External Account Number</label>
          <input type="text" id="externalAccountNumber" value={externalAccountNumber} onChange={(e) => setExternalAccountNumber(e.target.value.replace(/\D/g, ''))} placeholder="Account number" className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>

        <div>
          <label htmlFor="externalAccountType" className="block text-sm font-medium text-neutral-700 mb-1">External Account Type</label>
          <select id="externalAccountType" value={externalAccountType} onChange={(e) => setExternalAccountType(e.target.value as 'checking' | 'savings')} className="w-full p-2 border border-neutral-300 rounded-md bg-white">
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-1">Amount to Deposit</label>
          <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>
        
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading} leftIcon={<ArrowDownCircleIcon className="w-5 h-5"/>}>
          {isLoading ? 'Processing Deposit...' : 'Initiate Deposit'}
        </Button>
      </form>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>By submitting, you authorize Apex National Bank to debit the specified external account for the deposit amount. Ensure all details are accurate.</span>
      </div>
    </div>
  );
};

export default ACHDepositScreen;