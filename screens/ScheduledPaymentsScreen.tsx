import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { ScheduledPayment } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { InformationCircleIcon, PencilSquareIcon, TrashIcon, CalendarDaysIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';


const ScheduledPaymentsScreen: React.FC = () => {
  const { user, cancelScheduledPayment } = useAuth();
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'processed'>('scheduled');

  const payments = user?.scheduledPayments || [];

  const handleCancelPayment = (paymentId: string) => {
    if (window.confirm("Are you sure you want to cancel this scheduled payment?")) {
      cancelScheduledPayment(paymentId);
    }
  };
  
  const handleEditPayment = (paymentId: string) => {
    alert(`Navigate to edit payment ID ${paymentId}. This would typically open a modal or navigate to an edit screen.`);
  };

  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true;
    return p.status.toLowerCase() === filter;
  }).sort((a,b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
         <div className="flex items-center space-x-3">
            <Link to="/pay-bills" className="text-primary hover:text-accent-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            </Link>
            <h1 className="text-2xl font-semibold text-neutral-800">Scheduled Payments</h1>
        </div>
        <Link to="/pay-bills/new">
            <Button size="sm" variant="primary" leftIcon={<CalendarDaysIcon className="w-4 h-4"/>}>Schedule New</Button>
        </Link>
      </div>

      <div className="mb-4">
        <label htmlFor="paymentFilter" className="block text-sm font-medium text-neutral-700 mb-1">Filter Payments</label>
        <select 
            id="paymentFilter" 
            value={filter} 
            onChange={e => setFilter(e.target.value as any)}
            className="w-full p-2 border border-neutral-300 rounded-md bg-white"
        >
            <option value="scheduled">Scheduled</option>
            <option value="processed">Processed</option>
            <option value="all">All Payments</option>
        </select>
      </div>

      {filteredPayments.length > 0 ? (
        <ul className="bg-white rounded-lg shadow-md divide-y divide-neutral-100">
          {filteredPayments.map(payment => (
            <li key={payment.id} className="p-3 hover:bg-neutral-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-neutral-800">{payment.payeeName}</p>
                  <p className="text-sm text-neutral-600">Amount: {formatCurrency(payment.amount)}</p>
                  <p className="text-sm text-neutral-500">Date: {formatDate(payment.paymentDate)} ({payment.frequency})</p>
                  <p className={`text-xs font-semibold ${payment.status === 'Scheduled' ? 'text-orange-500' : payment.status === 'Processed' ? 'text-green-600' : 'text-red-600'}`}>
                    Status: {payment.status}
                  </p>
                </div>
                {payment.status === 'Scheduled' && (
                    <div className="space-x-1 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => handleEditPayment(payment.id)} aria-label="Edit payment">
                        <PencilSquareIcon className="w-4 h-4"/>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleCancelPayment(payment.id)} className="text-red-500 hover:text-red-700" aria-label="Cancel payment">
                        <TrashIcon className="w-4 h-4"/>
                        </Button>
                    </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-neutral-500 bg-white p-4 rounded-lg shadow-md text-center">
            No {filter !== 'all' ? filter : ''} payments found.
        </p>
      )}
      
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Review and manage your upcoming and past bill payments. Ensure funds are available by the payment date.</span>
      </div>
    </div>
  );
};

export default ScheduledPaymentsScreen;