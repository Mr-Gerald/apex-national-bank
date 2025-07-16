
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, PlusCircleIcon, BanknotesIcon, CreditCardIcon, BuildingLibraryIcon } from '../constants'; 

const AddAccountOptionsScreen: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/dashboard" className="text-primary hover:text-accent-700" aria-label="Back to Dashboard">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Add an Account</h1>
      </div>

      <p className="text-sm text-neutral-600">
        Choose how you'd like to add an account to your Apex National Bank profile.
      </p>

      <div className="space-y-3">
        <OptionLink
          to="/open-new-apex-account"
          icon={<BuildingLibraryIcon className="w-6 h-6 text-primary" />} 
          title="Open a New Apex National Bank Account"
          description="Apply for a new Checking, Savings, or other account with us."
        />
        <OptionLink
          to="/profile/link-bank-account"
          icon={<BanknotesIcon className="w-6 h-6 text-accent" />}
          title="Link an External Bank Account"
          description="Connect an account from another bank for transfers."
        />
        <OptionLink
          to="/profile/link-card"
          icon={<CreditCardIcon className="w-6 h-6 text-primary" />}
          title="Link an External Debit/Credit Card"
          description="Add a card for payments or quick funding."
        />
      </div>
       <p className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200">
        Opening new Apex accounts or linking external sources are for demonstration purposes. User-specific data is saved locally in your browser.
      </p>
    </div>
  );
};

interface OptionLinkProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const OptionLink: React.FC<OptionLinkProps> = ({ to, icon, title, description }) => (
  <Link to={to} className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {icon}
        <div>
          <h3 className="text-md font-semibold text-neutral-800">{title}</h3>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
      </div>
      <ChevronRightIcon className="w-5 h-5 text-neutral-400" />
    </div>
  </Link>
);

export default AddAccountOptionsScreen;
