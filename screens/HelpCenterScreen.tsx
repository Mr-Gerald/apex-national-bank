
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, ChevronRightIcon, InformationCircleIcon } from '../constants';

const faqs = [
  { id: '1', q: 'How do I reset my password?', a: 'You can reset your password by clicking the "Forgot Password" link on the login screen. You will receive an email with instructions to securely reset your password.' },
  { id: '2', q: 'What are the transfer limits?', a: 'Daily transfer limits depend on your account type and your transaction history. Please refer to our "Fees and Limits" schedule, available in the legal documents section, or contact customer support for specific details related to your account.' },
  { id: '3', q: 'How do I set up mobile check deposit?', a: 'Ensure your app has camera permissions. Navigate to "Deposit" > "Mobile Check Deposit", enter the check amount, and follow the on-screen prompts to take clear photos of the front and back of your endorsed check. Remember to endorse it "For Mobile Deposit at Apex National Bank Only".' },
  { id: '4', q: 'Is my money FDIC insured?', a: `Yes, Apex National Bank is a member of the FDIC. Deposits are insured up to the maximum amount allowed by law per depositor, for each account ownership category. IRA accounts and investment products may have different insurance rules or are not FDIC insured.`},
  { id: '5', q: 'How do I report a lost or stolen card?', a: 'Please contact us immediately at 1-800-APEX-SAFE (1-800-273-9723) to report your card. You can also use the "Card Services" section in the app (if available for your card type) to temporarily lock your card or report it lost/stolen and request a replacement.'}
];

const HelpCenterScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const filteredFAQs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Help Center</h1>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search help topics..."
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-primary focus:border-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search help topics"
        />
        <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md divide-y divide-neutral-100">
        <h2 className="text-lg font-semibold text-neutral-700 mb-2 p-1">Frequently Asked Questions</h2>
        {filteredFAQs.length > 0 ? filteredFAQs.map(faq => (
          <div key={faq.id} className="py-2">
            <button onClick={() => toggleFAQ(faq.id)} className="w-full flex justify-between items-center text-left hover:bg-neutral-50 p-1 rounded-md">
              <span className="font-medium text-neutral-800">{faq.q}</span>
              <ChevronRightIcon className={`w-5 h-5 text-neutral-400 transition-transform ${openFAQ === faq.id ? 'rotate-90' : ''}`} />
            </button>
            {openFAQ === faq.id && (
              <p className="text-sm text-neutral-600 mt-1 p-1 pl-2 border-l-2 border-primary bg-neutral-50 rounded-r-md">{faq.a}</p>
            )}
          </div>
        )) : (
            <p className="text-sm text-neutral-500 p-2">No FAQs match your search term.</p>
        )}
      </div>
      
      <div className="text-center mt-4">
        <p className="text-sm text-neutral-600 mb-1">Can't find what you're looking for?</p>
        <Link to="/profile/contact">
            <button className="text-primary hover:underline font-medium">Contact Support</button>
        </Link>
      </div>
       <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>The answers provided are general and may not apply to all situations. For account-specific inquiries, please contact customer support.</span>
      </div>
    </div>
  );
};

export default HelpCenterScreen;