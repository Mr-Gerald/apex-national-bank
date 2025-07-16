
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { InformationCircleIcon, KeyIcon } from '../constants';

const ChangePasswordScreen: React.FC = () => {
  const { user, changePassword } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSuccess(false);
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 6) { // Basic validation
      setMessage("New password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setMessage("Password changed successfully! You will be redirected to the profile screen.");
      setIsSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/profile/security'), 2000);
    } catch (error: any) {
      setMessage(error.message || "Failed to change password. Please check your current password.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile/security" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Change Password</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="currentPassword"className="block text-sm font-medium text-neutral-700 mb-1">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="newPassword"className="block text-sm font-medium text-neutral-700 mb-1">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
            required
            disabled={isLoading}
          />
           <p className="text-xs text-neutral-500 mt-1">Password must be at least 6 characters long.</p>
        </div>
        <div>
          <label htmlFor="confirmPassword"className="block text-sm font-medium text-neutral-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
            required
            disabled={isLoading}
          />
        </div>
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading} leftIcon={<KeyIcon className="w-5 h-5"/>}>
          {isLoading ? 'Changing Password...' : 'Change Password'}
        </Button>
      </form>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Choose a strong, unique password that you don't use for other accounts.</span>
      </div>
    </div>
  );
};

export default ChangePasswordScreen;