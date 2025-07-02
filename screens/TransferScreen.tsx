
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAccounts } from '../contexts/AccountContext';
import { formatCurrency } from '../utils/formatters';
import { BuildingLibraryIcon, InformationCircleIcon } from '../constants';
import { Account } from '../types';
import { useAuth } from '../contexts/AuthContext'; 

const TransferScreen: React.FC = () => {
  const { accounts, initiateTransfer, refreshUserAccounts } = useAccounts();
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const [fromAccount, setFromAccount] = useState<string>('');
  
  const [selectedToInternalAccount, setSelectedToInternalAccount] = useState<string>(''); 
  const [recipientInput, setRecipientInput] = useState<string>(''); 
  const [transferMode, setTransferMode] = useState<'internal' | 'user' | 'external'>('internal');

  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState<boolean>(false);
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);
  const [showReceiptButton, setShowReceiptButton] = useState(false);
  const [receiptTransactionId, setReceiptTransactionId] = useState<string | null>(null);
  const [receiptFromAccountId, setReceiptFromAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (accounts.length > 0 && !fromAccount) {
      setFromAccount(accounts[0].id);
    }
  }, [accounts, fromAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setShowReceiptButton(false);
    setReceiptTransactionId(null);
    setReceiptFromAccountId(null);

    const numericAmount = parseFloat(amount);
    if (!fromAccount || numericAmount <= 0) {
      setMessage({type: 'error', text: "Please select a 'From' account and enter a valid amount."});
      setIsLoading(false);
      return;
    }
    
    const sourceAccount = accounts.find(acc => acc.id === fromAccount);
    if (!sourceAccount) {
        setMessage({type: 'error', text: "Source account not found."});
        setIsLoading(false);
        return;
    }
    if (sourceAccount.balance < numericAmount) {
        setMessage({type: 'error', text: "Insufficient funds in the selected account."});
        setIsLoading(false);
        return;
    }

    try {
        let newTxIdForReceipt: string | undefined;
        if (transferMode === 'internal') {
            if (!selectedToInternalAccount) {
                setMessage({type: 'error', text: "Please select a valid 'To' account for internal transfer."});
                throw new Error("Internal 'To' account not selected.");
            }
            if (fromAccount === selectedToInternalAccount) {
                setMessage({type: 'error', text: "Cannot transfer to the same account."});
                throw new Error("Cannot transfer to the same account.");
            }
            newTxIdForReceipt = await initiateTransfer(fromAccount, selectedToInternalAccount, numericAmount, memo);
        
        } else if (transferMode === 'user') {
            if (!recipientInput.trim()) {
                setMessage({type: 'error', text: "Please enter recipient's username."});
                throw new Error("Recipient username not provided.");
            }
            if (user && recipientInput.toLowerCase() === user.username.toLowerCase()) {
                setMessage({type: 'error', text: "Cannot send funds to yourself using this method. Use internal transfer."});
                throw new Error("Cannot send funds to self by username.");
            }
            newTxIdForReceipt = await initiateTransfer(fromAccount, '', numericAmount, memo, recipientInput.trim());
        
        } else { // 'external' (Zelle-like)
            if (!recipientInput.trim()) {
                setMessage({type: 'error', text: "Please enter recipient's details (email/phone) for external transfer."});
                throw new Error("External recipient details not provided.");
            }
            setTimeout(() => { 
                setMessage({type: 'success', text: `Successfully sent ${formatCurrency(numericAmount)} via Zelle® to ${recipientInput}.`});
                 setIsLoading(false);
            }, 1000); 
            return; 
        }

        setMessage({type: 'info', text: "Transfer successful! Processing..."});
        setTimeout(() => {
            setMessage({type: 'success', text: "Transfer Processed. Receipt available."}); 
            if (newTxIdForReceipt) {
                setReceiptTransactionId(newTxIdForReceipt);
                setReceiptFromAccountId(fromAccount); // Store the fromAccount ID for receipt navigation
                setShowReceiptButton(true);
            }
            setIsLoading(false);
        }, 1000); 


        setAmount('');
        setMemo('');
        setSelectedToInternalAccount('');
        setRecipientInput('');

    } catch (error: any) {
        setMessage({type: 'error', text: error.message || "Transfer failed. Please try again."});
        setIsLoading(false);
    }
  };
  
  const handleViewReceipt = () => {
    if (!receiptFromAccountId || !receiptTransactionId) return;
    setIsLoadingReceipt(true);
    setTimeout(() => {
        setIsLoadingReceipt(false);
        navigate(`/transaction-detail/${receiptFromAccountId}/${receiptTransactionId}`);
    }, 1200);
  }

  const internalToAccounts = accounts.filter(acc => acc.id !== fromAccount);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-800">Make a Transfer</h1>
      
      {message && (
        <div className={`p-3 rounded-md my-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {message.text}
        </div>
      )}

      {!showReceiptButton ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div>
            <label htmlFor="fromAccount" className="block text-sm font-medium text-neutral-700 mb-1">From Account</label>
            <select
                id="fromAccount"
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary bg-white"
                required
            >
                <option value="" disabled>Select account</option>
                {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                    {acc.name} (...{acc.accountNumber.slice(-4)}) - {formatCurrency(acc.balance)}
                </option>
                ))}
            </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Transfer To</label>
                <div className="flex space-x-2 border border-neutral-200 rounded-md p-1 bg-neutral-100">
                    <Button type="button" onClick={() => setTransferMode('internal')} variant={transferMode === 'internal' ? 'primary': 'ghost'} className={`flex-1 ${transferMode !== 'internal' ? 'text-neutral-600' : ''}`}>My Accounts</Button>
                    <Button type="button" onClick={() => setTransferMode('user')} variant={transferMode === 'user' ? 'primary': 'ghost'} className={`flex-1 ${transferMode !== 'user' ? 'text-neutral-600' : ''}`}>Another User</Button>
                    <Button type="button" onClick={() => setTransferMode('external')} variant={transferMode === 'external' ? 'primary': 'ghost'} className={`flex-1 ${transferMode !== 'external' ? 'text-neutral-600' : ''}`}>Zelle®/External</Button>
                </div>
            </div>

            {transferMode === 'internal' && (
                <div>
                    <label htmlFor="toAccountInternal" className="block text-sm font-medium text-neutral-700 mb-1">To My Account</label>
                    <select
                        id="toAccountInternal"
                        value={selectedToInternalAccount}
                        onChange={(e) => setSelectedToInternalAccount(e.target.value)}
                        className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary bg-white"
                        required={transferMode === 'internal'}
                    >
                        <option value="" disabled>Select internal account</option>
                        {internalToAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                            {acc.name} (...{acc.accountNumber.slice(-4)})
                        </option>
                        ))}
                    </select>
                </div>
            )}

            {transferMode === 'user' && (
                <div>
                <label htmlFor="recipientUsername" className="block text-sm font-medium text-neutral-700 mb-1">Recipient's Username</label>
                <input
                    type="text"
                    id="recipientUsername"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    placeholder="Enter username"
                    className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
                    required={transferMode === 'user'}
                />
                </div>
            )}
            {transferMode === 'external' && (
                <div>
                <label htmlFor="toAccountExternal" className="block text-sm font-medium text-neutral-700 mb-1">To (Email, Phone for Zelle®)</label>
                <input
                    type="text"
                    id="toAccountExternal"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    placeholder="Recipient's Zelle® details"
                    className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
                    required={transferMode === 'external'}
                />
                </div>
            )}
            
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
                className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
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
                placeholder="E.g., Rent, Dinner"
                className="w-full p-2 border border-neutral-300 rounded-md"
            />
            </div>
            
            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Transfer Funds'}
            </Button>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Button 
                variant="primary" 
                className="w-full"
                onClick={handleViewReceipt}
                isLoading={isLoadingReceipt}
                disabled={isLoadingReceipt || !receiptFromAccountId || !receiptTransactionId}
            >
                {isLoadingReceipt ? 'Loading Receipt...' : 'View Receipt'}
            </Button>
            <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => {
                    setShowReceiptButton(false);
                    setMessage(null);
                    setReceiptTransactionId(null);
                    setReceiptFromAccountId(null);
                }}
            >
                Make Another Transfer
            </Button>
        </div>
      )}


      {transferMode !== 'external' && !showReceiptButton && (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-3">
            <h2 className="text-lg font-semibold text-neutral-700">Other Transfer Options</h2>
            <Link to="/transfer/ach">
                <Button variant="outline" className="w-full" leftIcon={<BuildingLibraryIcon className="w-5 h-5"/>}>
                    Send ACH or Wire Transfer (To Another Bank)
                </Button>
            </Link>
        </div>
      )}

       <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Transfers between Apex National Bank accounts are typically instant. External transfers may take 1-3 business days. Daily and transaction limits may apply. Review all details carefully before confirming any transfer.</span>
      </div>
    </div>
  );
};

export default TransferScreen;