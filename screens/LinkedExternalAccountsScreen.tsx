import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { LinkedExternalAccount, LinkedCard } from '../types';
import { PlusCircleIcon, BanknotesIcon, CreditCardIcon, InformationCircleIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';

// Default mock data only for Alex if his specific lists are empty.
// This is a fallback for demonstration; ideally, Alex's data would also be in his user object.
const fallbackMockLinkedBankAccounts: LinkedExternalAccount[] = [
  { id: 'chase1001-fallback', bankName: 'Chase (Demo)', accountType: 'Checking', last4: '1001', accountHolderName: 'Alex Johnson', isVerified: true },
];
const fallbackMockLinkedCards: LinkedCard[] = [
  { id: 'visaGold2002-fallback', cardType: 'Visa', last4: '2002', expiryDate: '12/26', cardHolderName: 'Alex Johnson', isDefault: true, bankName: 'External Bank XYZ (Demo)' },
];


const LinkedExternalAccountsScreen: React.FC = () => {
  const { user } = useAuth();

  // Use user-specific data if available, otherwise fallback to Alex's demo data if it's Alex.
  const linkedBankAccounts = user?.username === 'Alex' && (!user.linkedExternalAccounts || user.linkedExternalAccounts.length === 0) 
                            ? fallbackMockLinkedBankAccounts 
                            : user?.linkedExternalAccounts || [];
  
  const linkedCards = user?.username === 'Alex' && (!user.linkedCards || user.linkedCards.length === 0)
                    ? fallbackMockLinkedCards
                    : user?.linkedCards || [];


  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Linked External Accounts & Cards</h1>
      </div>

      {/* Linked Bank Accounts */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-neutral-700 mb-3">Linked External Bank Accounts</h2>
        {linkedBankAccounts.length > 0 ? (
          <ul className="divide-y divide-neutral-100">
            {linkedBankAccounts.map(account => (
              <li key={account.id} className="py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <BanknotesIcon className="w-6 h-6 text-accent"/>
                    <div>
                        <p className="font-medium text-neutral-800">{account.bankName} {account.accountType}</p>
                        <p className="text-sm text-neutral-500">...{account.last4} {account.isVerified ? <span className="text-green-600">(Verified)</span> : <span className="text-orange-500">(Unverified)</span>}</p>
                    </div>
                </div>
                <Link to={`/manage-linked-account/${account.id}`}>
                  <Button variant="ghost" size="sm">Manage</Button>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500 py-2">No external bank accounts linked yet.</p>
        )}
        <Link to="/profile/link-bank-account" className="mt-4">
          <Button variant="outline" className="w-full" leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>
            Link a New Bank Account
          </Button>
        </Link>
      </div>

      {/* Linked Cards */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-neutral-700 mb-3">Linked External Debit/Credit Cards</h2>
        {linkedCards.length > 0 ? (
          <ul className="divide-y divide-neutral-100">
            {linkedCards.map(card => (
              <li key={card.id} className="py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <CreditCardIcon className="w-6 h-6 text-primary"/>
                    <div>
                        <p className="font-medium text-neutral-800">{card.bankName ? card.bankName +' ' : ''}{card.cardType} Card {card.isDefault && <span className="text-xs text-primary">(Default)</span>}</p>
                        <p className="text-sm text-neutral-500">...{card.last4} (Expires {card.expiryDate})</p>
                    </div>
                </div>
                <Link to={`/manage-linked-card/${card.id}`}>
                 <Button variant="ghost" size="sm">Manage</Button>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500 py-2">No external cards linked yet.</p>
        )}
        <Link to="/profile/link-card" className="mt-4">
          <Button variant="outline" className="w-full" leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>
            Link a New Card
          </Button>
        </Link>
      </div>
       <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Linking external accounts and cards allows for easier fund transfers and payments. Data is saved specific to your user profile.</span>
      </div>
    </div>
  );
};

export default LinkedExternalAccountsScreen;