
import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { GiftIcon, InformationCircleIcon, AmazonIcon, StarbucksIcon, TargetIcon, NetflixIcon, BestBuyIcon, CreditCardIcon } from '../constants';
import { GiftCardMerchant } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext'; // To get user for card linking (optional)

const mockMerchantsData: GiftCardMerchant[] = [
    { id: 'gc_amazon', name: 'Amazon', icon: <AmazonIcon className="w-32 h-16 text-neutral-700 mx-auto"/>, denominations: [25, 50, 100, 150, 200] },
    { id: 'gc_starbucks', name: 'Starbucks', icon: <StarbucksIcon className="w-20 h-20 text-green-700 mx-auto"/>, denominations: [10, 15, 25, 50] },
    { id: 'gc_target', name: 'Target', icon: <TargetIcon className="w-20 h-20 text-red-600 mx-auto"/>, denominations: [25, 50, 100, 200] },
    { id: 'gc_netflix', name: 'Netflix', icon: <NetflixIcon className="w-20 h-20 text-red-600 mx-auto"/>, denominations: [30, 60, 100] },
    { id: 'gc_bestbuy', name: 'Best Buy', icon: <BestBuyIcon className="w-32 h-16 text-blue-600 mx-auto"/>, denominations: [25, 50, 100, 150, 250] },
];


const GiftCardDetailScreen: React.FC = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // Potentially use user's linked cards for payment

  const merchant = mockMerchantsData.find(m => m.id === merchantId);
  
  const [selectedDenomination, setSelectedDenomination] = useState<number | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<'select' | 'confirm' | 'success'>('select');


  if (!merchant) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Gift card merchant not found.</p>
        <Button onClick={() => navigate('/products/gift-cards')} className="mt-4">Back to Gift Cards</Button>
      </div>
    );
  }

  const handleSelectDenomination = (amount: number) => {
    setSelectedDenomination(amount);
    setPurchaseStep('confirm');
    setMessage(''); // Clear previous messages
  };

  const handleConfirmPurchase = () => {
    if (!selectedDenomination) {
        setMessage("Please select a denomination.");
        return;
    }
    if (!recipientEmail.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
        setMessage("Please enter a valid recipient email address.");
        return;
    }
    
    setIsLoading(true);
    // Simulate purchase
    setTimeout(() => {
      setMessage(`Successfully purchased a $${selectedDenomination} ${merchant.name} gift card for ${recipientEmail}. It will be delivered shortly.`);
      setPurchaseStep('success');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <button onClick={() => purchaseStep === 'select' ? navigate('/products/gift-cards') : setPurchaseStep('select')} className="text-primary hover:text-accent-700 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-neutral-800">{merchant.name} Gift Card</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center mb-4">
            {merchant.icon ? merchant.icon : <GiftIcon className="w-16 h-16 text-neutral-400 mx-auto"/>}
        </div>

        {purchaseStep === 'select' && (
            <>
                <h2 className="text-lg font-semibold text-neutral-700 mb-3">Select Amount</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {merchant.denominations.map(denom => (
                    <Button 
                        key={denom} 
                        variant="outline" 
                        className="py-3 text-lg"
                        onClick={() => handleSelectDenomination(denom)}
                    >
                    ${denom}
                    </Button>
                ))}
                </div>
            </>
        )}

        {purchaseStep === 'confirm' && selectedDenomination && (
            <>
                <h2 className="text-lg font-semibold text-neutral-700 mb-1">Confirm Purchase</h2>
                <p className="text-md text-neutral-600 mb-3">You are purchasing a <strong>${selectedDenomination} {merchant.name}</strong> gift card.</p>
                
                <div>
                    <label htmlFor="recipientEmail" className="block text-sm font-medium text-neutral-700 mb-1">Recipient's Email Address</label>
                    <input 
                        type="email" 
                        id="recipientEmail" 
                        value={recipientEmail} 
                        onChange={e => setRecipientEmail(e.target.value)} 
                        placeholder="Enter email for delivery"
                        className="w-full p-2 border border-neutral-300 rounded-md mb-3"
                        required
                    />
                </div>
                 {message && <p className="text-sm text-red-500 mb-3">{message}</p>}

                <div className="border-t pt-3 mt-3">
                     <p className="text-sm text-neutral-600">Payment Method: <span className="font-medium">Your Primary Checking (...{user?.accounts.find(a => a.type === "Primary Checking")?.accountNumber.slice(-4) || 'XXXX'})</span></p>
                </div>

                <Button 
                    variant="primary" 
                    className="w-full mt-4" 
                    onClick={handleConfirmPurchase}
                    isLoading={isLoading}
                    disabled={isLoading}
                    leftIcon={<CreditCardIcon className="w-5 h-5" />}
                >
                    {isLoading ? 'Processing...' : `Pay ${formatCurrency(selectedDenomination)}`}
                </Button>
            </>
        )}
        
        {purchaseStep === 'success' && (
            <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-green-700 mb-2">Purchase Successful!</h2>
                <p className="text-sm text-neutral-600 mb-4">{message}</p>
                <Button variant="outline" onClick={() => navigate('/products/gift-cards')}>Buy Another Gift Card</Button>
            </div>
        )}
      </div>
      
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Digital gift cards are typically delivered via email within a few hours. All purchases are final. Terms and conditions of the respective merchant apply.</span>
      </div>
    </div>
  );
};

export default GiftCardDetailScreen;
