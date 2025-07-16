
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { ShieldCheckIcon, InformationCircleIcon } from '../constants'; 
import { InsuranceProductType } from '../types';

const mockInsuranceProducts: InsuranceProductType[] = [
    { id: 'ins_life', name: 'Life Insurance', description: 'Protect your loved ones financial future with term or whole life policies.', provider: 'Apex Financial Solutions LLC', details: 'Life insurance provides a tax-free death benefit to your beneficiaries. Options include Term Life for temporary coverage and Whole Life for lifelong protection with cash value accumulation.' },
    { id: 'ins_home', name: 'Homeowners Insurance', description: 'Comprehensive coverage for your home and belongings against unforeseen events.', provider: 'Partner Insurers', details: 'Covers damage to your home structure, personal property, liability for injuries on your property, and additional living expenses if your home is temporarily uninhabitable.' },
    { id: 'ins_auto', name: 'Auto Insurance', description: 'Reliable coverage for your vehicle, with various options to suit your needs.', provider: 'Partner Insurers', details: 'Includes liability coverage, collision, comprehensive, uninsured/underinsured motorist, and medical payments/PIP. Discounts available for safe drivers and bundling policies.' },
    { id: 'ins_renters', name: 'Renters Insurance', description: 'Affordable protection for your personal property if you rent your home.', provider: 'Apex Financial Solutions LLC', details: 'Covers your personal belongings against theft, fire, and other covered perils. Also includes liability protection. Very affordable for significant peace of mind.' },
];

const InsuranceProductsScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/dashboard" className="text-primary hover:text-accent-700" aria-label="Back to Dashboard"> {/* Changed link to /dashboard as per user's likely intent */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Explore Insurance Options</h1>
      </div>

      <p className="text-sm text-neutral-600">
        Secure your future and protect what matters most. Explore our range of insurance products designed to offer peace of mind.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockInsuranceProducts.map(product => (
          <div key={product.id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
            <div>
                <div className="flex items-center space-x-2 mb-2">
                    <ShieldCheckIcon className="w-6 h-6 text-primary"/>
                    <h3 className="text-lg font-semibold text-neutral-700">{product.name}</h3>
                </div>
                <p className="text-xs text-neutral-600 mb-1">{product.description}</p>
                {product.provider && <p className="text-xs text-neutral-500">Provider: {product.provider}</p>}
            </div>
            <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 w-full sm:w-auto self-start" 
                onClick={() => navigate(`/products/insurance/${product.id}`)}
            >
              Learn More & Get Quote
            </Button>
          </div>
        ))}
      </div>
      
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Insurance products are offered through Apex Financial Solutions LLC, an affiliate of Apex National Bank, or through carefully selected third-party insurance providers. Insurance products are: Not FDIC Insured • Not Bank Guaranteed • May Lose Value.</span>
      </div>
    </div>
  );
};

export default InsuranceProductsScreen;
