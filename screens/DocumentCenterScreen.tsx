
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Document } from '../types';
import { formatDate } from '../utils/formatters'; // formatCurrency not needed here
import { InformationCircleIcon, DocumentTextIcon, MagnifyingGlassIcon } from '../constants';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext'; // To check user

// Mock documents - in a real app, this would be fetched per user
const mockDocumentsForAlex: Document[] = [
  { id: 'stmt1', name: 'Checking Statement - Sep 2024', type: 'Statement', date: '2024-10-01', accountId: 'alexPrimaryChecking', documentUrl: '#' },
  { id: 'stmt2', name: 'Savings Statement - Sep 2024', type: 'Statement', date: '2024-10-01', accountId: 'alexSavings', documentUrl: '#' },
  { id: 'tax1', name: 'Tax Document 1099-INT 2023', type: 'Tax Document', date: '2024-01-15', accountId: 'alexSavings', documentUrl: '#' },
  { id: 'notice1', name: 'Important Account Update', type: 'Notice', date: '2024-09-15', documentUrl: '#' },
  { id: 'stmt3', name: 'Checking Statement - Aug 2024', type: 'Statement', date: '2024-09-01', accountId: 'alexPrimaryChecking', documentUrl: '#' },
  { id: 'stmt4', name: 'Business Checking Statement - Sep 2024', type: 'Statement', date: '2024-10-01', accountId: 'alexBusinessChecking', documentUrl: '#' },
  { id: 'tax2', name: 'Tax Document 1099-DIV 2023', type: 'Tax Document', date: '2024-01-20', accountId: 'alexIRA', documentUrl: '#' },
];


const DocumentCenterScreen: React.FC = () => {
  const { user } = useAuth();
  // For now, documents are not dynamically managed per user, only shown for Alex.
  // Real app: fetch user.documents from context/service.
  const documentsToDisplay = user?.username === 'Alex' ? mockDocumentsForAlex : [];

  const [filterType, setFilterType] = useState<'all' | 'Statement' | 'Tax Document' | 'Notice'>('all');
  const [filterYear, setFilterYear] = useState<string>('all'); // 'all' or year as string
  const [searchTerm, setSearchTerm] = useState('');

  const availableYears = useMemo(() => {
    const years = new Set(documentsToDisplay.map(doc => new Date(doc.date).getFullYear().toString()));
    return ['all', ...Array.from(years).sort((a,b) => parseInt(b) - parseInt(a))];
  }, [documentsToDisplay]);

  const filteredDocuments = useMemo(() => {
    return documentsToDisplay
      .filter(doc => filterType === 'all' || doc.type === filterType)
      .filter(doc => filterYear === 'all' || new Date(doc.date).getFullYear().toString() === filterYear)
      .filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [documentsToDisplay, filterType, filterYear, searchTerm]);

  const handleDownloadMock = (docName: string) => {
    alert(`Preparing download for "${docName}".`);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/profile" className="text-primary hover:text-accent-700" aria-label="Back to Profile">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Document Center</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
        <h2 className="text-lg font-semibold text-neutral-700 mb-2">Filter Documents</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search documents by name..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="filterType" className="block text-xs font-medium text-neutral-600 mb-1">Document Type</label>
            <select id="filterType" value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="w-full p-2 border border-neutral-300 rounded-md bg-white">
              <option value="all">All Types</option>
              <option value="Statement">Statements</option>
              <option value="Tax Document">Tax Documents</option>
              <option value="Notice">Notices</option>
            </select>
          </div>
          <div>
            <label htmlFor="filterYear" className="block text-xs font-medium text-neutral-600 mb-1">Year</label>
            <select id="filterYear" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full p-2 border border-neutral-300 rounded-md bg-white">
              {availableYears.map(year => (
                <option key={year} value={year}>{year === 'all' ? 'All Years' : year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>


      {filteredDocuments.length > 0 ? (
        <ul className="bg-white rounded-lg shadow-md divide-y divide-neutral-100">
          {filteredDocuments.map(doc => (
            <li key={doc.id} className="p-3 hover:bg-neutral-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="w-6 h-6 text-primary flex-shrink-0"/>
                  <div>
                    <p className="font-medium text-neutral-800">{doc.name}</p>
                    <p className="text-sm text-neutral-500">
                      {doc.type} - Dated: {formatDate(doc.date)}
                      {doc.accountId && <span className="ml-1 text-xs">(Acct: ...{doc.accountId.slice(-4)})</span>}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDownloadMock(doc.name)} aria-label={`Download ${doc.name}`}>
                    <ArrowDownTrayIcon className="w-5 h-5"/>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900">No Documents Found</h3>
          <p className="mt-1 text-sm text-neutral-500">
            {user?.username === 'Alex' ? "No documents match your current filters." : "No documents are currently available for your account."}
          </p>
        </div>
      )}
      
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Access your account statements, tax forms, and important notices. Download documents for your records.</span>
      </div>
    </div>
  );
};

// Re-define if not globally available or imported from constants.tsx
const ArrowDownTrayIcon: React.FC<{className?: string}> = ({ className }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);


export default DocumentCenterScreen;