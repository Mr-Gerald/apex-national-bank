import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAccounts } from '../contexts/AccountContext';
import { formatCurrency } from '../utils/formatters';
import { InformationCircleIcon, BuildingLibraryIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';

const ACHTransferScreen: React.FC = () => {
  const { accounts } = useAccounts();
  const { initiateWireTransfer } = useAuth();
  const [fromAccount, setFromAccount] = useState<string>(accounts[0]?.id || '');
  const [recipientName, setRecipientName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [transferType, setTransferType] = useState<'ach' | 'wire'>('ach');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!fromAccount || !recipientName || !routingNumber || !accountNumber || !amount || parseFloat(amount) <= 0) {
      setMessage("Please fill all required fields correctly.");
      setIsLoading(false);
      return;
    }

    const numericAmount = parseFloat(amount);
    const sourceAccountData = accounts.find(acc => acc.id === fromAccount);
    if (sourceAccountData && sourceAccountData.balance < numericAmount) {
        setMessage("Insufficient funds in the selected account.");
        setIsLoading(false);
        return;
    }

    if (transferType === 'wire') {
        try {
            await initiateWireTransfer(fromAccount, numericAmount, recipientName, memo);
            setMessage(`Wire transfer for ${formatCurrency(numericAmount)} to ${recipientName} has been submitted and is pending security verification. Please check your notifications for the next steps.`);
            // Reset form
            setRecipientName('');
            setRoutingNumber('');
            setAccountNumber('');
            setAmount('');
            setMemo('');
        } catch (error: any) {
            setMessage(error.message || 'Failed to initiate wire transfer.');
        } finally {
            setIsLoading(false);
        }
    } else { // ACH transfer
        // Keep existing simulation for ACH
        setTimeout(() => {
            setIsLoading(false);
            setMessage(`Successfully initiated ${transferType.toUpperCase()} transfer of ${formatCurrency(numericAmount)} to ${recipientName}. Transaction ID: ACH${Date.now().toString().slice(-6)}. Please allow 1-3 business days for ACH transfers to complete.`);
            setRecipientName('');
            setRoutingNumber('');
            setAccountNumber('');
            setAmount('');
            setMemo('');
        }, 2000);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/transfer" className="text-primary hover:text-accent">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">ACH / Wire Transfer</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${message.includes("Successfully") || message.includes("submitted") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="fromAccount" className="block text-sm font-medium text-neutral-700 mb-1">From Account</label>
          <select id="fromAccount" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)} className="w-full p-2 border border-neutral-300 rounded-md bg-white" required>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (...{acc.accountNumber.slice(-4)}) - {formatCurrency(acc.balance)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="recipientName" className="block text-sm font-medium text-neutral-700 mb-1">Recipient's Full Name</label>
          <input type="text" id="recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Alex Johnson" className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>
        
        <div>
          <label htmlFor="routingNumber" className="block text-sm font-medium text-neutral-700 mb-1">Recipient's Routing Number</label>
          <input type="text" id="routingNumber" value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0,9))} placeholder="9 digits" maxLength={9} className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>

        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-neutral-700 mb-1">Recipient's Account Number</label>
          <input type="text" id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} placeholder="Account number" className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>
        
        <div>
          <label htmlFor="transferType" className="block text-sm font-medium text-neutral-700 mb-1">Transfer Type</label>
          <select id="transferType" value={transferType} onChange={(e) => setTransferType(e.target.value as 'ach' | 'wire')} className="w-full p-2 border border-neutral-300 rounded-md bg-white">
            <option value="ach">ACH Transfer (1-3 business days, typically no fee)</option>
            <option value="wire">Wire Transfer (Same day, may incur fee)</option>
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-1">Amount</label>
          <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>

        <div>
          <label htmlFor="memo" className="block text-sm font-medium text-neutral-700 mb-1">Memo (Optional)</label>
          <input type="text" id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="E.g., Invoice payment" className="w-full p-2 border border-neutral-300 rounded-md" />
        </div>
        
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading} leftIcon={<BuildingLibraryIcon className="w-5 h-5"/>}>
          {isLoading ? 'Processing...' : `Initiate ${transferType.toUpperCase()} Transfer`}
        </Button>
      </form>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Please verify all recipient information carefully before submitting. Transfers are processed based on the information provided. Daily and transaction limits may apply. Applicable fees for Wire Transfers will be debited from your selected account.</span>
      </div>
    </div>
  );
};

export default ACHTransferScreen;