
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpTrayIcon, UsersIcon, CalendarDaysIcon, WifiIcon, ChevronRightIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const PayBillsScreen: React.FC = () => {
  const { user } = useAuth();

  // Mock data for upcoming bills (used for Alex)
  const alexUpcomingPayments = [
    { id: '1', payeeName: 'City Electric Co.', amount: 75.50, dueDate: 'October 28, 2024' },
    { id: '2', payeeName: 'Apex Mortgage', amount: 1250.00, dueDate: 'November 01, 2024' },
    { id: '3', payeeName: 'Gigabit Internet', amount: 60.00, dueDate: 'November 05, 2024' },
  ];

  const upcomingPayments = user?.username?.toLowerCase() === 'alex' ? alexUpcomingPayments : [];


  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/dashboard" className="text-primary hover:text-accent-700" aria-label="Back to Dashboard">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Pay Bills</h1>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BillActionLink
          to="/pay-bills/new"
          icon={<ArrowUpTrayIcon className="w-8 h-8 text-primary" />}
          title="Pay a New Bill"
          description="Send a one-time or recurring payment."
        />
        <BillActionLink
          to="/pay-bills/payees"
          icon={<UsersIcon className="w-8 h-8 text-primary" />}
          title="Manage Payees"
          description="Add, edit, or remove billers."
        />
        <BillActionLink
          to="/pay-bills/scheduled"
          icon={<CalendarDaysIcon className="w-8 h-8 text-primary" />}
          title="Scheduled Payments"
          description="View or manage upcoming payments."
        />
        <BillActionLink
          to="#" // Placeholder for eBills, can be its own screen
          icon={<WifiIcon className="w-8 h-8 text-primary" />}
          title="eBills (Mock)"
          description="Receive and pay electronic bills."
          onClick={() => alert("eBills feature coming soon!")}
        />
      </div>

      {/* Upcoming Payments Summary */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-700 mb-3">Upcoming Payments</h2>
        {upcomingPayments.length > 0 ? (
          <ul className="bg-white rounded-lg shadow-md divide-y divide-neutral-200">
            {upcomingPayments.slice(0,3).map(payment => ( // Show first 3
              <li key={payment.id} className="p-3 hover:bg-neutral-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-neutral-800">{payment.payeeName}</p>
                    <p className="text-sm text-neutral-500">Due: {payment.dueDate}</p>
                  </div>
                  <p className="font-semibold text-red-600">${payment.amount.toFixed(2)}</p>
                </div>
              </li>
            ))}
             {upcomingPayments.length > 3 && (
                <li className="p-3 text-center">
                    <Link to="/pay-bills/scheduled" className="text-sm text-primary hover:underline font-medium">
                        View All Scheduled Payments
                    </Link>
                </li>
            )}
          </ul>
        ) : (
          <p className="text-neutral-500 bg-white p-4 rounded-lg shadow-md">No upcoming payments scheduled.</p>
        )}
      </div>
      
       <p className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200">
        Manage all your bill payments in one place. Ensure your payee information is up to date for smooth transactions.
      </p>

    </div>
  );
};

interface BillActionLinkProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

const BillActionLink: React.FC<BillActionLinkProps> = ({ to, icon, title, description, onClick }) => {
  const content = (
    <div className="flex items-start space-x-3">
        {icon}
        <div>
          <h3 className="text-md font-semibold text-neutral-800">{title}</h3>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
         <ChevronRightIcon className="w-5 h-5 text-neutral-400 ml-auto self-center" />
      </div>
  );
  
  if (onClick) {
    return (
        <button onClick={onClick} className="block w-full text-left bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            {content}
        </button>
    );
  }

  return (
    <Link to={to} className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      {content}
    </Link>
  );
};

export default PayBillsScreen;
