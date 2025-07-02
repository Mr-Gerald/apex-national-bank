import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { 
    BANK_NAME, BANK_SLOGAN, UserCircleIcon,
    ShieldCheckIcon, StarIcon, GlobeAltIcon, ChartPieIcon 
} from '../constants';
import { UserProfileData } from '../types';

const SignUpScreen: React.FC = () => {
  const [profileForm, setProfileForm] = useState<Omit<UserProfileData, 'profileImageUrl'>>({
    fullName: '', email: '', phoneNumber: '', addressLine1: '', city: '', state: '', zipCode: ''
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, authError } = useAuth(); 
  const navigate = useNavigate();

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setIsSuccessMessage(false);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (!profileForm.fullName || !profileForm.email || !username || !password) {
        setMessage("Please fill all required fields: Full Name, Email, Username, and Password.");
        setIsLoading(false);
        return;
    }

    try {
        await register(username, password, profileForm);
        setMessage(`Registration successful for ${username}! A confirmation email has been sent to ${profileForm.email}. Please log in to continue.`);
        setIsSuccessMessage(true);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setProfileForm({ fullName: '', email: '', phoneNumber: '', addressLine1: '', city: '', state: '', zipCode: '' });
    } catch (error: any) {
        setMessage(error.message || "Sign-up failed. Please try again.");
        setIsSuccessMessage(false);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-accent to-teal-700 p-4 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
            {/* Header Section */}
            <div className="text-center text-white pt-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-primary mx-auto mb-2 opacity-90">
                    <path d="M12 2L2 22h20L12 2zm0 3.54L17.71 20H6.29L12 5.54z" />
                    <path fillRule="evenodd" d="M12 5.536l-5.714 14.464h11.428L12 5.536zM7.5 20l4.5-10 4.5 10H7.5z" clipRule="evenodd" opacity="0.6" />
                </svg>
            <h1 className="text-3xl font-bold">{BANK_NAME}</h1>
            <p className="text-md opacity-80">Join us and {BANK_SLOGAN.toLowerCase()}</p>
            </div>
            
            {/* Sign Up Form Card */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
                <h2 className="text-xl font-semibold text-center text-neutral-700 mb-5">Create Your Account</h2>
                {message && (
                <div className={`my-3 p-3 ${isSuccessMessage ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-sm rounded-md`}>
                    {message}
                    {isSuccessMessage && (
                        <Link to="/login" className="block text-center mt-2 font-medium text-green-800 hover:underline">Proceed to Login</Link>
                    )}
                </div>
                )}
                {authError && !message && ( 
                    <div className="my-3 p-3 bg-red-100 text-red-700 text-sm rounded-md">
                        {authError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label htmlFor="fullName" className="block text-xs font-medium text-neutral-700">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" name="fullName" id="fullName" value={profileForm.fullName} onChange={handleProfileChange} required className="mt-1 w-full p-2 border border-neutral-300 rounded-md text-sm focus:ring-primary focus:border-primary"/>
                </div>
                <div>
                    <label htmlFor="email" className="block text-xs font-medium text-neutral-700">Email <span className="text-red-500">*</span></label>
                    <input type="email" name="email" id="email" value={profileForm.email} onChange={handleProfileChange} required className="mt-1 w-full p-2 border border-neutral-300 rounded-md text-sm focus:ring-primary focus:border-primary"/>
                </div>
                <div>
                    <label htmlFor="phoneNumber" className="block text-xs font-medium text-neutral-700">Phone Number</label>
                    <input type="tel" name="phoneNumber" id="phoneNumber" value={profileForm.phoneNumber} onChange={handleProfileChange} className="mt-1 w-full p-2 border border-neutral-300 rounded-md text-sm focus:ring-primary focus:border-primary"/>
                </div>
                <div>
                    <label htmlFor="addressLine1" className="block text-xs font-medium text-neutral-700">Address Line 1</label>
                    <input type="text" name="addressLine1" id="addressLine1" value={profileForm.addressLine1} onChange={handleProfileChange} className="mt-1 w-full p-2 border border-neutral-300 rounded-md text-sm focus:ring-primary focus:border-primary"/>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label htmlFor="city" className="block text-xs font-medium text-neutral-700">City</label>
                        <input type="text" name="city" id="city" value={profileForm.city} onChange={handleProfileChange} className="mt-1 w-full p-2 border border-neutral-300 rounded-md text-sm focus:ring-primary focus:border-primary"/>
                    </div>
                    <div>
                        <label htmlFor="state" className="block text-xs font-medium text-neutral-700">State</label>
                        <input type="text" name="state" id="state" value={profileForm.state} onChange={handleProfileChange} className="mt-1 w-full p-2 border border-neutral-300 rounded-md text-sm focus:ring-primary focus:border-primary"/>
                    </div>
                    <div>
                        <label htmlFor="zipCode" className="block text-xs font-medium text-neutral-700">Zip</label>
                        <input type="text" name="zipCode" id="zipCode" value={profileForm.zipCode} onChange={handleProfileChange} className="mt-1 w-full p-2 border border-neutral-300 rounded-md text-sm focus:ring-primary focus:border-primary"/>
                    </div>
                </div>

                <hr className="my-3 border-neutral-200"/>
                <div>
                    <label htmlFor="username" className="block text-xs font-medium text-neutral-700">Username <span className="text-red-500">*</span></label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="mt-1 w-full p-2 border border-neutral-300 rounded-md text-sm focus:ring-primary focus:border-primary"/>
                </div>
                <div>
                    <label htmlFor="password"className="block text-xs font-medium text-neutral-700">Password <span className="text-red-500">*</span></label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full p-2 border border-neutral-300 rounded-md text-sm focus:ring-primary focus:border-primary" autoComplete="new-password"/>
                    <p className="text-xs text-neutral-500 mt-1">Use a strong, unique password for your security.</p>
                </div>
                <div>
                    <label htmlFor="confirmPassword"className="block text-xs font-medium text-neutral-700">Confirm Password <span className="text-red-500">*</span></label>
                    <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 w-full p-2 border border-neutral-300 rounded-md text-sm focus:ring-primary focus:border-primary" autoComplete="new-password"/>
                </div>
                <Button type="submit" variant="secondary" className="w-full py-2.5 mt-4" isLoading={isLoading} disabled={isLoading} leftIcon={!isLoading ? <UserCircleIcon className="w-5 h-5"/> : null}>
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>
                </form>
                <p className="mt-4 text-center text-sm text-neutral-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-accent-700 hover:text-primary">
                    Log In
                </Link>
                </p>
            </div>
             {/* Feature Highlights Section - copied from Login for consistency */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 gap-3 text-center text-white text-xs px-2 pb-4">
                <FeatureHighlight icon={<ShieldCheckIcon className="w-6 h-6 mx-auto mb-1 opacity-80"/>} text="Secure Transactions" />
                <FeatureHighlight icon={<StarIcon className="w-6 h-6 mx-auto mb-1 opacity-80"/>} text="Achieve Your Goals" />
                <FeatureHighlight icon={<GlobeAltIcon className="w-6 h-6 mx-auto mb-1 opacity-80"/>} text="24/7 Digital Access" />
                <FeatureHighlight icon={<ChartPieIcon className="w-6 h-6 mx-auto mb-1 opacity-80"/>} text="Personalized Insights" />
            </div>
        </div>
    </div>
  );
};

const FeatureHighlight: React.FC<{icon: React.ReactNode; text: string}> = ({icon, text}) => (
    <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-sm">
        {icon}
        <p className="leading-tight">{text}</p>
    </div>
);

export default SignUpScreen;