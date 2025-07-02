
import React from 'react';
import { Link } from 'react-router-dom';
import { BANK_NAME } from '../constants';

const PrivacyPolicyScreen: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Privacy Policy</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4 text-sm text-neutral-700">
        <p className="text-xs text-neutral-500">Effective Date: October 26, 2023</p>
        
        <h2 className="text-lg font-semibold text-neutral-800 pt-2">1. Information We Collect</h2>
        <p>{BANK_NAME} ("us", "we", or "our") operates this mobile application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service. Data you provide, such as profile information and account details, is stored locally in your browser's storage to enable application functionality.</p>
        <p>We collect several different types of information for various purposes to provide and improve our Service to you, such as: Personal Data (e.g., email address, name, phone number, address you provide), and Usage Data (how the Service is accessed and used within your session).</p>

        <h2 className="text-lg font-semibold text-neutral-800 pt-2">2. Use of Data</h2>
        <p>{BANK_NAME} uses the collected data for various purposes: To provide and maintain the Service; To allow you to participate in interactive features of our Service when you choose to do so; To provide customer care and support simulations; To provide analysis or valuable information so that we can improve the Service; To monitor the usage of the Service.</p>
        
        <h2 className="text-lg font-semibold text-neutral-800 pt-2">3. Data Security</h2>
        <p>The security of your data is important to us. Data stored locally is subject to your browser's security mechanisms. We strive to use acceptable means to protect your Personal Data within the application's scope. No data is transmitted to external servers in this version of the application.</p>
        
        <h2 className="text-lg font-semibold text-neutral-800 pt-2">4. Children's Privacy</h2>
        <p>Our Service does not address anyone under the age of 13 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your Children has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information.</p>

        <h2 className="text-lg font-semibold text-neutral-800 pt-2">5. Changes to This Privacy Policy</h2>
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
        
        <p className="pt-4">Please review this Privacy Policy regularly.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;