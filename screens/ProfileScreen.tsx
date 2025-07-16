
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { 
    UserCircleIcon, InformationCircleIcon, ChevronRightIcon, CreditCardIcon, StarIcon, 
    ShareIcon, QuestionMarkCircleIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, Cog6ToothIcon, BellIcon, PaperClipIcon,
    GlobeAltIcon, DocumentDuplicateIcon, ShieldCheckIcon as ShieldCheckHeroIcon, HourglassIcon, CheckCircleIcon as CheckCircleHeroIcon
} from '../constants'; 
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatters';

const ImageViewerModal: React.FC<{ isOpen: boolean; onClose: () => void; imageUrl: string }> = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[101] transition-opacity" // Higher z-index than modal
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div className="relative p-4" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Profile full view" className="max-w-screen-sm max-h-[80vh] rounded-lg shadow-2xl object-contain" />
        <button 
          onClick={onClose} 
          className="absolute -top-2 -right-2 bg-white/80 hover:bg-white text-black rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close image viewer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};


const ProfileScreen: React.FC = () => {
  const { user, requestLogout } = useAuth(); 
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const defaultProfilePic = `https://ui-avatars.com/api/?name=${user?.fullName?.replace(/\s/g, '+') || 'User'}&background=004a8c&color=fff&size=96`;


  if (!user) { 
    return <div className="p-4 text-center">Loading user profile...</div>;
  }
  
  const profileVerificationStatus = user.verificationSubmission?.status;
  let verificationLinkText = "Verify My Identity (for Top-Tier)";
  let verificationLinkTo = "/profile-verification/data";
  let verificationIcon = <ShieldCheckHeroIcon className="w-5 h-5 text-primary mr-3"/>;
  let verificationAction = null; // Can be a NavLink or a div for display

  if (user.isIdentityVerified && profileVerificationStatus !== 'pending_profile_review') { // If fully verified and not in a pending profile specific review
    verificationAction = (
        <div className="flex justify-between items-center w-full py-3.5 px-1 text-sm text-neutral-700">
            <span className="flex items-center">
                <ShieldCheckHeroIcon className="w-5 h-5 text-green-500 mr-3"/>
                Identity Verified
            </span>
            <CheckCircleHeroIcon className="w-5 h-5 text-green-500"/>
        </div>
    );
  } else if (profileVerificationStatus === 'pending_profile_review') {
     verificationAction = (
        <div className="flex justify-between items-center w-full py-3.5 px-1 text-sm text-neutral-700">
            <span className="flex items-center">
                <HourglassIcon className="w-5 h-5 text-orange-500 mr-3"/>
                Profile Verification Pending Review
            </span>
        </div>
    );
  } else { // Not verified or submission status doesn't indicate pending profile review
     verificationAction = (
        <ProfileLinkOption label={verificationLinkText} to={verificationLinkTo} icon={verificationIcon} />
     );
  }


  return (
    <>
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-800">Profile & Settings</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center space-y-3">
        <button 
            onClick={() => setIsImageViewerOpen(true)}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform hover:scale-105"
            aria-label="View profile picture in full screen"
        >
            <img 
                src={user.profileImageUrl || defaultProfilePic} 
                alt="User Profile" 
                className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-primary"
            />
        </button>
        <h2 className="text-xl font-semibold text-neutral-800">{user.fullName}</h2>
        <p className="text-sm text-neutral-600">{user.email}</p>
        {user.createdAt && <p className="text-xs text-neutral-500">Member since: {formatDate(user.createdAt)}</p>}
        <Link to="/profile/personal-info" className="mt-1">
            <Button variant="outline" size="sm">Edit Profile</Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-1 divide-y divide-neutral-100">
        <h3 className="text-lg font-semibold text-neutral-700 mb-2 p-1">Account & Services</h3>
        <ProfileLinkOption label="Personal Information" to="/profile/personal-info" icon={<UserCircleIcon className="w-5 h-5 text-primary mr-3"/>} />
        <ProfileLinkOption label="Manage My Apex Cards" to="/profile/manage-apex-cards" icon={<CreditCardIcon className="w-5 h-5 text-primary mr-3"/>} />
        <ProfileLinkOption label="Linked External Accounts & Cards" to="/profile/linked-accounts" icon={<PaperClipIcon className="w-5 h-5 text-primary mr-3"/>} />
        
        {verificationAction}

        <ProfileLinkOption label="My Savings Goals" to="/profile/savings-goals" icon={<StarIcon className="w-5 h-5 text-primary mr-3"/>} />
        <ProfileLinkOption label="Send Money with Zelle®" to="/profile/zelle" icon={<ShareIcon className="w-5 h-5 text-primary mr-3"/>} />
        <ProfileLinkOption label="Set Travel Notice" to="/profile/travel-notice" icon={<GlobeAltIcon className="w-5 h-5 text-primary mr-3"/>} />
        <ProfileLinkOption label="View Documents" to="/profile/documents" icon={<DocumentDuplicateIcon className="w-5 h-5 text-primary mr-3"/>} />
      </div>


      <div className="bg-white p-4 rounded-lg shadow space-y-1 divide-y divide-neutral-100">
        <h3 className="text-lg font-semibold text-neutral-700 mb-2 p-1">Settings & Support</h3>
        <ProfileLinkOption label="Security Settings" to="/profile/security" icon={<Cog6ToothIcon className="w-5 h-5 text-primary mr-3"/>} />
        <ProfileLinkOption label="Notifications" to="/profile/notifications" icon={<BellIcon className="w-5 h-5 text-primary mr-3"/>} />
        <ProfileLinkOption label="Help Center" to="/profile/help" icon={<QuestionMarkCircleIcon className="w-5 h-5 text-primary mr-3"/>} />
        <ProfileLinkOption label="Contact Us" to="/profile/contact" icon={<ChatBubbleLeftRightIcon className="w-5 h-5 text-primary mr-3"/>} />
        <ProfileLinkOption label="Terms of Service" to="/profile/terms" icon={<DocumentTextIcon className="w-5 h-5 text-primary mr-3"/>} />
        <ProfileLinkOption label="Privacy Policy" to="/profile/privacy" icon={<DocumentTextIcon className="w-5 h-5 text-primary mr-3"/>} />
      </div>

      <Button variant="secondary" className="w-full" onClick={requestLogout}> 
        Log Out
      </Button>
       <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Your security is our priority. Apex National Bank will never ask for your password or full card number via email or unsolicited calls. Contact us immediately if you suspect any fraudulent activity.</span>
      </div>
    </div>
    <ImageViewerModal
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        imageUrl={user.profileImageUrl || defaultProfilePic}
    />
    </>
  );
};

interface ProfileLinkOptionProps {
  label: string;
  to: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const ProfileLinkOption: React.FC<ProfileLinkOptionProps> = ({ label, to, icon, disabled }) => (
  <Link
    to={disabled ? '#' : to}
    className={`flex justify-between items-center w-full py-3.5 px-1 text-sm text-neutral-700 rounded-md transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50'}`}
    role="menuitem"
    onClick={(e) => disabled && e.preventDefault()}
    aria-disabled={disabled}
  >
    <span className="flex items-center">
      {icon}
      {label}
    </span>
    {!disabled && <ChevronRightIcon className="w-4 h-4 text-neutral-400" />}
  </Link>
);


export default ProfileScreen;