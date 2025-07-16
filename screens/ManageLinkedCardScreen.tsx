
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { LinkedCard } from '../types';
import { InformationCircleIcon, CreditCardIcon, TrashIcon, StarIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';

const ManageLinkedCardScreen: React.FC = () => {
  const { externalCardId } = useParams<{ externalCardId: string }>();
  const { user, unlinkExternalCard, updateExternalCard } = useAuth(); 
  const navigate = useNavigate();
  
  const [card, setCard] = useState<LinkedCard | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [actionLoading, setActionLoading] = useState(false); 
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    if (externalCardId && user && user.linkedCards) {
      const foundCard = user.linkedCards.find(c => c.id === externalCardId);
      setCard(foundCard || null);
    } else {
      setCard(null);
    }
    setIsLoading(false);
  }, [externalCardId, user]);

  const handleRemoveCard = async () => {
    if (!card) return;
    if (window.confirm(`Are you sure you want to remove ${card.cardType} card ending in ...${card.last4}?`)) {
      setActionLoading(true);
      setMessage(null);
      try {
        await unlinkExternalCard(card.id); // Use AuthContext function
        setMessage(`${card.cardType} card (...${card.last4}) has been unlinked.`);
        setTimeout(() => navigate('/profile/linked-accounts'), 1500);
      } catch(error: any) {
        setMessage(error.message || "Failed to unlink card.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleSetAsDefault = async () => {
    if (!card || card.isDefault || !user) return;
    setActionLoading(true);
    setMessage(null);
    try {
        const cardToSetDefault: LinkedCard = { ...card, isDefault: true };
        await updateExternalCard(cardToSetDefault); 
        setMessage(`${card.cardType} card (...${card.last4}) set as default payment method.`);
        setCard(prev => prev ? {...prev, isDefault: true} : null);
    } catch (error: any) {
        setMessage(error.message || "Failed to set card as default.");
    } finally {
        setActionLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading card details...</div>;
  }

  if (!card) {
    return <div className="p-4 text-center text-red-500">Linked card not found. <Link to="/profile/linked-accounts" className="text-primary">Go back</Link>.</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile/linked-accounts" className="text-primary hover:text-accent-700" aria-label="Back to Linked Accounts">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Manage Linked Card</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${message.includes("unlinked") || message.includes("default") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md space-y-3">
        <div className="flex items-center space-x-3">
            <CreditCardIcon className="w-10 h-10 text-primary"/>
            <div>
                <h2 className="text-xl font-semibold text-neutral-800">{card.bankName ? `${card.bankName} ` : ''}{card.cardType}</h2>
                <p className="text-md text-neutral-600">Card ending in ...{card.last4}</p>
            </div>
        </div>
        
        <div className="border-t pt-3">
            <p className="text-sm"><span className="font-medium text-neutral-700">Cardholder:</span> {card.cardHolderName}</p>
            <p className="text-sm"><span className="font-medium text-neutral-700">Expires:</span> {card.expiryDate}</p>
            {card.isDefault && <p className="text-sm text-green-600 font-semibold">This is your default payment card.</p>}
        </div>

        <div className="pt-3 space-y-2">
            {!card.isDefault && (
                <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleSetAsDefault}
                    isLoading={actionLoading}
                    disabled={actionLoading}
                    leftIcon={<StarIcon className="w-5 h-5"/>}
                >
                    Set as Default
                </Button>
            )}
             <Button variant="outline" className="w-full" onClick={() => alert("Editing external card details requires re-linking the card for security reasons.")}>
                Edit Details
            </Button>
            <Button 
                variant="secondary" 
                className="w-full bg-red-500 hover:bg-red-700 text-white" 
                onClick={handleRemoveCard}
                isLoading={actionLoading}
                disabled={actionLoading}
                leftIcon={<TrashIcon className="w-5 h-5"/>}
            >
                Unlink This Card
            </Button>
        </div>
      </div>
      
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Manage your linked external card. Unlinking will remove it from your profile. Changes are saved to your profile.</span>
      </div>
    </div>
  );
};

export default ManageLinkedCardScreen;