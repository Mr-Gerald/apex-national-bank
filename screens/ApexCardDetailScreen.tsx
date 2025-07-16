import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { ApexCard } from '../types';
import { formatCurrency } from '../utils/formatters';
import { InformationCircleIcon, CreditCardIcon, LockClosedIcon, KeyIcon, FlagIcon, ChevronRightIcon } from '../constants'; 
import { useAccounts } from '../contexts/AccountContext'; 
import { useAuth } from '../contexts/AuthContext';

const ApexCardDetailScreen: React.FC = () => {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { user, updateApexCard } = useAuth();
  const { accounts: userApexAccounts } = useAccounts();

  const [card, setCard] = useState<ApexCard | null>(null);
  const [linkedAccountInfo, setLinkedAccountInfo] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cardId && user?.apexCards) {
      const fetchedCard = user.apexCards.find(c => c.id === cardId);
      setCard(fetchedCard || null);

      if (fetchedCard && fetchedCard.cardType === 'Debit' && fetchedCard.linkedAccountId) {
        const foundAccount = userApexAccounts.find(acc => acc.id === fetchedCard.linkedAccountId);
        if (foundAccount) {
          setLinkedAccountInfo(`${foundAccount.name} (...${foundAccount.accountNumber.slice(-4)})`);
        } else {
          setLinkedAccountInfo(`Apex Account (ID: ...${fetchedCard.linkedAccountId.slice(-4)})`);
        }
      } else {
        setLinkedAccountInfo(null);
      }
    }
  }, [cardId, user, userApexAccounts]);

  const handleToggleLock = async () => {
    if (!card) return;
    setActionLoading(true);
    setMessage(null);
    try {
        const updatedCardData = { ...card, isLocked: !card.isLocked };
        await updateApexCard(updatedCardData);
        setCard(updatedCardData);
        setMessage(`Card ${updatedCardData.isLocked ? 'locked' : 'unlocked'} successfully.`);
    } catch (error: any) {
        setMessage(error.message || "Failed to update card status.");
    } finally {
        setActionLoading(false);
    }
  };

  const handleReportLostStolen = async () => {
    if (!card) return;
    if(window.confirm(`Are you sure you want to report ${card.cardName} (...${card.last4}) as lost/stolen? This will permanently deactivate the card and a new one will be issued.`)){
        setActionLoading(true);
        setMessage(null);
        try {
            const updatedCardData = { ...card, isLocked: true };
            await updateApexCard(updatedCardData);
            setCard(updatedCardData); 
            setMessage(`Card reported as lost/stolen. It has been deactivated. Please contact us for a replacement.`);
        } catch(error: any) {
            setMessage(error.message || "Failed to report card.");
        } finally {
            setActionLoading(false);
        }
    }
  };
  
  const handleChangePIN = () => {
    alert("Navigate to Change Card PIN flow.");
  };

  if (!user) {
    return <div className="p-4 text-center">Loading user data...</div>;
  }

  if (!card) {
    return <div className="p-4 text-center text-red-500">Apex card not found. <Link to="/profile/manage-apex-cards" className="text-primary">Go back</Link>.</div>;
  }

  const CardAction: React.FC<{icon: React.ReactNode, label: string, onClick: () => void, danger?: boolean, sublabel?: string, disabled?: boolean}> = 
    ({icon, label, onClick, danger, sublabel, disabled}) => (
    <button 
        onClick={onClick} 
        disabled={disabled || actionLoading}
        className={`w-full flex justify-between items-center text-left p-3 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50 ${danger ? 'text-red-600 hover:bg-red-50' : 'text-neutral-700'}`}
    >
        <div className="flex items-center space-x-3">
            <span className={danger && !disabled ? "text-red-500" : "text-primary"}>{icon}</span>
            <div>
                <span className="font-medium">{label}</span>
                {sublabel && <p className="text-xs text-neutral-500">{sublabel}</p>}
            </div>
        </div>
        {!disabled && <ChevronRightIcon className="w-5 h-5 text-neutral-400" />}
    </button>
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile/manage-apex-cards" className="text-primary hover:text-accent-700" aria-label="Back to Manage Apex Cards">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Manage Card: {card.cardName}</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-md my-2 ${message.includes("Failed") ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md space-y-3">
        <div className="flex items-center space-x-4 mb-4">
            <CreditCardIcon className={`w-16 h-16 ${card.isLocked ? 'text-red-300' : 'text-primary'}`}/>
            <div>
                <h2 className="text-xl font-semibold text-neutral-800">{card.cardName}</h2>
                <p className="text-md text-neutral-600">Ending in <span className="font-mono">...{card.last4}</span></p>
                <p className="text-sm text-neutral-500">Expires: {card.expiryDate}</p>
                {card.isLocked && <p className="text-sm font-semibold text-red-600">CARD LOCKED</p>}
            </div>
        </div>
        
        {card.cardType === 'Credit' && (
            <div className="border-t pt-3 text-sm">
                <p><span className="font-medium text-neutral-700">Credit Limit:</span> {formatCurrency(card.creditLimit || 0)}</p>
                <p><span className="font-medium text-neutral-700">Available Credit:</span> {formatCurrency(card.availableCredit || 0)}</p>
            </div>
        )}
         {card.cardType === 'Debit' && linkedAccountInfo && (
            <div className="border-t pt-3 text-sm">
                <p><span className="font-medium text-neutral-700">Linked to:</span> {linkedAccountInfo}</p>
            </div>
        )}
      </div>
      
      <div className="bg-white p-2 rounded-lg shadow-md divide-y divide-neutral-100">
        <CardAction 
            icon={<LockClosedIcon className="w-5 h-5"/>} 
            label={card.isLocked ? "Unlock Card" : "Lock Card"}
            sublabel={card.isLocked ? "Enable transactions" : "Temporarily disable transactions"}
            onClick={handleToggleLock}
            disabled={actionLoading}
        />
         <CardAction 
            icon={<KeyIcon className="w-5 h-5"/>} 
            label="Change PIN"
            sublabel="Set a new PIN for your card"
            onClick={handleChangePIN}
            disabled={actionLoading}
        />
        <CardAction 
            icon={<FlagIcon className="w-5 h-5"/>} 
            label="Report Lost or Stolen"
            sublabel="Permanently deactivate this card"
            onClick={handleReportLostStolen}
            danger
            disabled={actionLoading}
        />
      </div>
      
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Card management features provide control over your card's security and usage.</span>
      </div>
    </div>
  );
};

export default ApexCardDetailScreen;