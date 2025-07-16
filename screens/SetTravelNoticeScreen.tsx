
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { useAccounts } from '../contexts/AccountContext';
import { InformationCircleIcon, GlobeAltIcon, CalendarDaysIcon } from '../constants';
import { TravelNotice, Account } from '../types';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const SetTravelNoticeScreen: React.FC = () => {
  const { accounts } = useAccounts();
  const { user, addTravelNotice } = useAuth(); // Get user and addTravelNotice from AuthContext

  const [destinations, setDestinations] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Pre-select all checking/savings accounts by default
  useEffect(() => {
    const defaultSelected = accounts
      .filter(acc => acc.type === 'Primary Checking' || acc.type === 'High-Yield Savings' || acc.type === 'Business Checking')
      .map(acc => acc.id);
    setSelectedAccountIds(defaultSelected);
  }, [accounts]);

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccountIds(prev =>
      prev.includes(accountId) ? prev.filter(id => id !== accountId) : [...prev, accountId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!destinations || !startDate || !endDate || selectedAccountIds.length === 0) {
      setMessage("Please fill all required fields: destinations, start/end dates, and select at least one account.");
      setIsLoading(false);
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        setMessage("End date cannot be before start date.");
        setIsLoading(false);
        return;
    }

    const noticeData: Omit<TravelNotice, 'id'> = { 
        destinations, 
        startDate, 
        endDate, 
        notes: notes || undefined, 
        accountIds: selectedAccountIds 
    };
    
    try {
      await addTravelNotice(noticeData);
      setMessage(`Travel notice for ${destinations} from ${startDate} to ${endDate} has been set successfully.`);
      // Optionally reset form or navigate away
      // setDestinations(''); setStartDate(''); setEndDate(''); setNotes('');
    } catch (error: any) {
      setMessage(error.message || "Failed to set travel notice.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/profile" className="text-primary hover:text-accent-700" aria-label="Back to Profile">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Set Travel Notice</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${message.includes("Successfully") || message.includes("successfully") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="destinations" className="block text-sm font-medium text-neutral-700 mb-1">Destinations</label>
          <input
            type="text"
            id="destinations"
            value={destinations}
            onChange={(e) => setDestinations(e.target.value)}
            placeholder="e.g., Paris, France; Tokyo, Japan"
            className="w-full p-2 border border-neutral-300 rounded-md"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700 mb-1">Start Date</label>
            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border border-neutral-300 rounded-md" required />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-neutral-700 mb-1">End Date</label>
            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 border border-neutral-300 rounded-md" required />
          </div>
        </div>

        <div>
            <h3 className="text-sm font-medium text-neutral-700 mb-1">Select Accounts for Notice</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto border p-2 rounded-md">
                {accounts.map(acc => (
                    <div key={acc.id} className="flex items-center">
                        <input 
                            type="checkbox" 
                            id={`acc-${acc.id}`} 
                            checked={selectedAccountIds.includes(acc.id)} 
                            onChange={() => handleAccountToggle(acc.id)}
                            className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                        />
                        <label htmlFor={`acc-${acc.id}`} className="ml-2 text-sm text-neutral-600">
                            {acc.name} (...{acc.accountNumber.slice(-4)})
                        </label>
                    </div>
                ))}
            </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">Additional Notes (Optional)</label>
          <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="e.g., Contact phone number while traveling" className="w-full p-2 border border-neutral-300 rounded-md" />
        </div>
        
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading} leftIcon={<GlobeAltIcon className="w-5 h-5"/>}>
          {isLoading ? 'Setting Notice...' : 'Set Travel Notice'}
        </Button>
      </form>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Informing us of your travel plans helps prevent your card from being incorrectly flagged for suspicious activity. Your travel notices are saved to your profile.</span>
      </div>
    </div>
  );
};

export default SetTravelNoticeScreen;