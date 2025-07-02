
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownTrayIcon, CameraIcon, BuildingLibraryIcon, LinkIcon, ChevronRightIcon } from '../constants';

const DepositOptionsScreen: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/dashboard" className="text-primary hover:text-accent-700" aria-label="Back to Dashboard">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Deposit Funds</h1>
      </div>

      <div className="space-y-3">
        <DepositOption
          to="/deposit/check"
          icon={<CameraIcon className="w-6 h-6 text-primary" />}
          title="Mobile Check Deposit"
          description="Snap photos of your check to deposit."
        />
        <DepositOption
          to="/deposit/ach-pull"
          icon={<BuildingLibraryIcon className="w-6 h-6 text-primary" />}
          title="Deposit via ACH Pull"
          description="Pull funds from an external bank account."
        />
        <DepositOption
          to="/deposit/from-linked"
          icon={<LinkIcon className="w-6 h-6 text-primary" />}
          title="Transfer from Linked Account"
          description="Move funds from your linked external accounts."
        />
      </div>
       <p className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200">
        Select a method to deposit funds into your Apex National Bank accounts. Standard processing times may apply.
      </p>
    </div>
  );
};

interface DepositOptionProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const DepositOption: React.FC<DepositOptionProps> = ({ to, icon, title, description }) => (
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

export default DepositOptionsScreen;
