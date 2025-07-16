

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Account, Transaction, LinkedExternalAccount, LinkedCard, SavingsGoal, AppNotification, VerificationSubmissionData, UserProfileData } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import Button from '../../components/Button';
import { ChevronLeftIcon, CheckCircleIcon, XCircleIcon } from '../../constants';
import { useAuth } from '../../contexts/AuthContext'; 

const AdminUserDetailScreen: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { adminMarkUserVerified, fetchAllUsersForAdmin } = useAuth(); // Use context function
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        if (!userId) {
            setUser(null);
            setIsLoading(false);
            return;
        }
        try {
            const users = await fetchAllUsersForAdmin(); // Use context's admin function
            const foundUser = users.find(u => u.id === userId);
            setUser(foundUser || null);
            if (!foundUser) {
                setError("User not found.");
            }
        } catch (e: any) {
            console.error("Failed to fetch user details:", e);
            setError("Could not load user details. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [userId, fetchAllUsersForAdmin]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleVerificationAction = async (approve: boolean) => {
        if (!user || !user.verificationSubmission) return;
        setActionLoading(true);
        setMessage(null);
        const isProfileFlow = user.verificationSubmission.status === 'pending_profile_review' || 
                              (user.verificationSubmission.relatedTransactionPath === undefined && approve); // Heuristic for profile flow if no specific transaction tied

        try {
            await adminMarkUserVerified(user.id, isProfileFlow, approve);
            await fetchUser(); // Re-fetch user data to reflect changes made by the context/service
            setMessage(`User verification status ${approve ? 'approved' : 'rejected'}. Notification has been sent.`);
        } catch (error: any) {
            setMessage(`Error updating verification: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    };
    
    const DetailSection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
            <h3 className="text-lg font-semibold text-neutral-700 border-b pb-2 mb-3">{title}</h3>
            <div className="space-y-2 text-sm">{children}</div>
        </div>
    );

    const DataRow: React.FC<{label: string, value?: string | number | boolean | null}> = ({label, value}) => {
        const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value ?? 'N/A');

        return (
            <div className="flex justify-between items-start py-1">
                <span className="text-neutral-600 flex-shrink-0 pr-4">{label}:</span>
                <span className="text-neutral-800 font-medium text-right break-all">{String(displayValue)}</span>
            </div>
        );
    };

    if (isLoading) return <p className="text-center p-4">Loading user details...</p>;
    if (error) return <p className="text-center p-4 text-red-500">{error}</p>;
    if (!user) return <p className="text-center p-4 text-red-500">User not found.</p>;

    const verificationCardId = user.verificationSubmission?.linkedWithdrawalCardId;
    const verificationCard = verificationCardId ? user.linkedCards.find(c => c.id === verificationCardId) : null;


    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} leftIcon={<ChevronLeftIcon className="w-5 h-5"/>}>Back to Users</Button>
            </div>
            <h1 className="text-3xl font-semibold text-neutral-800">User Details: {user.fullName}</h1>
             {message && <p className={`p-2 rounded text-sm ${message.includes("Error") ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</p>}

            <DetailSection title="Profile Information">
                <DataRow label="User ID" value={user.id} />
                <DataRow label="Username" value={user.username} />
                <DataRow label="Email" value={user.email} />
                <DataRow label="Phone" value={user.phoneNumber} />
                <DataRow label="Address" value={`${user.addressLine1}, ${user.city}, ${user.state} ${user.zipCode}`} />
                <DataRow label="Date of Birth" value={user.dateOfBirth ? formatDate(user.dateOfBirth) : 'N/A'} />
                <DataRow label="SSN" value={user.ssn} />
                <DataRow label="Joined" value={formatDate(user.createdAt)} />
                <DataRow label="Identity Verified (Overall)" value={user.isIdentityVerified} />
            </DetailSection>

            <DetailSection title="Identity Verification Submission">
                {user.verificationSubmission ? (
                    <>
                        <DataRow label="Submission Status" value={user.verificationSubmission.status} />
                        <DataRow label="Submitted At" value={formatDate(user.verificationSubmission.submissionTimestamp)} />
                        {user.verificationSubmission.relatedTransactionPath && <DataRow label="Related Tx Path" value={user.verificationSubmission.relatedTransactionPath}/>}
                        {user.verificationSubmission.personalDataSnapshot && (
                             <div className="mt-2 pt-2 border-t">
                                <h4 className="font-medium text-neutral-600">Personal Data Snapshot:</h4>
                                <DataRow label="Full Name" value={user.verificationSubmission.personalDataSnapshot.fullName} />
                                <DataRow label="Email" value={user.verificationSubmission.personalDataSnapshot.email} />
                                <DataRow label="DOB" value={user.verificationSubmission.personalDataSnapshot.dateOfBirth ? formatDate(user.verificationSubmission.personalDataSnapshot.dateOfBirth) : 'N/A'} />
                                <DataRow label="SSN (Snapshot)" value={user.verificationSubmission.personalDataSnapshot.ssn} />
                            </div>
                        )}
                        {user.verificationSubmission.idFrontDataUrl && (
                            <div className="mt-2">
                                <p className="font-medium text-neutral-600">ID Front:</p>
                                <img src={user.verificationSubmission.idFrontDataUrl} alt="ID Front" className="max-w-xs max-h-48 border rounded my-1"/>
                            </div>
                        )}
                        {user.verificationSubmission.idBackDataUrl && (
                            <div className="mt-2">
                                <p className="font-medium text-neutral-600">ID Back:</p>
                                <img src={user.verificationSubmission.idBackDataUrl} alt="ID Back" className="max-w-xs max-h-48 border rounded my-1"/>
                            </div>
                        )}
                        {verificationCard && (
                            <DataRow 
                                label="Card for Verification" 
                                value={verificationCard.cardNumber_full || "Full Number Data Missing for Verification Card"} 
                            />
                        )}
                        <DataRow label="Card PIN (Stored)" value={user.verificationSubmission.cardPin} />
                        
                        {(user.verificationSubmission.status === 'pending_review' || user.verificationSubmission.status === 'pending_profile_review') && (
                            <div className="mt-4 flex space-x-2">
                                <Button onClick={() => handleVerificationAction(true)} isLoading={actionLoading} disabled={actionLoading} variant="primary" size="sm" leftIcon={<CheckCircleIcon className="w-4 h-4"/>}>Approve Verification</Button>
                                <Button onClick={() => handleVerificationAction(false)} isLoading={actionLoading} disabled={actionLoading} variant="secondary" size="sm" leftIcon={<XCircleIcon className="w-4 h-4"/>}>Reject Verification</Button>
                            </div>
                        )}
                    </>
                ) : <p>No verification data submitted.</p>}
            </DetailSection>

            <DetailSection title="Bank Accounts">
                {user.accounts && user.accounts.length > 0 ? user.accounts.map(acc => (
                    <div key={acc.id} className="p-2 border-b last:border-b-0">
                        <p className="font-medium">{acc.name} ({acc.type}) - {formatCurrency(acc.balance)}</p>
                        <DataRow label="Account No" value={acc.accountNumber} />
                        <p className="text-xs text-neutral-500 mt-1">Transactions ({acc.transactions.length}):</p>
                        <ul className="list-disc list-inside pl-4 max-h-32 overflow-y-auto text-xs">
                            {acc.transactions.slice(0,5).map(tx =>(
                                <li key={tx.id}>{tx.description} ({formatCurrency(tx.amount)}) - Status: {tx.status}</li>
                            ))}
                            {acc.transactions.length > 5 && <li>...and {acc.transactions.length - 5} more.</li>}
                        </ul>
                    </div>
                )) : <p>No bank accounts.</p>}
            </DetailSection>

            <DetailSection title="Linked External Accounts">
                {user.linkedExternalAccounts && user.linkedExternalAccounts.length > 0 ? user.linkedExternalAccounts.map(acc => (
                     <div key={acc.id} className="p-2 border-b last:border-b-0">
                        <p className="font-medium">{acc.bankName} {acc.accountType}</p>
                        <DataRow label="Last 4" value={`...${acc.last4}`}/>
                        <DataRow label="Account Holder" value={acc.accountHolderName}/>
                        <DataRow label="Verified" value={acc.isVerified}/>
                        <DataRow label="Full Account No" value={acc.accountNumber_full} />
                    </div>
                )) : <p>No external bank accounts linked.</p>}
            </DetailSection>

            <DetailSection title="Linked Cards">
                {user.linkedCards && user.linkedCards.length > 0 ? user.linkedCards.map(card => (
                    <div key={card.id} className="p-2 border-b last:border-b-0">
                        <p className="font-medium">{card.bankName ? `${card.bankName} ` : ''}{card.cardType} Card {card.isDefault ? '(Default)' : ''}</p>
                        <DataRow 
                            label="Card Number" 
                            value={card.cardNumber_full || "Full Number Data Missing for this card"}
                        />
                        <DataRow label="Expires" value={card.expiryDate}/>
                        <DataRow label="Card Holder" value={card.cardHolderName}/>
                    </div>
                )) : <p>No external cards linked.</p>}
            </DetailSection>
        </div>
    );
};

export default AdminUserDetailScreen;