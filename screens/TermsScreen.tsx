
import React from 'react';
import { Link } from 'react-router-dom';
import { BANK_NAME } from '../constants';

const TermsScreen: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Terms of Service</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4 text-sm text-neutral-700">
        <p className="text-xs text-neutral-500">Effective Date: October 26, 2023</p>
        
        <h2 className="text-lg font-semibold text-neutral-800 pt-2">1. Acceptance of Terms</h2>
        <p>By accessing or using the {BANK_NAME} mobile application ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.</p>

        <h2 className="text-lg font-semibold text-neutral-800 pt-2">2. Accounts</h2>
        <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

        <h2 className="text-lg font-semibold text-neutral-800 pt-2">3. Intellectual Property</h2>
        <p>The Service and its original content, features, and functionality are and will remain the exclusive property of {BANK_NAME} and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of {BANK_NAME}.</p>
        
        <h2 className="text-lg font-semibold text-neutral-800 pt-2">4. Limitation of Liability</h2>
        <p>In no event shall {BANK_NAME}, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

        <h2 className="text-lg font-semibold text-neutral-800 pt-2">5. Governing Law</h2>
        <p>These Terms shall be governed and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</p>

        <h2 className="text-lg font-semibold text-neutral-800 pt-2">6. Changes</h2>
        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
        
        <p className="pt-4">Please review these Terms regularly. Continued use of the Service after any such changes shall constitute your consent to such changes.</p>
      </div>
    </div>
  );
};

export default TermsScreen;