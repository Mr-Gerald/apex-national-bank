

import React from 'react';
import { BANK_NAME, BANK_SLOGAN } from '../constants';

const LoginLoadingScreen: React.FC = () => {

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-primary text-white">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-accent mb-4 animate-pulse">
        <path d="M12 2L2 22h20L12 2zm0 3.54L17.71 20H6.29L12 5.54z" />
        <path fillRule="evenodd" d="M12 5.536l-5.714 14.464h11.428L12 5.536zM7.5 20l4.5-10 4.5 10H7.5z" clipRule="evenodd" opacity="0.6" />
      </svg>
      <h1 className="text-3xl font-bold mb-1">{BANK_NAME}</h1>
      <p className="text-md opacity-80 mb-6">{BANK_SLOGAN}</p>
      <p className="text-lg">Loading your dashboard...</p>
      <div className="mt-4 w-32 h-2 bg-white/30 rounded-full overflow-hidden">
        <div className="h-full bg-accent animate-loading-bar"></div>
      </div>
    </div>
  );
};

export default LoginLoadingScreen;