
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import Button from '../components/Button';
import { GiftIcon, InformationCircleIcon, AmazonIcon, StarbucksIcon, TargetIcon, NetflixIcon, BestBuyIcon } from '../constants';
import { GiftCardMerchant } from '../types';

const mockMerchants: GiftCardMerchant[] = [
    { id: 'gc_amazon', name: 'Amazon', icon: <AmazonIcon className="w-24 h-12 text-neutral-700"/>, denominations: [25, 50, 100] },
    { id: 'gc_starbucks', name: 'Starbucks', icon: <StarbucksIcon className="w-16 h-16 text-green-700"/>, denominations: [10, 25, 50] },
    { id: 'gc_target', name: 'Target', icon: <TargetIcon className="w-16 h-16 text-red-600"/>, denominations: [25, 50, 100] },
    { id: 'gc_netflix', name: 'Netflix', icon: <NetflixIcon className="w-16 h-16 text-red-600"/>, denominations: [30, 60] },
    { id: 'gc_bestbuy', name: 'Best Buy', icon: <BestBuyIcon className="w-24 h-12 text-blue-600"/>, denominations: [25, 50, 100, 200] },
];

const BuyGiftCardScreen: React.FC = () => {
  const navigate = useNavigate(); // Added useNavigate

  const handleViewOptions = (merchantId: string) => {
    navigate(`/products/gift-cards/${merchantId}`);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/dashboard" className="text-primary hover:text-accent-700" aria-label="Back to Dashboard"> 
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Buy Gift Cards</h1>
      </div>

      <p className="text-sm text-neutral-600">
        Choose from a wide selection of digital gift cards from your favorite brands. Perfect for any occasion.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4"> {/* Adjusted to 2 columns for larger icons */}
        {mockMerchants.map(merchant => (
          <div key={merchant.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center flex flex-col justify-between items-center">
            <div className="h-20 w-full flex items-center justify-center mb-2"> {/* Increased height for icon container */}
              {merchant.icon ? merchant.icon : <GiftIcon className="w-10 h-10 text-neutral-400"/>}
            </div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-1 truncate w-full">{merchant.name}</h3>
            <p className="text-xs text-neutral-500 mb-2">Values: ${merchant.denominations.join(', $')}</p>
            <Button variant="outline" size="sm" onClick={() => handleViewOptions(merchant.id)} className="w-full">
              View Options
            </Button>
          </div>
        ))}
      </div>
      
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Gift card availability and terms are subject to the respective merchants.</span>
      </div>
    </div>
  );
};

export default BuyGiftCardScreen;
