
import React from 'react';
import { Link } from 'react-router-dom'; 
import AccountCard from '../components/AccountCard';
import { useAccounts } from '../contexts/AccountContext';
import Button from '../components/Button';
import { PlusCircleIcon } from '../constants';

const AccountsScreen: React.FC = () => {
  const { accounts, loading, error } = useAccounts(); // Accounts are now user-specific from context

  if (loading) return <div className="p-4 text-center">Loading accounts...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-semibold text-neutral-800">Your Accounts</h1>
        <Link to="/add-account-options"> 
          <Button size="sm" variant="outline" leftIcon={<PlusCircleIcon className="w-4 h-4" />}>
            New Account
          </Button>
        </Link>
      </div>
      
      {accounts.length > 0 ? (
        accounts.map(account => (
          <AccountCard key={account.id} account={account} />
        ))
      ) : (
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-neutral-900">No accounts</h3>
          <p className="mt-1 text-sm text-neutral-500">Get started by opening a new account.</p>
           <Link to="/add-account-options" className="mt-4">
             <Button variant="primary">Open or Link an Account</Button>
           </Link>
        </div>
      )}
    </div>
  );
};

export default AccountsScreen;
