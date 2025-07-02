import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { KeyIcon, InformationCircleIcon, ShieldCheckIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { LinkedCard } from '../types';
import StepIndicator from '../components/StepIndicator';

const VerifyProfilePinScreen: React.FC = () => {
  const { user, finalizeVerificationSubmission } = useAuth();
  const navigate = useNavigate();
  const { linkedCardId } = useParams<{ linkedCardId: string }>();

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
          await finalizeVerificationSubmission(linkedCardId, pin, true); // true for profile verification
      } else {
        throw new Error("Linked Card ID missing from request.");
      }
      
      const successMessage = "Identity confirmation under process. Your information is now under review. We will notify you once your identity is verified. This process typically takes 1-2 business days. If successful, top-tier features will be enabled.";
      
      setMessage(successMessage);
      setIsVerificationComplete(true);
      setDisplayStep(5); // To mark the last step as complete in StepIndicator
      
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
              <Button onClick={() => navigate('/profile')}>Back to Profile</Button>
          </div>
      );
  }

  return (
    <div className="p-4 space-y-6">
      <StepIndicator currentStep={displayStep} totalSteps={4} flowType="profile" />
      <h1 className="text-2xl font-semibold text-neutral-800">Verify for Top-Tier Access (Step 4/4)</h1>
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
                    onClick={() => navigate(`/profile-verification/link-card`)} 
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
            <Button variant="primary" onClick={() => navigate('/profile')}>
                Back to Profile
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

export default VerifyProfilePinScreen;