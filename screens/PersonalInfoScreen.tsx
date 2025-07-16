import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { InformationCircleIcon, CameraIcon, CalendarDaysIcon, BriefcaseIcon, UserGroupIcon, UserCircleIcon } from '../constants';
import { UserProfileData } from '../types';

const PersonalInfoScreen: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  // Initialize formData with a structure that matches UserProfileData, even if user is null initially
  const [formData, setFormData] = useState<UserProfileData>({
    fullName: '', email: '', phoneNumber: '', addressLine1: '', city: '', state: '', zipCode: '', 
    // provide defaults for optional fields too
    addressLine2: '', dateOfBirth: '', occupation: '', maritalStatus: undefined, profileImageUrl: undefined 
  });
  const [message, setMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      });
      setPreviewImage(user.profileImageUrl);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        setFormData({ ...formData, profileImageUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await updateUserProfile(formData); // This now persists to localStorage via userService
      setMessage("Personal information updated successfully.");
      setIsEditing(false);
    } catch (error: any) {
      setMessage(`Failed to update profile: ${error.message}`);
    }
  };

  const InfoRow: React.FC<{label: string, value?: string, icon?: React.ReactNode}> = ({label, value, icon}) => (
    value ? (
        <div className="py-2 flex items-start">
            {icon && <span className="mr-2 mt-0.5 text-primary">{icon}</span>}
            <div>
                <p className="text-xs text-neutral-500">{label}</p>
                <p className="text-sm text-neutral-800">{value}</p>
            </div>
        </div>
    ) : null
  );
  
  if (!user) { // Should be handled by AuthProvider loading state, but as a fallback
      return <div className="p-4 text-center">Loading profile information...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Personal Information</h1>
      </div>

      {message && <div className={`p-3 rounded-md ${message.includes("successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-primary mb-3 flex items-center justify-center bg-neutral-100">
              {previewImage ? (
                  <img 
                      src={previewImage} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                  />
              ) : (
                  <UserCircleIcon className="w-16 h-16 text-neutral-400" />
              )}
            </div>
            {isEditing && (
                <>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                    <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} leftIcon={<CameraIcon className="w-4 h-4"/>}>
                        Change Photo
                    </Button>
                </>
            )}
        </div>

        {!isEditing ? (
          <div className="space-y-1 divide-y divide-neutral-100">
            <InfoRow label="Full Name" value={formData.fullName} />
            <InfoRow label="Email Address" value={formData.email} />
            <InfoRow label="Phone Number" value={formData.phoneNumber} />
            <InfoRow label="Address" value={`${formData.addressLine1}${formData.addressLine2 ? `, ${formData.addressLine2}` : ''}, ${formData.city}, ${formData.state} ${formData.zipCode}`} />
            <InfoRow label="Date of Birth" value={formData.dateOfBirth} icon={<CalendarDaysIcon className="w-4 h-4"/>} />
            <InfoRow label="Occupation" value={formData.occupation} icon={<BriefcaseIcon className="w-4 h-4"/>} />
            <InfoRow label="Marital Status" value={formData.maritalStatus} icon={<UserGroupIcon className="w-4 h-4"/>} />
            <div className="pt-4">
                <Button onClick={() => setIsEditing(true)} variant="primary">Edit Information</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700">Full Name</label>
              <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email Address</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-neutral-700">Phone Number</label>
              <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="addressLine1" className="block text-sm font-medium text-neutral-700">Address Line 1</label>
              <input type="text" name="addressLine1" id="addressLine1" value={formData.addressLine1} onChange={handleChange} className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm"/>
            </div>
             <div>
              <label htmlFor="addressLine2" className="block text-sm font-medium text-neutral-700">Address Line 2 (Optional)</label>
              <input type="text" name="addressLine2" id="addressLine2" value={formData.addressLine2 || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm"/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-neutral-700">City</label>
                    <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm"/>
                </div>
                <div>
                    <label htmlFor="state" className="block text-sm font-medium text-neutral-700">State</label>
                    <input type="text" name="state" id="state" value={formData.state} onChange={handleChange} maxLength={20} className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm"/>
                </div>
                <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-neutral-700">ZIP Code</label>
                    <input type="text" name="zipCode" id="zipCode" value={formData.zipCode} onChange={handleChange} maxLength={10} className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm"/>
                </div>
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-neutral-700">Date of Birth</label>
              <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm"/>
            </div>
             <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-neutral-700">Occupation (Optional)</label>
              <input type="text" name="occupation" id="occupation" value={formData.occupation || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="maritalStatus" className="block text-sm font-medium text-neutral-700">Marital Status (Optional)</label>
              <select name="maritalStatus" id="maritalStatus" value={formData.maritalStatus || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm bg-white">
                <option value="">Select...</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-3">
              <Button type="submit" variant="primary">Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setMessage(null); if(user) setFormData(user); setPreviewImage(user?.profileImageUrl); }}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Keeping your personal information up to date is important for account security and communication. Changes are saved permanently to your profile.</span>
      </div>
    </div>
  );
};

export default PersonalInfoScreen;