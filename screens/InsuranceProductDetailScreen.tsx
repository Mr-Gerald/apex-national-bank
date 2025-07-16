
import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { ShieldCheckIcon, InformationCircleIcon } from '../constants';
import { InsuranceProductType } from '../types';

// Mock data - in a real app, this might come from a service or context
const mockInsuranceProducts: InsuranceProductType[] = [
    { id: 'ins_life', name: 'Life Insurance', description: 'Protect your loved ones financial future with term or whole life policies.', provider: 'Apex Financial Solutions LLC', details: 'Life insurance provides a tax-free death benefit to your beneficiaries. Options include Term Life for temporary coverage (e.g., 10, 20, 30 years) and Whole Life for lifelong protection with cash value accumulation. Consider your income replacement needs, debts, and future expenses like college tuition when choosing coverage.' },
    { id: 'ins_home', name: 'Homeowners Insurance', description: 'Comprehensive coverage for your home and belongings against unforeseen events.', provider: 'Partner Insurers', details: 'Covers damage to your home structure (dwelling), personal property (contents), liability for injuries to others on your property, and additional living expenses (ALE) if your home is temporarily uninhabitable due to a covered loss. Standard perils include fire, windstorm, theft, and vandalism. Flood and earthquake coverage typically require separate policies.' },
    { id: 'ins_auto', name: 'Auto Insurance', description: 'Reliable coverage for your vehicle, with various options to suit your needs.', provider: 'Partner Insurers', details: 'Includes liability coverage (bodily injury and property damage), collision (damage to your car from an accident), comprehensive (theft, vandalism, fire, natural disasters), uninsured/underinsured motorist, and medical payments/PIP (Personal Injury Protection). Discounts available for safe drivers, multi-policy, and good students.' },
    { id: 'ins_renters', name: 'Renters Insurance', description: 'Affordable protection for your personal property if you rent your home.', provider: 'Apex Financial Solutions LLC', details: 'Covers your personal belongings (furniture, electronics, clothing) against theft, fire, and other covered perils, whether they are in your rental unit or temporarily away from home. Also includes liability protection if someone is injured in your rental or you damage their property. Very affordable for significant peace of mind.' },
];


const InsuranceProductDetailScreen: React.FC = () => {
  const { insuranceProductId } = useParams<{ insuranceProductId: string }>();
  const navigate = useNavigate();
  
  const product = mockInsuranceProducts.find(p => p.id === insuranceProductId);

  if (!product) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Insurance product not found.</p>
        <Button onClick={() => navigate('/products/insurance')} className="mt-4">Back to Insurance</Button>
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
            <ShieldCheckIcon className="w-8 h-8 text-primary"/>
            <h2 className="text-xl font-semibold text-neutral-700">{product.name}</h2>
        </div>
        <p className="text-sm text-neutral-600">{product.description}</p>
        {product.provider && (
            <p className="text-sm text-neutral-500"><span className="font-medium">Provider:</span> {product.provider}</p>
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
            onClick={() => alert(`Requesting a quote for ${product.name}. An agent will contact you.`)}
        >
            Get a Quote
        </Button>
      </div>
      
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Insurance products are offered through Apex Financial Solutions LLC, an affiliate of Apex National Bank, or through carefully selected third-party insurance providers. Insurance products are: Not FDIC Insured • Not Bank Guaranteed • May Lose Value. Terms, conditions, and exclusions apply.</span>
      </div>
    </div>
  );
};

export default InsuranceProductDetailScreen;
