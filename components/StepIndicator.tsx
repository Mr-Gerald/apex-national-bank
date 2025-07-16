
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  flowType?: 'funds' | 'profile'; 
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, flowType }) => {
  return (
    <div className="mb-6">
      <p className="text-center text-sm text-neutral-600 mb-2">
        Step {Math.min(currentStep, totalSteps)} of {totalSteps} 
        {currentStep > totalSteps ? " - Complete" : 
          (flowType === 'funds' ? " - Funds Release Verification" : 
          flowType === 'profile' ? " - Profile Enhancement Verification" : "")
        }
      </p>
      <div className="flex items-center justify-between w-full max-w-xs mx-auto">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber; 
          const isActive = currentStep === stepNumber && currentStep <= totalSteps; // Active only if it's the current step within total steps
          
          return (
            <React.Fragment key={stepNumber}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${isActive ? 'bg-primary text-white ring-2 ring-primary ring-offset-1' : ''}
                  ${!isCompleted && !isActive ? 'bg-neutral-200 text-neutral-500' : ''}
                `}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : stepNumber}
              </div>
              {stepNumber < totalSteps && (
                <div className={`flex-1 h-1 mx-1 transition-colors duration-300 ${isCompleted || isActive ? 'bg-primary' : 'bg-neutral-200'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;