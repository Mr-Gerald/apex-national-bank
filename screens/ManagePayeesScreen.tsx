import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { Payee } from '../types';
import { InformationCircleIcon, PlusCircleIcon, PencilSquareIcon, TrashIcon, UsersIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';

const ManagePayeesScreen: React.FC = () => {
  const { user, addPayee, updatePayee, deletePayee } = useAuth();
  const payees = user?.payees || [];
  
  const [showModal, setShowModal] = useState(false);
  const [editingPayee, setEditingPayee] = useState<Payee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSavePayee = async (payeeData: Payee | Omit<Payee, 'id'>) => {
    if ('id' in payeeData) { // Editing existing payee
      await updatePayee(payeeData as Payee);
    } else { // Adding new payee
      await addPayee(payeeData);
    }
    setShowModal(false);
    setEditingPayee(null);
  };

  const handleDeletePayee = (payeeId: string) => {
    if (window.confirm("Are you sure you want to delete this payee?")) {
      deletePayee(payeeId);
    }
  };

  const filteredPayees = payees.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.accountNumber && p.accountNumber.includes(searchTerm))
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/pay-bills" className="text-primary hover:text-accent-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-2xl font-semibold text-neutral-800">Manage Payees</h1>
        </div>
        <Button size="sm" variant="primary" leftIcon={<PlusCircleIcon className="w-4 h-4" />} onClick={() => { setEditingPayee(null); setShowModal(true); }}>
          Add Payee
        </Button>
      </div>

       <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search payees..."
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-primary focus:border-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search payees"
        />
        <UsersIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>

      {filteredPayees.length > 0 ? (
        <ul className="bg-white rounded-lg shadow-md divide-y divide-neutral-100">
          {filteredPayees.map(payee => (
            <li key={payee.id} className="p-3 hover:bg-neutral-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-neutral-800">{payee.name}</p>
                  <p className="text-sm text-neutral-500">
                    {payee.accountNumber ? `Acc: ${payee.accountNumber} - ` : ''} 
                    Category: {payee.category}
                  </p>
                </div>
                <div className="space-x-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingPayee(payee); setShowModal(true); }} aria-label="Edit payee">
                    <PencilSquareIcon className="w-4 h-4"/>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePayee(payee.id)} className="text-red-500 hover:text-red-700" aria-label="Delete payee">
                    <TrashIcon className="w-4 h-4"/>
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-neutral-500 bg-white p-4 rounded-lg shadow-md text-center">No payees found matching your search. Try adding one!</p>
      )}

      {showModal && (
        <PayeeModal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setEditingPayee(null); }}
          onSave={handleSavePayee}
          existingPayee={editingPayee}
        />
      )}
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Keep your payee list accurate for quick and easy bill payments.</span>
      </div>
    </div>
  );
};

interface PayeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payee: Payee | Omit<Payee, 'id'>) => void;
    existingPayee?: Payee | null;
}

const PayeeModal: React.FC<PayeeModalProps> = ({ isOpen, onClose, onSave, existingPayee }) => {
    const [name, setName] = useState(existingPayee?.name || '');
    const [accountNumber, setAccountNumber] = useState(existingPayee?.accountNumber || '');
    const [zipCode, setZipCode] = useState(existingPayee?.zipCode || '');
    const [category, setCategory] = useState(existingPayee?.category || 'Utilities');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payeeData = {
            name,
            accountNumber,
            zipCode,
            category,
        };
        if (existingPayee) {
             onSave({ ...payeeData, id: existingPayee.id });
        } else {
             onSave(payeeData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">{existingPayee ? 'Edit' : 'Add New'} Payee</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="payeeName" className="block text-sm font-medium">Payee Name</label>
                        <input type="text" id="payeeName" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-md" required/>
                    </div>
                    <div>
                        <label htmlFor="payeeAccountNumber" className="block text-sm font-medium">Account Number (Optional)</label>
                        <input type="text" id="payeeAccountNumber" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full p-2 border rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="payeeZipCode" className="block text-sm font-medium">Zip Code (Optional, for some billers)</label>
                        <input type="text" id="payeeZipCode" value={zipCode} onChange={e => setZipCode(e.target.value)} className="w-full p-2 border rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="payeeCategory" className="block text-sm font-medium">Category</label>
                        <select id="payeeCategory" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                            <option value="Utilities">Utilities</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Mortgage">Mortgage/Rent</option>
                            <option value="Loan">Loan</option>
                            <option value="Telecom">Telecom (Phone/Internet)</option>
                            <option value="Insurance">Insurance</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary">Save Payee</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManagePayeesScreen;