

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/Button';
import { MagnifyingGlassIcon, ChevronRightIcon } from '../../constants';

const AdminUserListScreen: React.FC = () => {
    const { fetchAllUsersForAdmin } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchParams] = useSearchParams();
    const filterParam = searchParams.get('filter');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const loadUsers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedUsers = await fetchAllUsersForAdmin(); // Excludes admin
                
                let displayUsers = fetchedUsers;
                if (filterParam === 'pending_verification') {
                    displayUsers = fetchedUsers.filter(u => 
                        u.verificationSubmission && 
                        (u.verificationSubmission.status === 'pending_review' || u.verificationSubmission.status === 'pending_profile_review')
                    );
                }
                setUsers(displayUsers);
            } catch (e: any) {
                console.error("Failed to load users:", e);
                setError("Could not load user data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        loadUsers();
    }, [filterParam, fetchAllUsersForAdmin]);

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <p>Loading users...</p>;
    }

    if (error) {
        return <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>;
    }


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-neutral-800">User Management</h1>
            
            <div className="bg-white p-4 rounded-lg shadow">
                 <div className="relative">
                    <input
                        type="text"
                        placeholder="Search users by name, email, or username..."
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:ring-primary focus:border-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search users"
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
            </div>

            {filteredUsers.length > 0 ? (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Username</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Verified</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Verification Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Joined</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-neutral-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{user.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isIdentityVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.isIdentityVerified ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{user.verificationSubmission?.status || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(user.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/admin/users/${user.id}`} className="text-primary hover:text-accent-700 inline-flex items-center">
                                            View Details <ChevronRightIcon className="w-4 h-4 ml-1"/>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-neutral-500 py-8">No users found matching your criteria.</p>
            )}
        </div>
    );
};

export default AdminUserListScreen;