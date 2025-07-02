
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { TrophyIcon, InformationCircleIcon, GiftIcon, BanknotesIcon, AmazonIcon, StarbucksIcon } from '../constants';
import { RewardItemType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/formatters';

const mockRewardItems: RewardItemType[] = [
    { id: 'reward_cashback_10', name: '$10 Cashback', pointsRequired: 1000, category: 'Cashback' },
    { id: 'reward_cashback_25', name: '$25 Cashback', pointsRequired: 2500, category: 'Cashback' },
    { id: 'reward_amazon_25', name: '$25 Amazon Gift Card', pointsRequired: 2600, category: 'Gift Card', icon: <AmazonIcon className="w-20 h-10 text-neutral-700"/> }, // Adjusted size
    { id: 'reward_starbucks_10', name: '$10 Starbucks Card', pointsRequired: 1100, category: 'Gift Card', icon: <StarbucksIcon className="w-12 h-12 text-green-700"/> }, // Adjusted size
    { id: 'reward_travel_100', name: '$100 Travel Voucher', pointsRequired: 10000, category: 'Travel' },
];

const MyRewardsScreen: React.FC = () => {
  const { user } = useAuth();
  const userPoints = user?.username?.toLowerCase() === 'alex' ? 25850 : 0; // 0 points for non-Alex users


  const handleRedeem = (itemName: string, points: number) => {
    if (userPoints < points) {
      alert(`You do not have enough points to redeem ${itemName}.`);
      return;
    }
    alert(`Redeeming ${points} points for ${itemName}.`);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/dashboard" className="text-primary hover:text-accent-700" aria-label="Back to Dashboard">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">My Apex Rewards</h1>
      </div>

      <div className="bg-gradient-to-r from-primary to-accent text-white p-6 rounded-xl shadow-lg text-center">
        <TrophyIcon className="w-12 h-12 mx-auto mb-2 opacity-80"/>
        <p className="text-lg opacity-90">Your Rewards Balance</p>
        <p className="text-4xl font-bold tracking-tight">{userPoints.toLocaleString()} pts</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-neutral-700 mb-3">Redeem Your Points</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockRewardItems.map(item => (
                <div key={item.id} className="border border-neutral-200 rounded-lg p-3 flex flex-col justify-between hover:shadow-lg transition-shadow">
                    <div>
                        <div className="h-12 flex items-center justify-center mb-1.5"> {/* Adjusted height for larger icons */}
                            {item.icon ? item.icon : 
                             item.category === 'Cashback' ? <BanknotesIcon className="w-8 h-8 text-green-500"/> :
                             item.category === 'Gift Card' ? <GiftIcon className="w-8 h-8 text-orange-500"/> :
                             item.category === 'Travel' ? <GlobeAltIcon className="w-8 h-8 text-blue-500"/> :
                             <StarIcon className="w-8 h-8 text-yellow-500" /> 
                            }
                        </div>
                        <h3 className="text-sm font-semibold text-neutral-800 text-center">{item.name}</h3>
                        <p className="text-xs text-primary font-medium text-center">{item.pointsRequired.toLocaleString()} pts</p>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full" 
                        onClick={() => handleRedeem(item.name, item.pointsRequired)}
                        disabled={userPoints < item.pointsRequired}
                    >
                        {userPoints < item.pointsRequired ? 'Not Enough Points' : 'Redeem'}
                    </Button>
                </div>
            ))}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-neutral-700 mb-2">How to Earn Points</h2>
        <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1 pl-2">
            <li>Use your Apex Rewards Credit Card for everyday purchases.</li>
            <li>Participate in special banking promotions and offers.</li>
            <li>Achieve certain account milestones or activities.</li>
        </ul>
      </div>
      
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>The Apex Rewards program, including point values, earning rates, and redemption options, are subject to change. Please refer to the official program terms and conditions for full details.</span>
      </div>
    </div>
  );
};

const GlobeAltIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 003 12c0-.778.099-1.533.284-2.253M3 12c0 2.918 2.348 5.433 5.474 6.364M3 12c0-2.918 2.348-5.433 5.474-6.364m5.052 12.728A4.5 4.5 0 0013.5 12c0-2.485-2.015-4.5-4.5-4.5s-4.5 2.015-4.5 4.5c0 2.485 2.015 4.5 4.5 4.5c.376 0 .74-.046 1.09-.133M13.5 12c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5c0 2.485-2.015 4.5-4.5 4.5c-.376 0-.74-.046-1.09-.133" />
  </svg>
);
const StarIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.82.61l-4.725-2.885a.563.563 0 00-.652 0l-4.725 2.885a.562.562 0 01-.82-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

export default MyRewardsScreen;