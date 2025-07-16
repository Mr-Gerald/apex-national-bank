import React from 'react';
import { Link } from 'react-router-dom';
import { Account, AccountType } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ChevronRightIcon, CreditCardIcon, BanknotesIcon, BriefcaseIcon } from '../constants';

interface AccountCardProps {
  account: Account;
}

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  
  const getAccountStyle = () => {
    switch (account.type) {
      case AccountType.CHECKING:
        return { icon: <CreditCardIcon className="w-6 h-6 text-blue-600" />, accentColor: 'border-blue-600', bgColor: 'bg-blue-50' };
      case AccountType.SAVINGS:
        return { icon: <BanknotesIcon className="w-6 h-6 text-emerald-600" />, accentColor: 'border-emerald-600', bgColor: 'bg-emerald-50' };
      case AccountType.IRA:
        return { icon: <BanknotesIcon className="w-6 h-6 text-purple-600" />, accentColor: 'border-purple-600', bgColor: 'bg-purple-50' };
      case AccountType.BUSINESS_CHECKING:
        return { icon: <BriefcaseIcon className="w-6 h-6 text-indigo-600" />, accentColor: 'border-indigo-600', bgColor: 'bg-indigo-50' };
      default:
        return { icon: <BanknotesIcon className="w-6 h-6 text-neutral-500" />, accentColor: 'border-neutral-500', bgColor: 'bg-neutral-50' };
    }
  };
  
  const { icon, accentColor, bgColor } = getAccountStyle();

  return (
    <Link to={`/accounts/${account.id}`} className="block group">
      <div 
        className={`bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out mb-4 border-t-4 ${accentColor} transform group-hover:scale-[1.01] group-hover:shadow-primary/20`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${bgColor}`}>
              {icon}
            </div>
            <div>
              <h3 className="text-md font-semibold text-neutral-800 group-hover:text-primary transition-colors">{account.name}</h3>
              <p className="text-xs text-neutral-500">Account No: ...{account.accountNumber.slice(-4)}</p>
            </div>
          </div>
          <div className="text-right flex items-center space-x-2">
            <div>
              <p className="text-lg font-bold text-neutral-900">{formatCurrency(account.balance)}</p>
              <p className="text-xs text-neutral-500">Available Balance</p>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-neutral-400 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AccountCard;