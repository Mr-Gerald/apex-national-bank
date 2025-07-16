

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { 
    BANK_NAME, BANK_SLOGAN, LockClosedIcon, 
    ShieldCheckIcon, StarIcon, GlobeAltIcon, ChartPieIcon,
    AcademicCapIcon, UsersIcon, BuildingOfficeIcon 
} from '../constants';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, authError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // The login function triggers a state change in AuthContext.
      // A useEffect hook in App.tsx now handles all redirection logic.
      await login(username, password);
    } catch (error) {
      console.error("Login attempt failed:", error);
      // authError is already set by the login function in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary to-blue-700 p-4 overflow-y-auto">
      <div className="w-full max-w-md space-y-6"> {/* Reduced space-y-8 to space-y-6 */}
        {/* Header Section */}
        <div className="text-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 text-accent mx-auto mb-3 opacity-90">
                 <path d="M12 2L2 22h20L12 2zm0 3.54L17.71 20H6.29L12 5.54z" />
                 <path fillRule="evenodd" d="M12 5.536l-5.714 14.464h11.428L12 5.536zM7.5 20l4.5-10 4.5 10H7.5z" clipRule="evenodd" opacity="0.6" />
            </svg>
          <h1 className="text-4xl font-bold">{BANK_NAME}</h1>
          <p className="text-lg opacity-80">{BANK_SLOGAN}</p>
          <p className="mt-3 text-sm opacity-70">Securely access your financial world.</p>
        </div>
        
        {/* Login Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-semibold text-center text-neutral-700 mb-6">Member Login</h2>
          {authError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md">
              {authError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username"className="block text-sm font-medium text-neutral-700">Username or Email</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full p-2.5 border border-neutral-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                required
                aria-label="Username or Email"
              />
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-neutral-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full p-2.5 border border-neutral-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                required
                aria-label="Password"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="rememberMe" className="flex items-center">
                <input type="checkbox" id="rememberMe" className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded" />
                <span className="ml-2 text-neutral-600">Remember me</span>
              </label>
              <a href="#" onClick={(e) => {e.preventDefault(); alert("Forgot Password functionality is illustrative.");}} className="font-medium text-primary hover:text-accent-700">
                Forgot password?
              </a>
            </div>
            <Button type="submit" variant="primary" className="w-full py-2.5" isLoading={isLoading} disabled={isLoading} leftIcon={!isLoading ? <LockClosedIcon className="w-5 h-5"/> : null}>
              {isLoading ? 'Logging In...' : 'Log In'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-neutral-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-accent-700">
              Sign Up
            </Link>
          </p>
        </div>
        
        {/* Illustrative Section */}
        <div className="mt-6 pt-4 border-t border-white/20">
            <h3 className="text-center text-lg font-semibold text-white mb-4 opacity-90">Why Bank With Us?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-white text-xs">
                <FeatureHighlight icon={<AcademicCapIcon className="w-7 h-7 mx-auto mb-1 opacity-80"/>} text="Expert Financial Guidance" />
                <FeatureHighlight icon={<UsersIcon className="w-7 h-7 mx-auto mb-1 opacity-80"/>} text="Community Focused Banking" />
                <FeatureHighlight icon={<BuildingOfficeIcon className="w-7 h-7 mx-auto mb-1 opacity-80"/>} text="Building Your Future Together" />
                <FeatureHighlight icon={<ShieldCheckIcon className="w-7 h-7 mx-auto mb-1 opacity-80"/>} text="Secure & Trusted Services" />
                <FeatureHighlight icon={<StarIcon className="w-7 h-7 mx-auto mb-1 opacity-80"/>} text="Achieve Your Financial Goals" />
                <FeatureHighlight icon={<GlobeAltIcon className="w-7 h-7 mx-auto mb-1 opacity-80"/>} text="Access Anywhere, Anytime" />
            </div>
        </div>
      </div>
    </div>
  );
};

const FeatureHighlight: React.FC<{icon: React.ReactNode; text: string}> = ({icon, text}) => (
    <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors">
        {icon}
        <p className="leading-tight mt-1">{text}</p>
    </div>
);


export default LoginScreen;