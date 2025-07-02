
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccounts } from '../contexts/AccountContext';
import TransactionListItem from '../components/TransactionListItem';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Account, Transaction, TransactionType, AccountType } from '../types'; 
import Button from '../components/Button';
import Modal from '../components/Modal'; // Import Modal
import { 
    MagnifyingGlassIcon, ChevronDownIcon, CreditCardIcon, BanknotesIcon, BriefcaseIcon, 
    InformationCircleIcon, EyeIcon, EyeSlashIcon 
} from '../constants';

const TRANSACTIONS_PER_PAGE = 15;

const AccountDetailScreen: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const { fetchAccountById } = useAccounts(); 
  const [account, setAccount] = useState<Account | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debit' | 'credit'>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [visibleTransactionCount, setVisibleTransactionCount] = useState(TRANSACTIONS_PER_PAGE);
  
  const [showFullAccountNumber, setShowFullAccountNumber] = useState(false);
  const [showConfirmRevealModal, setShowConfirmRevealModal] = useState(false);
  
  useEffect(() => {
    if (accountId) {
      const fetchedAccount = fetchAccountById(accountId);
      setAccount(fetchedAccount); 
      setVisibleTransactionCount(TRANSACTIONS_PER_PAGE); 
      setShowFullAccountNumber(false); // Reset visibility on account change
    }
  }, [accountId, fetchAccountById]); 

  const allFilteredTransactions = useMemo(() => {
    if (!account) return [];
    return account.transactions
      .filter(tx => !(tx.description.toLowerCase() === 'account opened' && tx.amount === 0)) // Filter out $0 "Account Opened"
      .filter(tx => {
        const txDate = new Date(tx.date);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(new Date(dateRange.end).setHours(23, 59, 59, 999)) : null;

        if (startDate && txDate < startDate) return false;
        if (endDate && txDate > endDate) return false;
        return true;
      })
      .filter(tx => filterType === 'all' || (filterType === 'credit' && tx.type === TransactionType.CREDIT) || (filterType === 'debit' && tx.type === TransactionType.DEBIT))
      .filter(tx => tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || tx.category.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [account, searchTerm, filterType, dateRange]);

  const visibleTransactions = useMemo(() => {
    return allFilteredTransactions.slice(0, visibleTransactionCount);
  }, [allFilteredTransactions, visibleTransactionCount]);

  const handleLoadMore = () => {
    setVisibleTransactionCount(prevCount => prevCount + 10);
  };

  if (!account) {
    return <div className="p-4 text-center">Loading account details... If this persists, the account may not exist. <Link to="/accounts" className="text-primary">Go to accounts.</Link></div>;
  }
  
  const getAccountIcon = (sizeClass = "w-8 h-8") => {
    let colorClass = 'text-primary';
    if (account.type === AccountType.SAVINGS || account.type === AccountType.IRA) colorClass = 'text-accent';
    if (account.type === AccountType.BUSINESS_CHECKING) colorClass = 'text-indigo-600';

    switch (account.type) {
      case AccountType.CHECKING:
        return <CreditCardIcon className={`${sizeClass} ${colorClass}`} />;
      case AccountType.SAVINGS:
      case AccountType.IRA:
        return <BanknotesIcon className={`${sizeClass} ${colorClass}`} />;
      case AccountType.BUSINESS_CHECKING:
        return <BriefcaseIcon className={`${sizeClass} ${colorClass}`} />;
      default:
        return <BanknotesIcon className={`${sizeClass} text-neutral-500`} />;
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-5 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-3">
                {getAccountIcon()}
                <h1 className="text-2xl font-semibold text-neutral-800">{account.name}</h1>
            </div>
            <Link to="/transfer" className="text-sm text-primary font-medium hover:underline">Make a Transfer</Link>
        </div>
        <p className="text-sm text-neutral-500 mb-3 ml-11 flex items-center space-x-2">
            <span>Account No: {showFullAccountNumber ? account.accountNumber : `•••• ${account.accountNumber.slice(-4)}`}</span>
            <button 
            onClick={() => {
                if (showFullAccountNumber) {
                setShowFullAccountNumber(false); 
                } else {
                setShowConfirmRevealModal(true);
                }
            }} 
            className="p-0.5 text-primary hover:text-accent-700 rounded-full focus:outline-none focus:ring-1 focus:ring-primary" 
            aria-label={showFullAccountNumber ? "Hide full account number" : "Show full account number"}
            >
            {showFullAccountNumber ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
        </p>
        <p className="text-3xl font-bold text-neutral-900 ml-11">{formatCurrency(account.balance)}</p>
        <p className="text-sm text-neutral-500 ml-11">Available Balance</p>
      </div>

      {/* Transaction Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
        <h2 className="text-lg font-semibold text-neutral-700 mb-2">Filter Transactions</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setVisibleTransactionCount(TRANSACTIONS_PER_PAGE); }}
            aria-label="Search transactions"
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="filterType" className="block text-xs font-medium text-neutral-600 mb-1">Type</label>
            <select
              id="filterType"
              className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary bg-white"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value as 'all' | 'debit' | 'credit'); setVisibleTransactionCount(TRANSACTIONS_PER_PAGE);}}
            >
              <option value="all">All Types</option>
              <option value="credit">Credits Only</option>
              <option value="debit">Debits Only</option>
            </select>
          </div>
          <div>
            <label htmlFor="startDate" className="block text-xs font-medium text-neutral-600 mb-1">Start Date</label>
            <input type="date" id="startDate" value={dateRange.start} onChange={e => {setDateRange(prev => ({...prev, start: e.target.value})); setVisibleTransactionCount(TRANSACTIONS_PER_PAGE);}} className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"/>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-xs font-medium text-neutral-600 mb-1">End Date</label>
            <input type="date" id="endDate" value={dateRange.end} onChange={e => {setDateRange(prev => ({...prev, end: e.target.value})); setVisibleTransactionCount(TRANSACTIONS_PER_PAGE);}} className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"/>
          </div>
        </div>
         <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(''); setFilterType('all'); setDateRange({start: '', end: ''}); setVisibleTransactionCount(TRANSACTIONS_PER_PAGE); }}>Clear Filters</Button>
      </div>

      {/* Transaction List */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-800 mb-3">Transaction History</h2>
        {visibleTransactions.length > 0 ? (
          <>
            <ul className="bg-white rounded-lg shadow divide-y divide-neutral-200">
              {visibleTransactions.map(tx => (
                <li key={tx.id} className="hover:bg-neutral-50/70">
                  <Link to={`/transaction-detail/${accountId}/${tx.id}`} className="block p-1">
                    <TransactionListItem transaction={tx}/>
                    {tx.balanceAfter !== undefined && ( 
                        <p className="text-xs text-neutral-400 pl-[4.25rem] pb-2 -mt-1">Balance after: {formatCurrency(tx.balanceAfter)}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            {allFilteredTransactions.length > visibleTransactionCount && (
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={handleLoadMore} rightIcon={<ChevronDownIcon className="w-4 h-4"/>}>
                  Load More Transactions ({allFilteredTransactions.length - visibleTransactionCount} more)
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-neutral-500 bg-white p-4 rounded-lg shadow">No transactions match your filters for this account.</p>
        )}
      </div>
       <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>For a comprehensive overview of your account activity and details, please review the information above. Contact support for any discrepancies or questions. The "Available Balance" reflects funds from completed transactions only.</span>
      </div>
      <Modal
        isOpen={showConfirmRevealModal}
        onClose={() => setShowConfirmRevealModal(false)}
        title="Reveal Full Account Number"
        primaryActionText="Reveal Number"
        onPrimaryAction={() => { setShowFullAccountNumber(true); setShowConfirmRevealModal(false); }}
        secondaryActionText="Cancel"
        onSecondaryAction={() => setShowConfirmRevealModal(false)}
      >
        <p>Are you sure you want to display the full account number? This is sensitive information and should only be done in a secure, private environment.</p>
      </Modal>
    </div>
  );
};

export default AccountDetailScreen;

