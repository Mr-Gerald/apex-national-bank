
import React from 'react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, HourglassIcon, CheckCircleIcon } from '../constants'; 

interface TransactionListItemProps {
  transaction: Transaction;
}

const TransactionListItem: React.FC<TransactionListItemProps> = ({ transaction }) => {
  const isCredit = transaction.type === TransactionType.CREDIT;
  let amountColor = isCredit ? 'text-green-600' : 'text-red-600';
  let IconComponent = isCredit ? ArrowDownTrayIcon : ArrowUpTrayIcon;
  let iconColor = isCredit ? 'text-green-500' : 'text-red-500';
  let iconBgColor = isCredit ? 'bg-green-100' : 'bg-red-100';
  let statusText = '';
  let statusColorClass = '';

  if (transaction.status === 'On Hold') {
    amountColor = 'text-orange-600'; 
    IconComponent = HourglassIcon;
    iconColor = 'text-orange-500';
    iconBgColor = 'bg-orange-100';
    statusText = `(${transaction.status})`;
    statusColorClass = 'text-orange-600';
  } else if (transaction.status === 'Pending') {
    IconComponent = HourglassIcon; // Hourglass for pending as well
    if (transaction.holdReason?.toLowerCase().includes("funds under review")) {
        amountColor = 'text-yellow-600';
        iconColor = 'text-yellow-500';
        iconBgColor = 'bg-yellow-100';
        statusColorClass = 'text-yellow-600';
    } else {
        amountColor = 'text-orange-600';
        iconColor = 'text-orange-500';
        iconBgColor = 'bg-orange-100';
        statusColorClass = 'text-orange-600';
    }
    statusText = `(${transaction.status})`;
  }


  return (
    <li className="py-3 sm:py-4 border-b border-neutral-200 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${iconBgColor}`}>
          <IconComponent className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 truncate">
            {transaction.description}
            {statusText && <span className={`ml-1 text-xs font-semibold ${statusColorClass}`}>{statusText}</span>}
          </p>
          <p className="text-xs text-neutral-500 truncate">{formatDate(transaction.date)} - {transaction.category}</p>
          {(transaction.status === 'On Hold' || transaction.status === 'Pending') && transaction.holdReason && (
            <p className={`text-xs mt-0.5 ${statusColorClass}`}>{transaction.holdReason}</p>
          )}
        </div>
        <div className={`text-sm font-semibold ${amountColor}`}>
          {isCredit ? '+' : '-'}{formatCurrency(transaction.amount)}
        </div>
      </div>
    </li>
  );
};

export default TransactionListItem;