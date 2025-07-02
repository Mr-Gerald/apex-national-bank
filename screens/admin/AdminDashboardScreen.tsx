
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { UsersIcon, ShieldCheckIcon, BanknotesIcon } from '../../constants';
import Button from '../../components/Button'; 

const AdminDashboardScreen: React.FC = () => {
    const { fetchAllUsersForAdmin } = useAuth();
    const [totalUsers, setTotalUsers] = useState(0);
    const [pendingVerifications, setPendingVerifications] = useState(0);
    const [totalAccounts, setTotalAccounts] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                setError(null);
                const users = await fetchAllUsersForAdmin(); // This now excludes admin
                setTotalUsers(users.length);
                
                const pending = users.filter(u => u.verificationSubmission && (u.verificationSubmission.status === 'pending_review' || u.verificationSubmission.status === 'pending_profile_review')).length;
                setPendingVerifications(pending);

                const accountsCount = users.reduce((sum, user) => sum + (user.accounts?.length || 0), 0);
                setTotalAccounts(accountsCount);
            } catch (e: any) {
                console.error("Failed to load admin dashboard stats:", e);
                setError("Could not load dashboard statistics. Please ensure you are logged in as an administrator.");
            }
        };
        loadStats();
    }, [fetchAllUsersForAdmin]);

    const StatCard: React.FC<{title: string, value: string | number, icon: React.ReactNode, to?: string}> = ({ title, value, icon, to}) => {
        const content = (
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-shadow duration-200">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                        {icon}
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500">{title}</p>
                        <p className="text-2xl font-bold text-neutral-800">{value}</p>
                    </div>
                </div>
            </div>
        );
        return to ? <Link to={to}>{content}</Link> : <div>{content}</div>;
    };


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-neutral-800">Admin Dashboard</h1>
            
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Users" value={totalUsers} icon={<UsersIcon className="w-7 h-7"/>} to="/admin/users" />
                <StatCard title="Pending Verifications" value={pendingVerifications} icon={<ShieldCheckIcon className="w-7 h-7"/>} to="/admin/users?filter=pending_verification" />
                <StatCard title="Total Bank Accounts" value={totalAccounts.toLocaleString()} icon={<BanknotesIcon className="w-7 h-7"/>} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-neutral-700 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/admin/users" className="block">
                        <Button variant="outline" className="w-full py-3">Manage Users</Button>
                    </Link>
                    <Link to="/admin/notifications" className="block">
                        <Button variant="outline" className="w-full py-3">Send Notification</Button>
                    </Link>
                </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                         <InformationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                        Remember to handle all user data with extreme care and confidentiality. Ensure actions are compliant with bank policies.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};
const InformationCircleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);
export default AdminDashboardScreen;