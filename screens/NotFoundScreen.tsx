
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { HomeIcon } from '../constants';


const NotFoundScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-primary opacity-50 mb-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <h1 className="text-4xl font-bold text-neutral-800 mb-2">Oops! Page Not Found</h1>
      <p className="text-neutral-600 mb-6 text-lg">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" size="lg" leftIcon={<HomeIcon className="w-5 h-5" />}>
          Go to Homepage
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundScreen;
