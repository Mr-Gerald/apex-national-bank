
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileData } from '../types';
import { InformationCircleIcon } from '../constants';
import { FormRow } from '../components/FormRow'; 
import StepIndicator from '../components/StepIndicator';

const VerifyIdentityDataScreen: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { accountId, transactionId } = useParams<{ accountId: string; transactionId: string }>();

  const [formData, setFormData] = useState<UserProfileData>({
    fullName: '', email: '', phoneNumber: '', addressLine1: '', city: '', state: '', zipCode: '',
    ssn: '', phoneCarrier: '', dateOfBirth: ''
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        dateOfBirth: user.dateOfBirth || '',
        occupation: user.occupation || '',
        maritalStatus: user.maritalStatus || undefined,
        profileImageUrl: user.profileImageUrl || undefined,
        ssn: user.ssn || '', // Ensure SSN is loaded if available
        phoneCarrier: user.phoneCarrier || '',
      });
    }
  }, [user]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.addressLine1 || !formData.city || !formData.state || !formData.zipCode || !formData.dateOfBirth || !formData.ssn) {
        setMessage("Please fill all required fields, including SSN and Date of Birth.");
        setIsLoading(false);
        return;
    }
    if (!/^\d{3}-?\d{2}-?\d{4}$|^\d{9}$/.test(formData.ssn)) { // Basic SSN format check
        setMessage("Please enter a valid SSN (e.g., 000-00-0000 or 000000000).");
        setIsLoading(false);
        return;
    }

    try {
      // updateUserProfile will call userService, which now logs the full formData.
      await updateUserProfile(formData); 
      
      setTimeout(() => {
        setIsLoading(false);
        navigate(`/verify-identity/upload-id/${accountId}/${transactionId}`);
      }, 1200);
    } catch (error: any) {
      setMessage(error.message || "Failed to save information. Please try again.");
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-4 space-y-6">
      <StepIndicator currentStep={1} totalSteps={4} flowType="funds" />
      <div className="flex items-center space-x-3 mb-4">
        <h1 className="text-2xl font-semibold text-neutral-800">Verify Your Identity (Step 1/4)</h1>
      </div>

      <p className="text-sm text-neutral-600">Please provide or confirm your personal information. This helps us protect your account and comply with regulations.</p>

      {message && <div className={`p-3 rounded-md ${message.includes("successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <FormRow label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="As it appears on your ID"/>
        <FormRow label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" required />
        <FormRow label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} type="tel" required placeholder="e.g., 555-123-4567"/>
        <FormRow label="Phone Carrier (Optional)" name="phoneCarrier" value={formData.phoneCarrier} onChange={handleChange} placeholder="e.g., Verizon, T-Mobile"/>
        
        <FormRow label="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required />
        <FormRow label="Address Line 2 (Optional)" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormRow label="City" name="city" value={formData.city} onChange={handleChange} required />
            <FormRow label="State" name="state" value={formData.state} onChange={handleChange} required maxLength={20}/>
            <FormRow label="ZIP Code" name="zipCode" value={formData.zipCode} onChange={handleChange} required maxLength={10}/>
        </div>
        <FormRow label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} type="date" required />
        <FormRow label="Social Security Number (SSN)" name="ssn" value={formData.ssn} onChange={handleChange} required placeholder="000-00-0000 or 000000000" pattern="^\d{3}-?\d{2}-?\d{4}$|^\d{9}$" />

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue to ID Upload'}
        </Button>
      </form>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Your information is protected by bank-level security. We use this information to verify your identity and secure your account.</span>
      </div>
    </div>
  );
};

export default VerifyIdentityDataScreen;
