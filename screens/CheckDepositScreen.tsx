import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { CameraIcon, InformationCircleIcon, ArrowUpTrayIcon } from '../constants';

const CheckDepositScreen: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [frontCheckImage, setFrontCheckImage] = useState<string | null>(null);
  const [backCheckImage, setBackCheckImage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const frontCheckRef = useRef<HTMLInputElement>(null);
  const backCheckRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!amount || parseFloat(amount) <= 0) {
      setMessage("Please enter a valid amount.");
      setIsLoading(false);
      return;
    }
    if (!frontCheckImage || !backCheckImage) {
      setMessage("Please upload images for both front and back of the check.");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
      setMessage(`Check for $${parseFloat(amount).toFixed(2)} submitted for deposit. Funds will be available based on our funds availability policy.`);
      setAmount('');
      setFrontCheckImage(null);
      setBackCheckImage(null);
      if(frontCheckRef.current) frontCheckRef.current.value = "";
      if(backCheckRef.current) backCheckRef.current.value = "";
    }, 2000);
  };

  const ImagePlaceholder: React.FC<{image: string | null, onUploadClick: () => void, label: string, currentRef: React.RefObject<HTMLInputElement>, onChange: (event: React.ChangeEvent<HTMLInputElement>) => void}> = 
    ({ image, onUploadClick, label, currentRef, onChange }) => (
    <div 
      className="w-full h-40 border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center text-neutral-500 cursor-pointer hover:border-primary"
      onClick={onUploadClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onUploadClick()}
    >
      <input type="file" accept="image/*" className="hidden" ref={currentRef} onChange={onChange} />
      {image ? (
        <img src={image} alt={label} className="max-h-full max-w-full object-contain rounded-md" />
      ) : (
        <>
          <CameraIcon className="w-10 h-10 mb-2" />
          <span>{label}</span>
          <span className="text-xs">(Tap to capture/upload)</span>
        </>
      )}
    </div>
  );


  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/deposit" className="text-primary hover:text-accent">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Mobile Check Deposit</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${message.includes("submitted") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-1">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            className="w-full p-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>
        
        <div className="space-y-3">
            <ImagePlaceholder 
                image={frontCheckImage} 
                onUploadClick={() => frontCheckRef.current?.click()}
                label="Front of Check"
                currentRef={frontCheckRef}
                onChange={(e) => handleImageUpload(e, setFrontCheckImage)}
            />
            <ImagePlaceholder 
                image={backCheckImage} 
                onUploadClick={() => backCheckRef.current?.click()}
                label="Back of Check"
                currentRef={backCheckRef}
                onChange={(e) => handleImageUpload(e, setBackCheckImage)}
            />
        </div>
        <p className="text-xs text-neutral-500">
            Ensure the check is endorsed "For Mobile Deposit at Apex National Bank Only". Keep the physical check for 14 days after deposit confirmation. Daily deposit limits may apply.
        </p>
        
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading} leftIcon={<ArrowUpTrayIcon className="w-5 h-5"/>}>
          {isLoading ? 'Submitting Deposit...' : 'Deposit Check'}
        </Button>
      </form>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>For best results, place your check on a dark, flat surface in a well-lit area. Ensure all four corners are visible and the image is clear. Image uploads use your device's file system and are illustrative.</span>
      </div>
    </div>
  );
};

export default CheckDepositScreen;