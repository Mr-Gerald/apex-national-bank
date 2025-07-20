
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAccounts } from '../contexts/AccountContext';
import { formatCurrency } from '../utils/formatters';
import { InformationCircleIcon, BuildingLibraryIcon } from '../constants';

const ACHTransferScreen: React.FC = () => {
  const { accounts, initiateWireTransfer } = useAccounts();
  const [fromAccount, setFromAccount] = useState<string>(accounts[0]?.id || '');
  const [recipientName, setRecipientName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [transferType, setTransferType] = useState<'ach' | 'domestic_wire' | 'international_wire'>('ach');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  // New detailed fields for wire transfers
  const [recipientBankName, setRecipientBankName] = useState('');
  const [recipientBankAddress, setRecipientBankAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [purposeOfWire, setPurposeOfWire] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [recipientCountry, setRecipientCountry] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const isWire = transferType === 'domestic_wire' || transferType === 'international_wire';

    if (!fromAccount || !recipientName || !routingNumber || !accountNumber || !amount || parseFloat(amount) <= 0) {
      setMessage({type: 'error', text: "Please fill all required fields correctly."});
      setIsLoading(false);
      return;
    }
     if (isWire && (!recipientBankName || !recipientAddress || !purposeOfWire)) {
        setMessage({type: 'error', text: "For wire transfers, recipient's bank name, full address, and purpose of wire are required."});
        setIsLoading(false);
        return;
    }

    const numericAmount = parseFloat(amount);
    const sourceAccountData = accounts.find(acc => acc.id === fromAccount);
    if (sourceAccountData && sourceAccountData.balance < numericAmount) {
        setMessage({type: 'error', text: "Insufficient funds in the selected account."});
        setIsLoading(false);
        return;
    }

    if (isWire) {
        if (transferType === 'international_wire' && (!swiftCode || !recipientCountry || !recipientBankAddress)) {
            setMessage({type: 'error', text: "SWIFT/BIC code, Recipient's Country, and Recipient's Bank Address are required for international wires."});
            setIsLoading(false);
            return;
        }
        try {
            await initiateWireTransfer(fromAccount, numericAmount, recipientName, routingNumber, accountNumber, transferType === 'domestic_wire' ? 'domestic' : 'international', swiftCode, recipientCountry, recipientBankName, recipientBankAddress, recipientAddress, purposeOfWire, memo);
            setMessage({type: 'success', text: `Your wire transfer of ${formatCurrency(numericAmount)} has been submitted. It is now pending action from you. Please check your notifications to complete the process by contacting support.`});
            // Clear form
            setRecipientName(''); setRoutingNumber(''); setAccountNumber(''); setAmount(''); setMemo('');
            setSwiftCode(''); setRecipientCountry(''); setRecipientBankName(''); setRecipientBankAddress(''); setRecipientAddress(''); setPurposeOfWire('');
        } catch (error: any) {
             setMessage({type: 'error', text: error.message || "Failed to initiate wire transfer."});
        } finally {
            setIsLoading(false);
        }
    } else { // ACH Transfer (current simulation)
        setTimeout(() => {
          setIsLoading(false);
          setMessage({type: 'success', text: `Successfully initiated ACH transfer of ${formatCurrency(numericAmount)} to ${recipientName}. Transaction ID: ACH${Date.now().toString().slice(-6)}. Please allow 1-3 business days for this to complete.`});
          setRecipientName(''); setRoutingNumber(''); setAccountNumber(''); setAmount(''); setMemo('');
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
        <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
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
          <label htmlFor="transferType" className="block text-sm font-medium text-neutral-700 mb-1">Transfer Type</label>
          <select id="transferType" value={transferType} onChange={(e) => setTransferType(e.target.value as any)} className="w-full p-2 border border-neutral-300 rounded-md bg-white">
            <option value="ach">ACH Transfer (1-3 business days, no fee)</option>
            <option value="domestic_wire">Domestic Wire (Same day, fee applies)</option>
            <option value="international_wire">International Wire (1-2 days, fee applies)</option>
          </select>
        </div>

        <h3 className="text-md font-semibold text-neutral-700 pt-2 border-t mt-4">Recipient Details</h3>

        <div>
          <label htmlFor="recipientName" className="block text-sm font-medium text-neutral-700 mb-1">Recipient's Full Name</label>
          <input type="text" id="recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Alex Johnson" className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>
        {(transferType === 'domestic_wire' || transferType === 'international_wire') && (
            <div>
                <label htmlFor="recipientAddress" className="block text-sm font-medium text-neutral-700 mb-1">Recipient's Full Address (Street, City, Postal Code)</label>
                <input type="text" id="recipientAddress" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} placeholder="123 Main St, Anytown, 12345" className="w-full p-2 border border-neutral-300 rounded-md" required={transferType !== 'ach'} />
            </div>
        )}

        <h3 className="text-md font-semibold text-neutral-700 pt-2 border-t mt-4">Recipient's Bank Details</h3>
        
        {(transferType === 'domestic_wire' || transferType === 'international_wire') && (
            <div>
                <label htmlFor="recipientBankName" className="block text-sm font-medium text-neutral-700 mb-1">Recipient's Bank Name</label>
                <input type="text" id="recipientBankName" value={recipientBankName} onChange={(e) => setRecipientBankName(e.target.value)} placeholder="e.g., Chase, Bank of America" className="w-full p-2 border border-neutral-300 rounded-md" required={transferType !== 'ach'} />
            </div>
        )}
        
        <div>
          <label htmlFor="routingNumber" className="block text-sm font-medium text-neutral-700 mb-1">Recipient's Routing Number (ABA)</label>
          <input type="text" id="routingNumber" value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0,9))} placeholder="9 digits" maxLength={9} className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>

        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-neutral-700 mb-1">Recipient's Account Number</label>
          <input type="text" id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} placeholder="Account number" className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>
        
        {transferType === 'international_wire' && (
          <>
            <div>
                <label htmlFor="recipientBankAddress" className="block text-sm font-medium text-neutral-700 mb-1">Recipient's Bank Address</label>
                <input type="text" id="recipientBankAddress" value={recipientBankAddress} onChange={(e) => setRecipientBankAddress(e.target.value)} placeholder="Bank Street 1, London, UK" className="w-full p-2 border border-neutral-300 rounded-md" required={transferType === 'international_wire'} />
            </div>
            <div>
              <label htmlFor="swiftCode" className="block text-sm font-medium text-neutral-700 mb-1">SWIFT / BIC Code</label>
              <input type="text" id="swiftCode" value={swiftCode} onChange={(e) => setSwiftCode(e.target.value.toUpperCase())} placeholder="8-11 characters" className="w-full p-2 border border-neutral-300 rounded-md" required={transferType === 'international_wire'} />
            </div>
            <div>
              <label htmlFor="recipientCountry" className="block text-sm font-medium text-neutral-700 mb-1">Recipient's Country</label>
              <input type="text" id="recipientCountry" value={recipientCountry} onChange={(e) => setRecipientCountry(e.target.value)} placeholder="e.g., Canada, United Kingdom" className="w-full p-2 border border-neutral-300 rounded-md" required={transferType === 'international_wire'} />
            </div>
          </>
        )}
        
        <h3 className="text-md font-semibold text-neutral-700 pt-2 border-t mt-4">Transaction Details</h3>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-1">Amount (USD)</label>
          <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>

         {(transferType === 'domestic_wire' || transferType === 'international_wire') && (
            <div>
                <label htmlFor="purposeOfWire" className="block text-sm font-medium text-neutral-700 mb-1">Purpose of Wire</label>
                <input type="text" id="purposeOfWire" value={purposeOfWire} onChange={(e) => setPurposeOfWire(e.target.value)} placeholder="e.g., Family Support, Purchase of Goods" className="w-full p-2 border border-neutral-300 rounded-md" required={transferType !== 'ach'} />
            </div>
        )}

        <div>
          <label htmlFor="memo" className="block text-sm font-medium text-neutral-700 mb-1">Memo / Reference (Optional)</label>
          <input type="text" id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="E.g., Invoice #12345" className="w-full p-2 border border-neutral-300 rounded-md" />
        </div>
        
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading} leftIcon={<BuildingLibraryIcon className="w-5 h-5"/>}>
          {isLoading ? 'Processing...' : `Initiate ${transferType === 'ach' ? 'ACH' : 'Wire'} Transfer`}
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