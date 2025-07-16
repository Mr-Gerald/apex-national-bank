import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { ApexCard } from '../types';
import { CreditCardIcon, PlusCircleIcon, ChevronRightIcon, InformationCircleIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';

const ManageApexCardsScreen: React.FC = () => {
  const { user } = useAuth();
  const cards = user?.apexCards || [];


  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
            <Link to="/profile" className="text-primary hover:text-accent-700" aria-label="Back to Profile">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            </Link>
            <h1 className="text-2xl font-semibold text-neutral-800">Manage My Apex Cards</h1>
        </div>
        <Button 
            size="sm" 
            variant="outline" 
            leftIcon={<PlusCircleIcon className="w-4 h-4" />}
            onClick={() => alert("Request a new Apex card or add an existing one to your digital wallet.")}
        >
          Add/Request Card
        </Button>
      </div>

      {cards.length > 0 ? (
        <ul className="bg-white rounded-lg shadow-md divide-y divide-neutral-100">
          {cards.map(card => (
            <li key={card.id}>
              <Link to={`/profile/apex-card/${card.id}`} className="block p-3 hover:bg-neutral-50">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <CreditCardIcon className={`w-8 h-8 ${card.isLocked ? 'text-red-500' : 'text-primary'}`}/>
                        <div>
                            <p className="font-medium text-neutral-800">{card.cardName}</p>
                            <p className="text-sm text-neutral-500">
                                {card.cardType} Card ending in ...{card.last4}
                                {card.isLocked && <span className="ml-2 text-xs text-red-600 font-semibold">(Locked)</span>}
                            </p>
                        </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-neutral-400" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <CreditCardIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900">No Apex Cards Found</h3>
          <p className="mt-1 text-sm text-neutral-500">You currently have no Apex National Bank cards associated with your profile. You can request one if needed from customer service or if available through online banking options.</p>
        </div>
      )}
      
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Manage your Apex National Bank debit and credit cards. View details, lock/unlock cards, and report issues.</span>
      </div>
    </div>
  );
};

export default ManageApexCardsScreen;