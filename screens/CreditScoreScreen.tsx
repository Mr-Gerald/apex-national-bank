
import React from 'react';
import { Link } from 'react-router-dom';
import { InformationCircleIcon } from '../constants'; 
import CircularProgressScore from '../components/CircularProgressScore'; 
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

// Mock data, some will be overridden by dynamic user score
// const mockCreditScore = 815; // This will be dynamic
const scoreProvider = "ApexCredit powered by Experian®"; 
const lastUpdated = "October 25, 2024"; // Mock static date

const scoreFactors = [
  { name: "Payment History", impact: "High", status: "Excellent", tip: "Continue making on-time payments." },
  { name: "Credit Card Use", impact: "High", status: "Good", tip: "Try to keep your credit utilization below 30%." },
  { name: "Credit Age", impact: "Medium", status: "Very Good", tip: "Maintaining older accounts can positively impact this factor." },
  { name: "Total Accounts", impact: "Low", status: "Good", tip: "A healthy mix of credit types can be beneficial." },
  { name: "Hard Inquiries", impact: "Low", status: "Excellent", tip: "You have few recent hard inquiries, which is good." },
];

const CreditScoreScreen: React.FC = () => {
  const { user } = useAuth();

  // Dynamic credit score calculation
  const userCreditScore = user?.username?.toLowerCase() === 'alex' 
    ? 815 
    : (user ? 500 + Math.floor(Math.random() * 50) : 500); // Default to 500-550 for other users

  const getScoreStatusColor = (status: string) => {
    switch (status) {
        case "Excellent":
        case "Very Good":
            return "text-green-600";
        case "Good":
            return "text-yellow-600"; // Changed for better visibility of "Good"
        case "Fair":
             return "text-orange-500";
        default: // Poor
            return "text-red-500";
    }
  };

  // Adjust scoreFactors based on the user's score range for more dynamic display
  const adjustedScoreFactors = scoreFactors.map(factor => {
    if (userCreditScore < 580) { // Poor
        if (factor.name === "Payment History" || factor.name === "Credit Card Use") return {...factor, status: "Needs Improvement", tip: "Focus on improving this area."};
    } else if (userCreditScore < 670) { // Fair
        if (factor.name === "Credit Card Use") return {...factor, status: "Fair", tip: "Work on reducing balances."};
    }
    return factor; // Return original or slightly modified factors for higher scores
  });


  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to={user?.username?.toLowerCase() === 'alex' ? "/dashboard" : "/dashboard"} className="text-primary hover:text-accent-700" aria-label="Back to Dashboard">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Your Credit Score</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <div className="flex justify-center mb-3">
            <CircularProgressScore score={userCreditScore} />
        </div>
        <p className="text-xs text-neutral-500 mt-1">Provided by {scoreProvider}</p>
        <p className="text-xs text-neutral-500">Last updated: {lastUpdated}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-neutral-700 mb-3">Key Score Factors</h2>
        <ul className="divide-y divide-neutral-100">
          {adjustedScoreFactors.map(factor => (
            <li key={factor.name} className="py-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-neutral-800">{factor.name}</p>
                  <p className="text-sm text-neutral-500">Impact: {factor.impact} - Status: <span className={getScoreStatusColor(factor.status)}>{factor.status}</span></p>
                </div>
              </div>
              <p className="text-xs text-neutral-600 mt-1 pl-1">{factor.tip}</p>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-neutral-700 mb-2">Learn More</h2>
        <ul className="space-y-1 text-sm">
            <li><a href="#" onClick={(e) => {e.preventDefault(); alert("Information: How credit scores are calculated.");}} className="text-primary hover:underline">How is my score calculated?</a></li>
            <li><a href="#" onClick={(e) => {e.preventDefault(); alert("Information: Dispute an error on your report.");}} className="text-primary hover:underline">Dispute an error on your report</a></li>
            <li><a href="#" onClick={(e) => {e.preventDefault(); alert("Information: Tips for improving your score.");}} className="text-primary hover:underline">Tips for improving your score</a></li>
        </ul>
      </div>

      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>This credit score is for illustrative purposes only, based on sample data, and does not reflect your actual credit standing. It is not a real credit report.</span>
      </div>
    </div>
  );
};

export default CreditScoreScreen;
