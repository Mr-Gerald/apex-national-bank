
import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { CurrencyDollarIcon, InformationCircleIcon } from '../constants';
import { LoanProductType } from '../types';

// Mock data - in a real app, this might come from a service or context
const mockLoanProducts: LoanProductType[] = [
    { id: 'loan_personal', name: 'Personal Loan', description: 'Flexible funds for debt consolidation, home improvements, or major purchases.', interestRateRange: '7.99% - 19.99% APR', details: 'Our personal loans offer fixed rates and predictable monthly payments. Borrow from $5,000 to $50,000 with terms ranging from 2 to 5 years. No prepayment penalties. Approval subject to creditworthiness. A typical loan of $10,000 for 36 months at 9.99% APR would have a monthly payment of approximately $322.62.' },
    { id: 'loan_auto', name: 'Auto Loan', description: 'Finance your new or used car with competitive rates.', interestRateRange: '5.49% - 10.99% APR', details: 'Get pre-approved for your next vehicle purchase. We offer financing for new and used cars, trucks, and SUVs. Flexible terms available up to 72 months. Check our current rates online. We also offer refinancing options.' },
    { id: 'loan_home_equity', name: 'Home Equity Line of Credit', description: 'Leverage your home equity for large expenses or projects.', interestRateRange: 'Prime + Margin', details: 'A HELOC allows you to borrow against the equity in your home as needed, up to your approved credit limit. Ideal for home renovations, education expenses, or other significant costs. Variable interest rate applies, tied to the Prime Rate. Draw period typically 10 years, repayment period up to 20 years.' },
];


const LoanProductDetailScreen: React.FC = () => {
  const { loanProductId } = useParams<{ loanProductId: string }>();
  const navigate = useNavigate();
  
  const product = mockLoanProducts.find(p => p.id === loanProductId);

  if (!product) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Loan product not found.</p>
        <Button onClick={() => navigate('/products/loans')} className="mt-4">Back to Loans</Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <button onClick={() => navigate(-1)} className="text-primary hover:text-accent-700 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-neutral-800">{product.name} Details</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-3">
        <div className="flex items-center space-x-3 mb-2">
            <CurrencyDollarIcon className="w-8 h-8 text-primary"/>
            <h2 className="text-xl font-semibold text-neutral-700">{product.name}</h2>
        </div>
        <p className="text-sm text-neutral-600">{product.description}</p>
        {product.interestRateRange && (
            <p className="text-sm text-neutral-500"><span className="font-medium">Typical Rate Range:</span> {product.interestRateRange}</p>
        )}
        {product.details && (
            <div className="mt-2 border-t pt-2">
                <h3 className="text-md font-semibold text-neutral-700">More Information:</h3>
                <p className="text-sm text-neutral-600 whitespace-pre-wrap">{product.details}</p>
            </div>
        )}
        <Button 
            variant="primary" 
            className="w-full mt-4" 
            onClick={() => navigate('/products/loans')} // Or a specific application form link
        >
            Inquire About This Loan
        </Button>
      </div>
      
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Interest rates and terms are subject to change and depend on your creditworthiness and other factors. All loans subject to approval.</span>
      </div>
    </div>
  );
};

export default LoanProductDetailScreen;
