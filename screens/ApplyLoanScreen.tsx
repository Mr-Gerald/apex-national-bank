
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { CurrencyDollarIcon, InformationCircleIcon } from '../constants';
import { LoanProductType } from '../types';

const mockLoanProducts: LoanProductType[] = [
    { id: 'loan_personal', name: 'Personal Loan', description: 'Flexible funds for debt consolidation, home improvements, or major purchases.', interestRateRange: '7.99% - 19.99% APR', details: 'Our personal loans offer fixed rates and predictable monthly payments. Borrow from $5,000 to $50,000 with terms ranging from 2 to 5 years. No prepayment penalties. Approval subject to creditworthiness.' },
    { id: 'loan_auto', name: 'Auto Loan', description: 'Finance your new or used car with competitive rates.', interestRateRange: '5.49% - 10.99% APR', details: 'Get pre-approved for your next vehicle purchase. We offer financing for new and used cars, trucks, and SUVs. Flexible terms available. Check our current rates online.' },
    { id: 'loan_home_equity', name: 'Home Equity Line of Credit', description: 'Leverage your home equity for large expenses or projects.', interestRateRange: 'Prime + Margin', details: 'A HELOC allows you to borrow against the equity in your home as needed. Ideal for home renovations, education expenses, or other significant costs. Variable interest rate applies.' },
];

const ApplyLoanScreen: React.FC = () => {
  const navigate = useNavigate();
  const [loanType, setLoanType] = useState('');
  const [desiredAmount, setDesiredAmount] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    if (!loanType || !desiredAmount) {
        setMessage("Please select a loan type and enter a desired amount.");
        setIsLoading(false);
        return;
    }
    setTimeout(() => {
      setIsLoading(false);
      setMessage(`Your inquiry for a ${loanType} of $${desiredAmount} has been submitted. An Apex National Bank loan specialist will contact you within 1-2 business days to discuss your options.`);
      setLoanType('');
      setDesiredAmount('');
      setLoanPurpose('');
    }, 1500);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/dashboard" className="text-primary hover:text-accent-700" aria-label="Back to Dashboard">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Apply for a Loan</h1>
      </div>

      {message && <div className={`p-3 rounded-md ${message.includes("successfully") || message.includes("submitted") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-lg font-semibold text-neutral-700">Our Loan Products</h2>
        <div className="space-y-3">
            {mockLoanProducts.map(product => (
                <div key={product.id} className="p-3 border border-neutral-200 rounded-md">
                    <h3 className="font-medium text-primary">{product.name}</h3>
                    <p className="text-xs text-neutral-600 mt-0.5">{product.description}</p>
                    {product.interestRateRange && <p className="text-xs text-neutral-500 mt-0.5">Rates from: {product.interestRateRange}</p>}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-1 text-xs" 
                        onClick={() => navigate(`/products/loans/${product.id}`)}
                    >
                        Learn More
                    </Button>
                </div>
            ))}
        </div>
      </div>

      <form onSubmit={handleSubmitInquiry} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-lg font-semibold text-neutral-700">Quick Loan Inquiry</h2>
        <div>
          <label htmlFor="loanType" className="block text-sm font-medium text-neutral-700 mb-1">Loan Type</label>
          <select id="loanType" value={loanType} onChange={e => setLoanType(e.target.value)} className="w-full p-2 border border-neutral-300 rounded-md bg-white" required>
            <option value="" disabled>Select loan type...</option>
            {mockLoanProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="desiredAmount" className="block text-sm font-medium text-neutral-700 mb-1">Desired Amount ($)</label>
          <input type="number" id="desiredAmount" value={desiredAmount} onChange={e => setDesiredAmount(e.target.value)} placeholder="e.g., 10000" min="500" step="100" className="w-full p-2 border border-neutral-300 rounded-md" required/>
        </div>
        <div>
          <label htmlFor="loanPurpose" className="block text-sm font-medium text-neutral-700 mb-1">Purpose of Loan (Optional)</label>
          <input type="text" id="loanPurpose" value={loanPurpose} onChange={e => setLoanPurpose(e.target.value)} placeholder="e.g., Debt Consolidation, Car Purchase" className="w-full p-2 border border-neutral-300 rounded-md"/>
        </div>
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading} leftIcon={<CurrencyDollarIcon className="w-5 h-5"/>}>
          {isLoading ? 'Submitting...' : 'Submit Inquiry'}
        </Button>
      </form>
      
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Loan applications are subject to credit approval, verification, and underwriting. Terms, conditions, and interest rates vary based on your creditworthiness and other factors.</span>
      </div>
    </div>
  );
};

export default ApplyLoanScreen;
