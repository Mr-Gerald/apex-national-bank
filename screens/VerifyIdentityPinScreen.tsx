
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import { KeyIcon, InformationCircleIcon, ShieldCheckIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { LinkedCard } from '../types';
import StepIndicator from '../components/StepIndicator';

const VerifyIdentityPinScreen: React.FC = () => {
  const { user, finalizeVerificationSubmission } = useAuth(); // Removed markUserAsVerified, updateTransactionStatus
  const navigate = useNavigate();
  const location = useLocation();
  const { accountId, transactionId, linkedCardId } = useParams<{ accountId?: string; transactionId?: string; linkedCardId: string }>();
  
  const isProfileVerificationFlow = location.pathname.includes('/profile-verification');

  const [pin, setPin] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);
  const [linkedCard, setLinkedCard] = useState<LinkedCard | null>(null);
  const [displayStep, setDisplayStep] = useState(4);

  useEffect(() => {
      if (user && linkedCardId) {
          const card = user.linkedCards.find(c => c.id === linkedCardId);
          setLinkedCard(card || null);
      }
  }, [user, linkedCardId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setIsVerificationComplete(false);

    if (pin.length < 4) { 
      setMessage("Please enter a valid PIN (at least 4 digits).");
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1200)); 
      
      if (linkedCardId) {
          // Pass accountId and transactionId if it's a funds flow
          await finalizeVerificationSubmission(
              linkedCardId, 
              pin, 
              isProfileVerificationFlow,
              !isProfileVerificationFlow ? accountId : undefined,
              !isProfileVerificationFlow ? transactionId : undefined
          );
      } else {
          throw new Error("Linked card ID is missing.");
      }
      
      // For funds flow, the transaction status is now "Pending" (under review) by finalizeVerificationSubmission.
      // User's isIdentityVerified is NOT set true here; admin does that.
      // For profile flow, submission status is 'pending_profile_review'.
      
      let successMessage = "Your identity verification submission has been received and is now under review. We will notify you of the outcome. This process typically takes 1-2 business days.";
      if (!isProfileVerificationFlow) {
          successMessage += " If successful, any on-hold funds will then be processed.";
      } else {
          successMessage += " If successful, top-tier features will be enabled.";
      }
      
      setMessage(successMessage);
      setIsVerificationComplete(true);
      setDisplayStep(5); // Indicate completion for StepIndicator
      
    } catch (error: any) {
      setMessage(error.message || "PIN verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!linkedCard && !isLoading && !isVerificationComplete) { 
      return (
          <div className="p-4 text-center">
              <p>Loading card information...</p>
              <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
      );
  }

  return (
    <div className="p-4 space-y-6">
       <StepIndicator currentStep={displayStep} totalSteps={4} flowType={isProfileVerificationFlow ? 'profile' : 'funds'} />
      <h1 className="text-2xl font-semibold text-neutral-800">
        {isProfileVerificationFlow ? "Verify for Top-Tier Access (Step 4/4)" : "Verify Your Identity (Step 4/4)"}
      </h1>
      {!isVerificationComplete && linkedCard && (
          <p className="text-sm text-neutral-600">Please enter the PIN for your linked card: <strong>{linkedCard.bankName} {linkedCard.cardType} ending in ...{linkedCard.last4}</strong>. This is the final step to verify your identity.</p>
      )}
      {!isVerificationComplete && !linkedCard && (
          <p className="text-sm text-neutral-600">Loading card details for PIN entry...</p>
      )}


      {message && <div className={`p-3 rounded-md ${isVerificationComplete ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

      {!isVerificationComplete ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div>
            <label htmlFor="pin" className="block text-sm font-medium text-neutral-700 mb-1">Card PIN <span className="text-red-500">*</span></label>
            <div className="relative">
                <input
                type="password"
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0,6))} 
                placeholder="Enter your card PIN"
                maxLength={6}
                className="w-full p-2 pl-10 border border-neutral-300 rounded-md"
                required
                disabled={!linkedCard || isLoading} 
                />
                <KeyIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
            </div>
            </div>
            
            <div className="flex space-x-3">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(isProfileVerificationFlow ? `/profile-verification/link-card` : `/verify-identity/link-card/${accountId}/${transactionId}`)} 
                    disabled={isLoading}
                >
                    Back
                </Button>
                <Button type="submit" variant="primary" className="flex-grow" isLoading={isLoading} disabled={isLoading || !linkedCard} leftIcon={<ShieldCheckIcon className="w-5 h-5"/>}>
                    {isLoading ? 'Verifying...' : 'Complete Verification'}
                </Button>
            </div>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Button variant="primary" onClick={() => navigate(isProfileVerificationFlow ? '/profile' : (accountId && transactionId ? `/transaction-detail/${accountId}/${transactionId}` : '/dashboard'))}>
                {isProfileVerificationFlow ? 'Back to Profile' : 'View Transaction / Done'}
            </Button>
        </div>
      )}
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Your security is paramount. Ensure you are in a private setting when entering sensitive information.</span>
      </div>
    </div>
  );
};

export default VerifyIdentityPinScreen;
