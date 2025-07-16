import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAccounts } from '../contexts/AccountContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { InformationCircleIcon, ArrowUpTrayIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { ScheduledPayment } from '../types';

const PayNewBillScreen: React.FC = () => {
  const { user, addScheduledPayment } = useAuth();
  const { accounts } = useAccounts();

  const payeesData = user?.payees || [];

  const [fromAccount, setFromAccount] = useState<string>('');
  const [selectedPayeeId, setSelectedPayeeId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]); 
  const [memo, setMemo] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'One-time' | 'Monthly' | 'Bi-Weekly' | 'Annually'>('Monthly');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

   useEffect(() => {
    if (accounts.length > 0 && !fromAccount) {
      const primaryChecking = accounts.find(acc => acc.type === 'Primary Checking');
      setFromAccount(primaryChecking ? primaryChecking.id : accounts[0].id);
    }
    if (payeesData.length > 0 && !selectedPayeeId) {
        setSelectedPayeeId(payeesData[0].id);
    }
  }, [accounts, fromAccount, payeesData, selectedPayeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!fromAccount || !selectedPayeeId || !amount || parseFloat(amount) <= 0 || !paymentDate) {
      setMessage("Please fill all required fields correctly.");
      setIsLoading(false);
      return;
    }
    
    const numericAmount = parseFloat(amount);
    const sourceAccount = accounts.find(acc => acc.id === fromAccount);
    if (sourceAccount && sourceAccount.balance < numericAmount) {
        setMessage("Insufficient funds in the selected account for this bill payment.");
        setIsLoading(false);
        return;
    }

    const payeeDetails = payeesData.find(p => p.id === selectedPayeeId);
    if (!payeeDetails) {
        setMessage("Selected payee not found.");
        setIsLoading(false);
        return;
    }

    const paymentData: Omit<ScheduledPayment, 'id' | 'status'> = {
        payeeId: selectedPayeeId,
        payeeName: payeeDetails.name,
        amount: numericAmount,
        paymentDate,
        frequency: isRecurring ? frequency : 'One-time',
    };
    
    try {
        await addScheduledPayment(paymentData);
        setMessage(`Successfully scheduled ${isRecurring ? frequency : 'one-time'} payment of ${formatCurrency(numericAmount)} to ${payeeDetails?.name} on ${formatDate(paymentDate)}. Memo: ${memo || 'N/A'}.`);
        setAmount('');
        setMemo('');
    } catch (error: any) {
        setMessage(error.message || "Failed to schedule payment.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/pay-bills" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Pay a Bill</h1>
      </div>
      
      {message && (
        <div className={`p-3 rounded-md ${message.includes("Successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="fromAccount" className="block text-sm font-medium text-neutral-700 mb-1">Pay From Account</label>
          <select id="fromAccount" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)} className="w-full p-2 border border-neutral-300 rounded-md bg-white" required >
            <option value="" disabled>Select account</option>
            {accounts.filter(acc => acc.type === 'Primary Checking' || acc.type === 'Business Checking').map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (...{acc.accountNumber.slice(-4)}) - {formatCurrency(acc.balance)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="selectedPayeeId" className="block text-sm font-medium text-neutral-700 mb-1">Pay To (Select Payee)</label>
          <select id="selectedPayeeId" value={selectedPayeeId} onChange={(e) => setSelectedPayeeId(e.target.value)} className="w-full p-2 border border-neutral-300 rounded-md bg-white" required >
            <option value="" disabled>Select payee</option>
            {payeesData.map(payee => (
              <option key={payee.id} value={payee.id}>
                {payee.name} ({payee.category})
              </option>
            ))}
          </select>
          <Link to="/pay-bills/payees" className="text-xs text-primary hover:underline mt-1 inline-block">Manage Payees</Link>
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-1">Amount</label>
          <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>

        <div>
          <label htmlFor="paymentDate" className="block text-sm font-medium text-neutral-700 mb-1">Payment Date</label>
          <input type="date" id="paymentDate" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>
        
        <div className="flex items-center space-x-2">
            <input type="checkbox" id="isRecurring" checked={isRecurring} onChange={() => setIsRecurring(!isRecurring)} className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded" />
            <label htmlFor="isRecurring" className="text-sm text-neutral-600">Make this a recurring payment</label>
        </div>

        {isRecurring && (
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-neutral-700 mb-1">Frequency</label>
              <select id="frequency" value={frequency} onChange={(e) => setFrequency(e.target.value as any)} className="w-full p-2 border border-neutral-300 rounded-md bg-white">
                <option value="Monthly">Monthly</option>
                <option value="Bi-Weekly">Bi-Weekly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
        )}

        <div>
          <label htmlFor="memo" className="block text-sm font-medium text-neutral-700 mb-1">Memo (Optional)</label>
          <input type="text" id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="E.g., Account #123, Invoice #456" className="w-full p-2 border border-neutral-300 rounded-md" />
        </div>
        
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading} leftIcon={<ArrowUpTrayIcon className="w-5 h-5"/>}>
          {isLoading ? 'Processing Payment...' : (isRecurring ? 'Schedule Recurring Payment' : 'Make Payment')}
        </Button>
      </form>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Please ensure your payment details and payee information are correct. Payments will be processed on the selected date, subject to funds availability and processing times.</span>
      </div>
    </div>
  );
};

export default PayNewBillScreen;