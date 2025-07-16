



import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAccounts } from '../contexts/AccountContext';
import { formatCurrency } from '../utils/formatters';
import { InformationCircleIcon, BuildingLibraryIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { WireTransferDetails } from '../types';
import { FormRow } from '../components/FormRow';

const ACHTransferScreen: React.FC = () => {
  const { user, initiateAchWireTransfer } = useAuth();
  const { accounts } = useAccounts();
  const navigate = useNavigate();
  
  // Form State
  const [fromAccount, setFromAccount] = useState<string>(accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [tab, setTab] = useState<'domestic' | 'international'>('domestic');

  // Recipient Info
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientCity, setRecipientCity] = useState('');
  const [recipientState, setRecipientState] = useState('');
  const [recipientZip, setRecipientZip] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  
  // Bank Info
  const [bankName, setBankName] = useState('');
  const [bankAddress, setBankAddress] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<'Checking' | 'Savings'>('Checking');
  
  // International Info
  const [swiftCode, setSwiftCode] = useState('');
  const [iban, setIban] = useState('');

  // Transfer Details
  const [purposeOfTransfer, setPurposeOfTransfer] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [reference, setReference] = useState('');

  // Control State
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const commonFieldsFilled = fromAccount && recipientName && recipientAddress && recipientCity && recipientState && recipientZip && bankName && bankAddress && routingNumber && accountNumber && amount && parseFloat(amount) > 0;
    const internationalFieldsFilled = tab === 'international' ? swiftCode || iban : true;

    if (!commonFieldsFilled || !internationalFieldsFilled) {
      setMessage("Please fill all required fields for the selected transfer type.");
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
    
    // Always use the special workflow for user 'Alex'
    if (user?.username === 'Alex') {
        const transferDetails: WireTransferDetails = {
            transferType: tab,
            amount: numericAmount,
            recipientName, recipientAddress, recipientCity, recipientState, recipientZip, recipientPhone,
            bankName, bankAddress, routingNumber, accountNumber, accountType,
            swiftCode: tab === 'international' ? swiftCode : undefined,
            iban: tab === 'international' ? iban : undefined,
            purposeOfTransfer, paymentInstructions, reference
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 3000)); // Longer, more realistic delay
            const newTxId = await initiateAchWireTransfer(fromAccount, transferDetails);
            // On success, navigate to the receipt page
            navigate(`/transaction-detail/${fromAccount}/${newTxId}`);
        } catch (error: any) {
            setMessage(error.message || "Failed to initiate transfer.");
            setIsLoading(false);
        }
        return;
    }

    // Default workflow for other (non-Alex) users (for future use, currently Alex is the only one)
    setTimeout(() => {
      setIsLoading(false);
      setMessage(`Successfully initiated ${tab.toUpperCase()} transfer of ${formatCurrency(numericAmount)} to ${recipientName}. Please allow appropriate time for processing.`);
    }, 2000);
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
        <div className={`p-3 rounded-md ${message.includes("Successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div>
          <label htmlFor="fromAccount" className="block text-sm font-medium text-neutral-700 mb-1">From Account <span className="text-red-500">*</span></label>
          <select id="fromAccount" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)} className="w-full p-2 border border-neutral-300 rounded-md bg-white" required>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (...{acc.accountNumber.slice(-4)}) - {formatCurrency(acc.balance)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2 border border-neutral-200 rounded-md p-1 bg-neutral-100">
            <Button type="button" onClick={() => setTab('domestic')} variant={tab === 'domestic' ? 'primary': 'ghost'} className={`flex-1 ${tab !== 'domestic' ? 'text-neutral-600' : ''}`}>Domestic</Button>
            <Button type="button" onClick={() => setTab('international')} variant={tab === 'international' ? 'primary': 'ghost'} className={`flex-1 ${tab !== 'international' ? 'text-neutral-600' : ''}`}>International</Button>
        </div>

        {/* Recipient's Information */}
        <fieldset className="border border-neutral-200 p-4 rounded-md space-y-4">
            <legend className="text-md font-semibold text-neutral-700 px-2">Recipient's Information</legend>
            <FormRow label="Full Name" name="recipientName" value={recipientName} onChange={e => setRecipientName(e.target.value)} required placeholder="Alex Johnson"/>
            <FormRow label="Street Address" name="recipientAddress" value={recipientAddress} onChange={e => setRecipientAddress(e.target.value)} required placeholder="123 Main St"/>
            <div className="grid grid-cols-3 gap-2">
                <FormRow label="City" name="recipientCity" value={recipientCity} onChange={e => setRecipientCity(e.target.value)} required/>
                <FormRow label="State" name="recipientState" value={recipientState} onChange={e => setRecipientState(e.target.value)} required/>
                <FormRow label="ZIP Code" name="recipientZip" value={recipientZip} onChange={e => setRecipientZip(e.target.value)} required/>
            </div>
            <FormRow label="Phone Number" name="recipientPhone" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} required type="tel" placeholder="555-123-4567"/>
        </fieldset>

         {/* Recipient's Bank Information */}
        <fieldset className="border border-neutral-200 p-4 rounded-md space-y-4">
            <legend className="text-md font-semibold text-neutral-700 px-2">Recipient's Bank Information</legend>
            <FormRow label="Bank Name" name="bankName" value={bankName} onChange={e => setBankName(e.target.value)} required placeholder="Example Bank USA"/>
            <FormRow label="Bank Address" name="bankAddress" value={bankAddress} onChange={e => setBankAddress(e.target.value)} required placeholder="456 Bank Ave, Banktown, NY"/>
            <FormRow label="Routing Number" name="routingNumber" value={routingNumber} onChange={e => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0,9))} required placeholder="9 digits" maxLength={9}/>
            <FormRow label="Account Number" name="accountNumber" value={accountNumber} onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))} required placeholder="Recipient's account number"/>
            <div>
                <label htmlFor="accountType" className="block text-sm font-medium text-neutral-700 mb-1">Account Type <span className="text-red-500">*</span></label>
                <select id="accountType" value={accountType} onChange={e => setAccountType(e.target.value as any)} className="w-full p-2 border border-neutral-300 rounded-md bg-white">
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                </select>
            </div>
        </fieldset>
        
        {/* International Details */}
        {tab === 'international' && (
            <fieldset className="border border-neutral-200 p-4 rounded-md space-y-4">
                <legend className="text-md font-semibold text-neutral-700 px-2">International Wire Details</legend>
                <FormRow label="SWIFT/BIC Code" name="swiftCode" value={swiftCode} onChange={e => setSwiftCode(e.target.value)} required={tab==='international'} placeholder="e.g., CITIUS33" />
                <FormRow label="IBAN (if applicable)" name="iban" value={iban} onChange={e => setIban(e.target.value)} placeholder="International Bank Account Number" />
            </fieldset>
        )}

        {/* Transfer Details */}
        <fieldset className="border border-neutral-200 p-4 rounded-md space-y-4">
            <legend className="text-md font-semibold text-neutral-700 px-2">Transfer Details</legend>
            <FormRow label="Amount ($)" name="amount" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0.00" type="number"/>
            <FormRow label="Purpose of Transfer" name="purposeOfTransfer" value={purposeOfTransfer} onChange={e => setPurposeOfTransfer(e.target.value)} placeholder="e.g., Payment for Services"/>
            <FormRow label="Payment Instructions (Optional)" name="paymentInstructions" value={paymentInstructions} onChange={e => setPaymentInstructions(e.target.value)} />
            <FormRow label="Reference / Memo (Optional)" name="reference" value={reference} onChange={e => setReference(e.target.value)} />
        </fieldset>
        
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading} leftIcon={<BuildingLibraryIcon className="w-5 h-5"/>}>
          {isLoading ? 'Processing...' : `Initiate ${tab.charAt(0).toUpperCase() + tab.slice(1)} Transfer`}
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