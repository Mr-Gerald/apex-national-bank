
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InformationCircleIcon, QuestionMarkCircleIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const SecurityQuestionsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile/security" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Security Questions</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-3 mb-3">
            <QuestionMarkCircleIcon className="w-8 h-8 text-primary"/>
            <div>
                <h2 className="text-lg font-semibold">Current Security Questions Status</h2>
                <p className={`text-md ${user?.securitySettings?.hasSecurityQuestionsSet ? 'text-green-600' : 'text-orange-600'}`}>
                    {user?.securitySettings?.hasSecurityQuestionsSet ? 'Configured' : 'Not Set Up'}
                </p>
            </div>
        </div>
        <p className="text-sm text-neutral-600 mb-4">
          Security questions provide an additional way to verify your identity if you forget your password or need to recover your account.
        </p>
        <Button 
            variant="primary" 
            onClick={() => navigate('/profile/security/questions-setup')}
            className="w-full"
        >
            {user?.securitySettings?.hasSecurityQuestionsSet ? 'Manage Security Questions' : 'Set Up Security Questions'}
        </Button>

      </div>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Choose questions and answers that are memorable for you but difficult for others to guess. Never share your answers.</span>
      </div>
    </div>
  );
};

export default SecurityQuestionsScreen;
