
import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { CameraIcon, InformationCircleIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext'; 
import StepIndicator from '../components/StepIndicator';

const VerifyIdentityUploadIdScreen: React.FC = () => {
  const { saveVerificationIdImages } = useAuth(); 
  const navigate = useNavigate();
  const { accountId, transactionId } = useParams<{ accountId: string; transactionId: string }>();

  const [frontIdImage, setFrontIdImage] = useState<string | null>(null);
  const [backIdImage, setBackIdImage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const frontIdFileRef = useRef<HTMLInputElement>(null);
  const backIdFileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setMessage(null); 
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!frontIdImage || !backIdImage) {
      setMessage("Please provide images for both front and back of your ID.");
      setIsLoading(false);
      return;
    }

    try {
      await saveVerificationIdImages(frontIdImage, backIdImage, false); // false indicates it's not profile verification
      // Simulate processing delay
      setTimeout(() => {
        setIsLoading(false);
        navigate(`/verify-identity/link-card/${accountId}/${transactionId}`);
      }, 1200);
    } catch (error: any) {
        setMessage(error.message || "Failed to process ID images. Please try again.");
        setIsLoading(false);
    }
  };

  const ImagePlaceholder: React.FC<{image: string | null, onUploadClick: () => void, onTakePhotoClick: () => void, label: string, fileRef: React.RefObject<HTMLInputElement>, onChange: (event: React.ChangeEvent<HTMLInputElement>) => void}> = 
    ({ image, onUploadClick, onTakePhotoClick, label, fileRef, onChange }) => (
    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-neutral-700 mb-1">{label}:</p>
        <div 
          className="w-full h-40 bg-neutral-50/50 rounded-md flex items-center justify-center text-neutral-500 relative overflow-hidden"
          role="button"
          tabIndex={-1} 
        >
          <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileRef} onChange={onChange} aria-label={`File input for ${label}`} />
          {image ? (
            <img src={image} alt={`${label} preview`} className="max-h-full max-w-full object-contain rounded-md p-1" />
          ) : (
            <div className="text-center">
                <CameraIcon className="w-10 h-10 mb-1 mx-auto" />
                <span className="text-xs">Provide {label.toLowerCase()} image</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
            <Button type="button" variant="outline" size="sm" onClick={onTakePhotoClick} className="w-full">Take Photo</Button>
            <Button type="button" variant="outline" size="sm" onClick={onUploadClick} className="w-full">Upload File</Button>
        </div>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      <StepIndicator currentStep={2} totalSteps={4} flowType="funds" />
      <h1 className="text-2xl font-semibold text-neutral-800">Verify Your Identity (Step 2/4)</h1>
      <p className="text-sm text-neutral-600">Please provide clear images of the front and back of your government-issued ID (e.g., Driver's License, State ID).</p>

      {message && <div className="p-3 rounded-md bg-red-100 text-red-700">{message}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="space-y-4">
            <ImagePlaceholder 
                image={frontIdImage} 
                onUploadClick={() => frontIdFileRef.current?.click()}
                onTakePhotoClick={() => frontIdFileRef.current?.click()} 
                label="Front of ID"
                fileRef={frontIdFileRef}
                onChange={(e) => handleImageUpload(e, setFrontIdImage)}
            />
            <ImagePlaceholder 
                image={backIdImage} 
                onUploadClick={() => backIdFileRef.current?.click()}
                onTakePhotoClick={() => backIdFileRef.current?.click()} 
                label="Back of ID"
                fileRef={backIdFileRef}
                onChange={(e) => handleImageUpload(e, setBackIdImage)}
            />
        </div>
        <p className="text-xs text-neutral-500">
            Ensure the images are well-lit, not blurry, and all four corners of the ID are visible.
        </p>
        
        <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={() => navigate(`/verify-identity/${accountId}/${transactionId}`)} disabled={isLoading}>
                Back
            </Button>
            <Button type="submit" variant="primary" className="flex-grow" isLoading={isLoading} disabled={isLoading || !frontIdImage || !backIdImage}>
                {isLoading ? 'Processing...' : 'Continue to Link Card'}
            </Button>
        </div>
      </form>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Securely upload your ID for verification. Your documents are handled with care.</span>
      </div>
    </div>
  );
};

export default VerifyIdentityUploadIdScreen;
