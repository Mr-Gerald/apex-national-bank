

import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAccounts } from '../contexts/AccountContext';
import { Transaction, Account, AccountType, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import Button from '../components/Button';
import Modal from '../components/Modal';
import {
    ArrowPathIcon, BanknotesIcon, BriefcaseIcon, CreditCardIcon, DocumentTextIcon, HourglassIcon,
    InformationCircleIcon, ShareIcon, ShieldCheckIcon, XCircleIcon as CloseIcon
} from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { BANK_NAME } from '../constants';

const TransactionDetailScreen: React.FC = () => {
  const { accountId, transactionId } = useParams<{ accountId: string; transactionId: string }>();
  const { fetchAccountById } = useAccounts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (accountId) {
      const currentAccount = fetchAccountById(accountId);
      if (currentAccount) {
        setAccount(currentAccount);
        const currentTransaction = currentAccount.transactions.find(tx => tx.id === transactionId);
        setTransaction(currentTransaction || null);
      } else {
        setAccount(null);
        setTransaction(null);
      }
    }
  }, [accountId, transactionId, fetchAccountById, user]); // Added user to dependency array for re-evaluation of canVerifyTransaction

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!transaction || !account) return;

    const shareData = {
      title: `${BANK_NAME} Transaction Receipt`,
      text: `Transaction Details:\nAmount: ${transaction.type === TransactionType.CREDIT ? '+' : '-'}${formatCurrency(transaction.amount)}\nDescription: ${transaction.description}\nDate: ${formatDate(transaction.date)}\nAccount: ${account.name} (...${account.accountNumber.slice(-4)})`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('Transaction details shared successfully');
      } catch (error) {
        console.error('Error sharing transaction details:', error);
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true); 
    }
  };

  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("Details copied to clipboard!");
      setShowShareModal(false);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert("Failed to copy details. Please try again.");
    });
  };


  if (!account || !transaction) {
    return (
      <div className="p-4 text-center">
        <p>Loading transaction details...</p>
        <p className="text-sm text-neutral-500 mt-2">If this persists, the transaction or account may not be found.</p>
        <Link to={accountId ? `/accounts/${accountId}` : "/accounts"} className="mt-4 inline-block">
            <Button variant="outline">Back to Account</Button>
        </Link>
      </div>
    );
  }

  const getAccountIcon = (accType: Account['type']) => {
    let colorClass = 'text-primary';
    if (accType === AccountType.SAVINGS || accType === AccountType.IRA) colorClass = 'text-accent';
    if (accType === AccountType.BUSINESS_CHECKING) colorClass = 'text-indigo-600';
    const sizeClass = "w-5 h-5";

    switch (accType) {
      case AccountType.CHECKING: return <CreditCardIcon className={`${sizeClass} ${colorClass}`} />;
      case AccountType.SAVINGS: case AccountType.IRA: return <BanknotesIcon className={`${sizeClass} ${colorClass}`} />;
      case AccountType.BUSINESS_CHECKING: return <BriefcaseIcon className={`${sizeClass} ${colorClass}`} />;
      default: return <BanknotesIcon className={`${sizeClass} text-neutral-500`} />;
    }
  };

  const DetailRow: React.FC<{ label: string; value?: string | number | null; className?: string }> = ({ label, value, className }) => (
    value || value === 0 ? (
      <div className={`py-2.5 flex justify-between items-center ${className}`}>
        <p className="text-sm text-neutral-600">{label}:</p>
        <p className="text-sm text-neutral-800 font-medium text-right">{String(value)}</p>
      </div>
    ) : null
  );

  const getStatusColorClass = (tx: Transaction) => {
    if (tx.status === 'On Hold') return 'text-orange-600 font-semibold';
    if (tx.status === 'Pending' && (tx.holdReason?.toLowerCase().includes("funds under review") || tx.holdReason?.toLowerCase().includes("identity confirmation under process") || tx.holdReason?.toLowerCase().includes("identity verification submitted and under review") )) return 'text-yellow-600 font-semibold';
    if (tx.status === 'Pending') return 'text-orange-600 font-semibold';
    return '';
  };


  const canVerifyTransaction = 
    (transaction.status === 'On Hold' || transaction.status === 'Pending') &&
    (
      transaction.holdReason?.toLowerCase().includes("identity verification required") || 
      transaction.holdReason?.toLowerCase().includes("identity verification was not successful") ||
      transaction.holdReason?.toLowerCase().includes("verification attempt rejected")
    ) &&
    account.id.startsWith(user?.id || "___NO_USER_ID_MATCH___") && 
    !user?.isIdentityVerified; 
    
  const isWireHoldForFees = 
    transaction.status === 'Pending' &&
    transaction.holdReason?.toLowerCase().includes("account security fees");

  const handleResolveViaEmail = () => {
      if (!user) return;
      const supportEmail = "support@apexnationalbank.com";
      const subject = `Urgent: Verification for Wire Transfer ${transaction.userFriendlyId}`;
      const body = `Dear Support Team,\n\nI have a pending wire transfer that requires verification for account security fees.\n\nTransaction ID: ${transaction.userFriendlyId}\nAmount: ${formatCurrency(transaction.amount)}\nRecipient: ${transaction.wireDetails?.recipientBankName || transaction.description}\n\nPlease let me know what steps I need to take to resolve this and release the funds.\n\nThank you,\n${user.fullName}`;
      const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
  };


  return (
    <div className="p-4 space-y-6 transaction-detail-screen-wrapper">
      <div className="flex items-center space-x-3 mb-2 hide-on-print">
        <button onClick={() => navigate(-1)} className="text-primary hover:text-accent-700 p-1" aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-neutral-800">Transaction Details</h1>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-lg" id="transaction-receipt-content">
        <div className="text-center mb-5 pb-4 border-b border-neutral-200">
            <p className={`text-3xl font-bold ${transaction.type === TransactionType.CREDIT ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === TransactionType.CREDIT ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
            <p className="text-md text-neutral-700 mt-1">{transaction.description}</p>
            <p className="text-xs text-neutral-500">{formatDate(transaction.date, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        <div className="space-y-1 divide-y divide-neutral-100">
            <DetailRow label="Transaction ID" value={transaction.userFriendlyId || transaction.id} />
            <DetailRow
              label="Status"
              value={transaction.status}
              className={getStatusColorClass(transaction)}
            />
            {transaction.holdReason && (
                 <div className="py-2.5">
                    <p className="text-sm text-neutral-600">Reason:</p>
                    <p className={`text-sm font-medium mt-0.5 ${getStatusColorClass(transaction) || 'text-neutral-700'}`}>{transaction.holdReason}</p>
                 </div>
            )}
            <DetailRow label="Type" value={transaction.type} />
            <DetailRow label="Category" value={transaction.category} />

            {transaction.senderAccountInfo && <DetailRow label="From" value={transaction.senderAccountInfo} />}
            {transaction.recipientAccountInfo && <DetailRow label="To" value={transaction.recipientAccountInfo} />}

            {!transaction.senderAccountInfo && !transaction.recipientAccountInfo && (
                <DetailRow label="Account" value={`${account.name} (...${account.accountNumber.slice(-4)})`} />
            )}

            {transaction.memo && <DetailRow label="Memo" value={transaction.memo} />}

            {transaction.balanceAfter !== undefined && (
                <DetailRow
                    label="Balance After this Transaction"
                    value={formatCurrency(transaction.balanceAfter)}
                    className="font-semibold border-t border-neutral-200 pt-3 mt-2"
                />
            )}
        </div>

        {canVerifyTransaction && (
          <div className="mt-6 hide-on-print">
            <Link to={`/verify-identity/${accountId}/${transactionId}`}>
              <Button variant="primary" className="w-full" leftIcon={<ShieldCheckIcon className="w-5 h-5"/>}>
                Verify Identity to Release Funds
              </Button>
            </Link>
          </div>
        )}

        {isWireHoldForFees && (
            <div className="mt-6 hide-on-print">
                <Button variant="primary" className="w-full" onClick={handleResolveViaEmail} leftIcon={<ShieldCheckIcon className="w-5 h-5"/>}>
                    Resolve via Email
                </Button>
            </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 hide-on-print">
            <Button variant="outline" onClick={handlePrint} leftIcon={<DocumentTextIcon className="w-4 h-4"/>}>
                Print Receipt
            </Button>
            <Button variant="outline" onClick={handleShare} leftIcon={<ShareIcon className="w-4 h-4"/>}>
                Share
            </Button>
        </div>
      </div>

       <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2 hide-on-print">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>This receipt provides details for the selected transaction. "Balance After" reflects the historical running total at the time of this transaction.</span>
      </div>

      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Transaction"
        primaryActionText="Close"
        onPrimaryAction={() => setShowShareModal(false)}
      >
        <div className="space-y-3">
            <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                    const textToCopy = `Transaction Details (${BANK_NAME}):\nAmount: ${transaction.type === TransactionType.CREDIT ? '+' : '-'}${formatCurrency(transaction.amount)}\nDescription: ${transaction.description}\nDate: ${formatDate(transaction.date)}\nAccount: ${account.name} (...${account.accountNumber.slice(-4)})`;
                    copyToClipboard(textToCopy);
                }}
            >
                Copy Details to Clipboard
            </Button>
            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`Transaction at ${BANK_NAME}: ${transaction.description} for ${formatCurrency(transaction.amount)}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
            >
                <Button variant="outline" className="w-full">Share on Facebook</Button>
            </a>
            <a
                 href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this transaction from ${BANK_NAME}: ${transaction.description} for ${formatCurrency(transaction.amount)} - ${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
            >
                <Button variant="outline" className="w-full">Share on WhatsApp</Button>
            </a>
             <p className="text-xs text-neutral-500">For Instagram, please take a screenshot of the details.</p>
        </div>
      </Modal>
    </div>
  );
};

export default TransactionDetailScreen;