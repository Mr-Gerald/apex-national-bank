
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAccounts } from '../contexts/AccountContext';
import { formatCurrency } from '../utils/formatters';
import { InformationCircleIcon, ShareIcon, BANK_NAME } from '../constants'; 

const ZelleScreen: React.FC = () => {
  const { accounts } = useAccounts();
  const [fromAccount, setFromAccount] = useState<string>('');
  const [recipientInfo, setRecipientInfo] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (accounts.length > 0 && !fromAccount) {
      const primaryChecking = accounts.find(acc => acc.type === 'Primary Checking');
      setFromAccount(primaryChecking ? primaryChecking.id : accounts[0].id);
    }
  }, [accounts, fromAccount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!fromAccount || !recipientInfo || !amount || parseFloat(amount) <= 0) {
      setMessage("Please fill all required fields correctly: From account, Recipient, and Amount.");
      setIsLoading(false);
      return;
    }

    const numericAmount = parseFloat(amount);
    const sourceAccountData = accounts.find(acc => acc.id === fromAccount);
    if (!sourceAccountData) {
        setMessage("Selected source account not found.");
        setIsLoading(false);
        return;
    }
    if (sourceAccountData.balance < numericAmount) {
        setMessage("Insufficient funds in the selected account.");
        setIsLoading(false);
        return;
    }

    // Simulate Zelle transfer
    setTimeout(() => {
      setIsLoading(false);
      setMessage(`Successfully sent ${formatCurrency(numericAmount)} via Zelle® to ${recipientInfo}. Memo: ${memo || 'N/A'}.`);
      setRecipientInfo('');
      setAmount('');
      setMemo('');
    }, 1500);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/profile" className="text-primary hover:text-accent-700" aria-label="Back to Profile">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Send Money with Zelle®</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${message.includes("Successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="fromAccount" className="block text-sm font-medium text-neutral-700 mb-1">From Account</label>
          <select
            id="fromAccount"
            value={fromAccount}
            onChange={(e) => setFromAccount(e.target.value)}
            className="w-full p-2 border border-neutral-300 rounded-md bg-white"
            required
          >
            <option value="" disabled>Select account</option>
            {accounts.filter(acc => acc.type === 'Primary Checking' || acc.type === 'Business Checking').map(acc => ( 
              <option key={acc.id} value={acc.id}>
                {acc.name} (...{acc.accountNumber.slice(-4)}) - {formatCurrency(acc.balance)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="recipientInfo" className="block text-sm font-medium text-neutral-700 mb-1">Recipient's Email or U.S. Mobile Number</label>
          <input
            type="text"
            id="recipientInfo"
            value={recipientInfo}
            onChange={(e) => setRecipientInfo(e.target.value)}
            placeholder="Email address or U.S. mobile number"
            className="w-full p-2 border border-neutral-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-1">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            className="w-full p-2 border border-neutral-300 rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="memo" className="block text-sm font-medium text-neutral-700 mb-1">Memo (Optional)</label>
          <input
            type="text"
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="E.g., For dinner, Rent payment"
            maxLength={140}
            className="w-full p-2 border border-neutral-300 rounded-md"
          />
        </div>
        
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading} leftIcon={<ShareIcon className="w-5 h-5"/>}>
          {isLoading ? 'Sending...' : 'Send with Zelle®'}
        </Button>
      </form>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Zelle® and the Zelle® related marks are wholly owned by Early Warning Services, LLC and are used herein under license. Transactions typically occur in minutes when the recipient’s email address or U.S. mobile number is already enrolled with Zelle®. Use of Zelle® through ${BANK_NAME} is subject to terms and conditions.</span>
      </div>
    </div>
  );
};
export default ZelleScreen;