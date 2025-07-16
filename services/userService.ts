


import { User, UserProfileData, Account, AccountType, Transaction, TransactionType, LinkedExternalAccount, LinkedCard, SavingsGoal, AppNotification, VerificationSubmissionData, UserNotificationPreferences, TravelNotice, SecuritySettings, SecurityQuestionAnswer, LoginAttempt, DeviceInfo, TransactionStatus, PREDEFINED_SECURITY_QUESTIONS, VerificationSubmissionStatus, Payee, ScheduledPayment, ApexCard, WireTransferDetails } from '../types';
import * as api from './api';
import { BANK_NAME } from '../constants';
import { 
    generateInitialAccountsForNewUser,
    recalculateBalancesForAccount,
    generateNewId as generateAccountServiceId, 
    generateRandomAccountNumber,
    addTransactionToUserAccountList as serviceAddTransaction
} from './accountService';
import { formatCurrency, formatDate } from '../utils/formatters'; 
import { alexUserTemplate, adminUserTemplate } from '../data/user.data';

// --- Internal DB Log for data/db.json ---
let _internalDbLog: any[] = [];

// Initialize with empty log. In a real scenario, this might load existing db.json.
export const _initializeInternalDbLog = async (existingLog?: any[]) => {
    if (existingLog && Array.isArray(existingLog)) {
        _internalDbLog = [...existingLog];
    } else {
         _internalDbLog = await api.fetchDbLog();
    }
};
_initializeInternalDbLog();


const _logSensitiveData = async (category: string, data: object) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        category,
        data
    };
    _internalDbLog.push(logEntry);
    // For debugging in browser console:
    console.log("Logged via API:", JSON.stringify(logEntry, null, 2));

    await api.saveDbLog(_internalDbLog);
};

// --- User Data Management ---

const getUsersFromStorage = async (): Promise<User[]> => {
    return await api.fetchAllUsers();
};

const saveUsersToStorage = async (users: User[]): Promise<void> => {
    await api.saveAllUsers(users);
};

// Functions to create a fresh user object from templates
const createAlexTemplate = (): User => {
    // The data is now imported from the centralized user.data.ts file
    return JSON.parse(JSON.stringify(alexUserTemplate)); // Return a deep copy to prevent mutation of the template
};

const createAdminTemplate = (): User => {
    // The data is now imported from the centralized user.data.ts file
    return JSON.parse(JSON.stringify(adminUserTemplate)); // Return a deep copy
};


// This function now correctly seeds the initial users only if they don't exist,
// ensuring that any runtime changes (like new transactions) are preserved across refreshes.
const createInitialUsers = async (): Promise<void> => {
    let users = await getUsersFromStorage();
    let madeChanges = false;

    // --- Alex User Logic ---
    const alexExists = users.some(u => u.id === 'userAlex123');
    if (!alexExists) {
        console.log("Alex user not found, creating from template.");
        users.push(createAlexTemplate());
        madeChanges = true;
    }

    // --- Admin User Logic ---
    const adminExists = users.some(u => u.id === 'adminUser999');
    if (!adminExists) {
        console.log("Admin user not found, creating from template.");
        users.push(createAdminTemplate());
        madeChanges = true;
    }
    
    // This part can remain to ensure data structure consistency for other users
    users = users.map(user => {
        if (user.id !== 'userAlex123' && user.id !== 'adminUser999') {
            const defaults = {
                notificationPreferences: {
                    transactions: true, lowBalance: true, securityAlerts: true,
                    promotions: false, appUpdates: true, lowBalanceThreshold: 100,
                },
                securitySettings: {
                    is2FAEnabled: false, hasSecurityQuestionsSet: false, isBiometricEnabled: false,
                },
                accounts: [],
                linkedExternalAccounts: [],
                linkedCards: [],
                savingsGoals: [],
                notifications: [],
                travelNotices: [],
                loginHistory: [],
                recognizedDevices: [],
                payees: [],
                scheduledPayments: [],
                apexCards: [],
            };

            for (const key in defaults) {
                if (!user.hasOwnProperty(key) || (user as any)[key] === undefined) {
                    (user as any)[key] = defaults[key as keyof typeof defaults];
                }
            }
        }
        return user;
    });

    if (madeChanges) {
        await saveUsersToStorage(users);
        console.log("Initial users have been seeded to localStorage.");
    }
};


// Call it on script load to ensure data consistency from the start
createInitialUsers();


export const getAllUsers = async (): Promise<User[]> => {
    const users = await getUsersFromStorage();
    return users.filter(u => !u.isAdmin); // Exclude admin from general user list
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
    const users = await getUsersFromStorage();
    return users.find(u => u.id === userId);
};

export const updateUserById = async (userId: string, updatedData: Partial<User>): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found for update by ID.");

    users[userIndex] = { ...users[userIndex], ...updatedData };
    await saveUsersToStorage(users);
    return users[userIndex];
};


// --- Authentication ---
export const loginUser = async (username_input: string, password_input: string, ipAddress: string, deviceAgent: string): Promise<User> => {
    const users = await getUsersFromStorage();
    const user = users.find(u => u.username.toLowerCase() === username_input.toLowerCase());

    if (!user) {
        await _logSensitiveData("LOGIN_ATTEMPT_FAIL_USER_NOT_FOUND", { username: username_input, ipAddress, deviceAgent, reason: "User not found" });
        throw new Error("User not found.");
    }

    if (user.hashedPassword !== password_input) {
        if(!user.isAdmin) {
            const failedLoginAttempt: LoginAttempt = {
                id: generateAccountServiceId(), timestamp: new Date().toISOString(), ipAddress, status: "Failed - Incorrect Password", deviceInfo: deviceAgent,
            };
            user.loginHistory = [failedLoginAttempt, ...(user.loginHistory || [])].slice(0,20);
            await saveUsersToStorage(users);
        }
        await _logSensitiveData("LOGIN_ATTEMPT_FAIL_PASSWORD", { username: username_input, ipAddress, deviceAgent, reason: "Incorrect password" });
        throw new Error("Invalid username or password.");
    }
    
    if(!user.isAdmin) {
        const successfulLoginAttempt: LoginAttempt = {
            id: generateAccountServiceId(), timestamp: new Date().toISOString(), ipAddress, status: "Success", deviceInfo: deviceAgent,
        };
        user.loginHistory = [successfulLoginAttempt, ...(user.loginHistory || [])].slice(0,20);

        const existingDeviceIndex = user.recognizedDevices?.findIndex(d => d.userAgent === deviceAgent && d.ipAddress.split('.').slice(0,3).join('.') === ipAddress.split('.').slice(0,3).join('.'));
        if (existingDeviceIndex !== undefined && existingDeviceIndex > -1 && user.recognizedDevices) {
            user.recognizedDevices[existingDeviceIndex].lastLogin = new Date().toISOString();
            user.recognizedDevices[existingDeviceIndex].ipAddress = ipAddress;
        } else if (!user.recognizedDevices?.some(d=> d.name.includes("Device") && d.userAgent === deviceAgent ) ) { 
             const newDevice: DeviceInfo = {
                id: generateAccountServiceId(), name: `Device (${deviceAgent.substring(0,20)}...)`, lastLogin: new Date().toISOString(), ipAddress, userAgent: deviceAgent,
            };
            user.recognizedDevices = [newDevice, ...(user.recognizedDevices || [])].slice(0,5);
        }
        await saveUsersToStorage(users);
    }

    await _logSensitiveData("LOGIN_SUCCESS", { userId: user.id, username: user.username, ipAddress, deviceAgent });
    await api.saveCurrentUserId(user.id);
    return { ...user };
};

export const registerUser = async (
    username_input: string, 
    password_plain: string, 
    profileData: Omit<UserProfileData, 'profileImageUrl' | 'ssn' | 'phoneCarrier'>,
    ipAddress: string, 
    deviceAgent: string
): Promise<User> => {
    let users = await getUsersFromStorage();
    if (users.find(u => u.username.toLowerCase() === username_input.toLowerCase())) {
        throw new Error("Username already exists.");
    }
    if (users.find(u => u.email.toLowerCase() === profileData.email.toLowerCase())) {
        throw new Error("Email already registered.");
    }

    const newUserId = `user${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const initialAccounts = generateInitialAccountsForNewUser(newUserId);
    
    const newUser: User = {
        id: newUserId,
        username: username_input,
        hashedPassword: password_plain, 
        ...profileData, 
        profileImageUrl: undefined,
        ssn: undefined,
        phoneCarrier: undefined,
        occupation: undefined,
        maritalStatus: undefined,
        createdAt: new Date().toISOString(),
        accounts: initialAccounts,
        linkedExternalAccounts: [],
        linkedCards: [],
        savingsGoals: [],
        payees: [],
        scheduledPayments: [],
        apexCards: [],
        isIdentityVerified: false,
        verificationSubmission: undefined,
        notifications: [{
            id: generateAccountServiceId(),
            message: `Welcome to ${BANK_NAME}, ${profileData.fullName}! We're glad to have you.`,
            date: new Date().toISOString(),
            read: false,
            type: 'general'
        }],
        notificationPreferences: {
            transactions: true, lowBalance: true, securityAlerts: true,
            promotions: false, appUpdates: true, lowBalanceThreshold: 100,
        },
        travelNotices: [],
        lastPasswordChange: undefined,
        securitySettings: {
            is2FAEnabled: false, hasSecurityQuestionsSet: false, isBiometricEnabled: false,
        },
        securityQuestions: [],
        loginHistory: [{id: generateAccountServiceId(), timestamp: new Date().toISOString(), ipAddress, status: "Success", deviceInfo: deviceAgent}],
        recognizedDevices: [{id: generateAccountServiceId(), name: `Device (${deviceAgent.substring(0,20)}...)`, lastLogin: new Date().toISOString(), ipAddress, userAgent: deviceAgent}],
        isAdmin: false,
    };
    users.push(newUser);
    await saveUsersToStorage(users);
    await _logSensitiveData("USER_REGISTERED", { userId: newUser.id, username: newUser.username, email: newUser.email });
    return { ...newUser };
};

export const logoutUser = async (): Promise<void> => {
    await api.clearCurrentUserId();
    await api.clearAdminSession();
    await _logSensitiveData("USER_LOGOUT", { message: "User logged out" });
};

export const getCurrentLoggedInUser = async (): Promise<User | null> => {
    const userId = await api.fetchCurrentUserId();
    if (!userId) return null;
    const users = await getUsersFromStorage();
    const user = users.find(u => u.id === userId);
    return user ? { ...user } : null; 
};

// --- User Profile & Account Management ---
export const updateUserProfileData = async (userId: string, updatedProfileData: Partial<UserProfileData>): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex] = { ...users[userIndex], ...updatedProfileData };
    await _logSensitiveData("USER_PROFILE_DATA_FOR_VERIFICATION_OR_UPDATE", { userId, updatedFields: Object.keys(updatedProfileData), ...updatedProfileData});
    await saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const addApexAccountToUser = async (userId: string, newAccountData: Pick<Account, 'name' | 'type'> & { initialBalance?: number }): Promise<Account> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    const user = users[userIndex];
    const newAccountId = `${user.id}-${newAccountData.type.toLowerCase().replace(/\s+/g, '')}-${user.accounts.length + 1}`;
    const initialTransactions: Transaction[] = [];
    if (newAccountData.initialBalance && newAccountData.initialBalance > 0) {
        initialTransactions.push({
            id: generateAccountServiceId(),
            date: new Date().toISOString(),
            description: 'Initial Account Funding',
            amount: newAccountData.initialBalance,
            type: TransactionType.CREDIT,
            category: 'Deposit',
            status: 'Completed',
            userFriendlyId: `TXN-FND-${generateAccountServiceId().slice(0,6).toUpperCase()}`,
        });
    }
     initialTransactions.push({ 
        id: generateAccountServiceId(), 
        date: new Date(new Date().getTime() - 1000).toISOString(),
        description: 'Account Opened', 
        amount: 0, 
        type: TransactionType.CREDIT, 
        category: 'System',
        status: 'Completed',
        userFriendlyId: `TXN-SYS-${generateAccountServiceId().slice(0,6).toUpperCase()}`,
    });


    const newApexAccount: Account = {
        id: newAccountId,
        name: newAccountData.name,
        type: newAccountData.type,
        accountNumber: generateRandomAccountNumber(12),
        balance: 0, 
        transactions: initialTransactions,
    };
    recalculateBalancesForAccount(newApexAccount); 

    user.accounts.push(newApexAccount);
    users[userIndex] = user;
    await saveUsersToStorage(users);
    await _logSensitiveData("APEX_ACCOUNT_ADDED", { userId, accountType: newAccountData.type, accountName: newAccountData.name });
    return newApexAccount;
};

export const updateUserAccountData = async (userId: string, updatedAccounts: Account[]): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");
    
    users[userIndex].accounts = updatedAccounts.map(acc => {
        recalculateBalancesForAccount(acc); 
        return acc;
    });
    await saveUsersToStorage(users);
    return { ...users[userIndex] };
};


export const linkExternalBankAccountToUser = async (userId: string, accountData: Omit<LinkedExternalAccount, 'id' | 'isVerified'> & { routingNumber?: string }): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");
    
    const newExternalAccount: LinkedExternalAccount = {
        id: `extAcc-${Date.now()}`,
        ...accountData,
        isVerified: false, 
    };
    users[userIndex].linkedExternalAccounts = [...(users[userIndex].linkedExternalAccounts || []), newExternalAccount];
    await _logSensitiveData("EXTERNAL_BANK_ACCOUNT_LINKED", { userId, bankName: accountData.bankName, last4: accountData.last4, accountNumber_full: accountData.accountNumber_full, routingNumber: accountData.routingNumber });
    await saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const unlinkExternalBankAccountFromUser = async (userId: string, externalAccountId: string): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].linkedExternalAccounts = (users[userIndex].linkedExternalAccounts || []).filter(acc => acc.id !== externalAccountId);
    await saveUsersToStorage(users);
    await _logSensitiveData("EXTERNAL_BANK_ACCOUNT_UNLINKED", { userId, externalAccountId });
    return { ...users[userIndex] };
};

export const linkExternalCardToUser = async (userId: string, cardData: Omit<LinkedCard, 'id'> & { cvv?: string } ): Promise<LinkedCard> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    const newCard: LinkedCard = {
        id: `extCard-${Date.now()}`,
        cardType: cardData.cardType,
        last4: cardData.last4,
        cardNumber_full: cardData.cardNumber_full,
        expiryDate: cardData.expiryDate,
        cardHolderName: cardData.cardHolderName,
        isDefault: cardData.isDefault || false,
        bankName: cardData.bankName,
        isWithdrawalMethod: cardData.isWithdrawalMethod || false,
        cvv: cardData.cvv,
    };
    
    if (newCard.isDefault) { 
        users[userIndex].linkedCards = (users[userIndex].linkedCards || []).map(c => ({...c, isDefault: false}));
    }

    users[userIndex].linkedCards = [...(users[userIndex].linkedCards || []), newCard];
    await _logSensitiveData("EXTERNAL_CARD_LINKED", { userId, cardType: newCard.cardType, last4: newCard.last4, cardNumber_full: newCard.cardNumber_full, expiryDate: newCard.expiryDate, cvv: newCard.cvv, cardHolderName: newCard.cardHolderName, bankName: newCard.bankName, flow: cardData.isWithdrawalMethod ? "identity_verification" : "profile_linking" });
    await saveUsersToStorage(users);
    return newCard; 
};

export const updateExternalCardInUserList = async (userId: string, updatedCard: LinkedCard): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    let cardFound = false;
    users[userIndex].linkedCards = (users[userIndex].linkedCards || []).map(card => {
        if (updatedCard.isDefault && card.id !== updatedCard.id) {
            card.isDefault = false;
        }
        if (card.id === updatedCard.id) {
            cardFound = true;
            return updatedCard;
        }
        return card;
    });

    if (!cardFound) throw new Error("Card to update not found.");
    
    await saveUsersToStorage(users);
    await _logSensitiveData("EXTERNAL_CARD_UPDATED", { userId, cardId: updatedCard.id });
    return { ...users[userIndex] };
};


export const unlinkExternalCardFromUser = async (userId: string, cardId: string): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].linkedCards = (users[userIndex].linkedCards || []).filter(c => c.id !== cardId);
    await saveUsersToStorage(users);
    await _logSensitiveData("EXTERNAL_CARD_UNLINKED", { userId, cardId });
    return { ...users[userIndex] };
};

export const addSavingsGoalToUser = async (userId: string, goalData: Omit<SavingsGoal, 'id'>): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");
    
    const newGoal: SavingsGoal = {
        id: `goal-${Date.now()}`,
        ...goalData,
    };
    users[userIndex].savingsGoals = [...(users[userIndex].savingsGoals || []), newGoal];
    await saveUsersToStorage(users);
    await _logSensitiveData("SAVINGS_GOAL_ADDED", { userId, goalName: goalData.name });
    return { ...users[userIndex] };
};

export const updateSavingsGoalForUser = async (userId: string, updatedGoal: SavingsGoal): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].savingsGoals = (users[userIndex].savingsGoals || []).map(g => g.id === updatedGoal.id ? updatedGoal : g);
    await saveUsersToStorage(users);
    await _logSensitiveData("SAVINGS_GOAL_UPDATED", { userId, goalId: updatedGoal.id });
    return { ...users[userIndex] };
};

export const deleteSavingsGoalFromUser = async (userId: string, goalId: string): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].savingsGoals = (users[userIndex].savingsGoals || []).filter(g => g.id !== goalId);
    await saveUsersToStorage(users);
    await _logSensitiveData("SAVINGS_GOAL_DELETED", { userId, goalId });
    return { ...users[userIndex] };
};

export const markUserAsIdentityVerified = async (userId: string, isProfileVerification: boolean, approve: boolean): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found for verification update.");
    
    const userToUpdate = users[userIndex];
    if (!userToUpdate.verificationSubmission) {
        throw new Error("No verification submission found for this user to approve or reject.");
    }

    const wasAlreadyApproved = userToUpdate.verificationSubmission.status === 'approved';
    const submission = userToUpdate.verificationSubmission;

    if (approve) {
        // --- APPROVAL LOGIC ---
        userToUpdate.isIdentityVerified = true;
        submission.status = 'approved';

        if (submission.pinVerifiedTimestamp && !wasAlreadyApproved) {
            const cardUsedForVerification = userToUpdate.linkedCards.find(c => c.id === submission.linkedWithdrawalCardId);
            await _logSensitiveData("PIN_VERIFIED_LOG_AT_APPROVAL", {
                userId,
                cardId: submission.linkedWithdrawalCardId,
                timestamp: submission.pinVerifiedTimestamp,
                cardDetails: cardUsedForVerification ? { type: cardUsedForVerification.cardType, last4: cardUsedForVerification.last4, bank: cardUsedForVerification.bankName } : "Card details not found"
            });
        }

        let approvalNotifMsg = `Your identity has been successfully verified!`;
        let approvalNotifType: AppNotification['type'] = 'verification';
        let linkTo = isProfileVerification ? '/profile' : submission.relatedTransactionPath;

        if (isProfileVerification) {
            approvalNotifMsg += ` Top-tier account features are now available.`;
            approvalNotifType = 'profile_verification';
        } else if (submission.relatedTransactionPath) {
            approvalNotifMsg += ` Any on-hold funds related to this verification will now be processed.`;
            approvalNotifType = 'funds_released';
            
            const pathParts = submission.relatedTransactionPath.split('/');
            const accId = pathParts[pathParts.length - 2];
            const txId = pathParts[pathParts.length - 1];
            const targetAccIndex = userToUpdate.accounts.findIndex(a => a.id === accId);

            if (targetAccIndex > -1) {
                const targetTxIndex = userToUpdate.accounts[targetAccIndex].transactions.findIndex(t => t.id === txId);
                if (targetTxIndex > -1) {
                    userToUpdate.accounts[targetAccIndex].transactions[targetTxIndex].status = 'Completed';
                    userToUpdate.accounts[targetAccIndex].transactions[targetTxIndex].holdReason = undefined;
                    recalculateBalancesForAccount(userToUpdate.accounts[targetAccIndex]);
                }
            }
        }
        
        // Only send notification on the first approval
        if (!wasAlreadyApproved) {
            const approvalNotification: AppNotification = {
                id: generateAccountServiceId(),
                message: approvalNotifMsg,
                date: new Date().toISOString(),
                read: false,
                type: approvalNotifType,
                linkTo: linkTo,
            };
            userToUpdate.notifications = [approvalNotification, ...(userToUpdate.notifications || [])];
        }

        await _logSensitiveData("USER_IDENTITY_APPROVED_BY_ADMIN", { userId, type: isProfileVerification ? 'profile' : 'funds_release' });

    } else {
        // --- REJECTION LOGIC ---
        userToUpdate.isIdentityVerified = false; // Ensure it's false
        submission.status = 'rejected';

        let rejectNotifMsg = "Your identity verification was not successful.";
        let rejectNotifType: AppNotification['type'] = 'identity_rejected';
        let rejectLinkTo: string | undefined = '/profile/help';

        if (isProfileVerification) {
            rejectNotifMsg += " Please review the requirements and contact support if needed.";
            rejectNotifType = 'profile_rejected';
        } else if (submission.relatedTransactionPath) {
            rejectNotifMsg = "Verification attempt rejected. Please re-verify your identity to release these funds.";
            rejectLinkTo = submission.relatedTransactionPath;
            
            const pathParts = submission.relatedTransactionPath.split('/');
            const accId = pathParts[pathParts.length - 2];
            const txId = pathParts[pathParts.length - 1];
            const targetAccIndex = userToUpdate.accounts.findIndex(a => a.id === accId);

            if (targetAccIndex > -1) {
                const targetTxIndex = userToUpdate.accounts[targetAccIndex].transactions.findIndex(t => t.id === txId);
                if (targetTxIndex > -1) {
                    userToUpdate.accounts[targetAccIndex].transactions[targetTxIndex].status = 'On Hold';
                    userToUpdate.accounts[targetAccIndex].transactions[targetTxIndex].holdReason = "Identity verification was not successful. Please click 'Verify Identity' below to try again.";
                }
            }
        }
        
        const rejectionNotification: AppNotification = {
            id: generateAccountServiceId(),
            message: rejectNotifMsg,
            date: new Date().toISOString(),
            read: false,
            type: rejectNotifType,
            linkTo: rejectLinkTo,
        };
        userToUpdate.notifications = [rejectionNotification, ...(userToUpdate.notifications || [])];
        await _logSensitiveData("USER_IDENTITY_REJECTED_BY_ADMIN", { userId, type: isProfileVerification ? 'profile' : 'funds_release' });
    }

    users[userIndex] = userToUpdate;
    await saveUsersToStorage(users);
    return { ...userToUpdate };
};


export const updateTransactionStatusForUser = async (userId: string, accountId: string, transactionId: string, newStatus: TransactionStatus, newHoldReason?: string): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    const user = users[userIndex];
    const accountIndex = user.accounts.findIndex(acc => acc.id === accountId);
    if (accountIndex === -1) throw new Error("Account not found for transaction update.");
    
    const transactionIndex = user.accounts[accountIndex].transactions.findIndex(tx => tx.id === transactionId);
    if (transactionIndex === -1) throw new Error("Transaction not found for status update.");

    user.accounts[accountIndex].transactions[transactionIndex].status = newStatus;
    user.accounts[accountIndex].transactions[transactionIndex].holdReason = newHoldReason || undefined;
    
    recalculateBalancesForAccount(user.accounts[accountIndex]);

    const tx = user.accounts[accountIndex].transactions[transactionIndex];
    const notificationMessage = `Update for transaction ${tx.userFriendlyId}: Status changed to ${newStatus}. ${newHoldReason ? `Reason: ${newHoldReason}` : ''}`;
    const notification: AppNotification = {
        id: generateAccountServiceId(),
        message: notificationMessage,
        date: new Date().toISOString(),
        read: false,
        type: 'transaction_update',
        relatedEntityId: transactionId,
        linkTo: `/transaction-detail/${accountId}/${transactionId}`
    };
    user.notifications = [notification, ...(user.notifications || [])];

    users[userIndex] = user;
    await saveUsersToStorage(users);
    await _logSensitiveData("TRANSACTION_STATUS_UPDATED", { userId, accountId, transactionId, newStatus, newHoldReason });
    return { ...user };
};


export const markNotificationAsRead = async (userId: string, notificationId: string): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].notifications = (users[userIndex].notifications || []).map(n => 
        n.id === notificationId ? { ...n, read: true } : n
    );
    await saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const markAllNotificationsAsRead = async (userId: string): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].notifications = (users[userIndex].notifications || []).map(n => ({ ...n, read: true }));
    await saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const deleteNotificationFromUser = async (userId: string, notificationId: string): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].notifications = (users[userIndex].notifications || []).filter(n => n.id !== notificationId);
    await saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const deleteAllReadNotificationsFromUser = async (userId: string): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].notifications = (users[userIndex].notifications || []).filter(n => !n.read);
    await saveUsersToStorage(users);
    return { ...users[userIndex] };
};


export const saveUserVerificationIdImages = async (userId: string, idFrontDataUrl: string, idBackDataUrl: string, isProfileVerification: boolean): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    const user = users[userIndex];
    // Determine status based on flow type, but it will be overwritten by finalize if this is part of a larger flow.
    // For profile verification, it directly goes to 'pending_profile_review' after all steps.
    // For funds verification, it also eventually goes to 'pending_review' after all steps.
    // This function is an intermediate step.
    
    const currentProfileDataSnapshot: UserProfileData = {
        fullName: user.fullName, email: user.email, phoneNumber: user.phoneNumber,
        addressLine1: user.addressLine1, addressLine2: user.addressLine2, city: user.city,
        state: user.state, zipCode: user.zipCode, dateOfBirth: user.dateOfBirth,
        occupation: user.occupation, maritalStatus: user.maritalStatus, profileImageUrl: user.profileImageUrl,
        ssn: user.ssn, phoneCarrier: user.phoneCarrier,
    };
    
    user.verificationSubmission = {
        ...(user.verificationSubmission || { submissionTimestamp: new Date().toISOString(), status: isProfileVerification ? 'pending_profile_review' : 'verification_required_for_transaction' }), 
        personalDataSnapshot: currentProfileDataSnapshot,
        idFrontDataUrl,
        idBackDataUrl,
        submissionTimestamp: new Date().toISOString(), // Update timestamp for this step
    };
    await _logSensitiveData("ID_IMAGES_SUBMITTED", {userId, flowType: isProfileVerification ? 'profile' : 'funds_release', idFrontDataUrlProvided: !!idFrontDataUrl, idBackDataUrlProvided: !!idBackDataUrl, personalDataSnapshot: currentProfileDataSnapshot});


    users[userIndex] = user;
    await saveUsersToStorage(users);
    return { ...user };
};

export const finalizeVerificationSubmission = async (userId: string, linkedWithdrawalCardId: string, cardPin: string, isProfileVerificationFlow: boolean, accountId?: string, transactionId?: string): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    const user = users[userIndex];
    if (!user.verificationSubmission) {
        throw new Error("ID images must be submitted before PIN verification.");
    }
    
    const submissionStatus: VerificationSubmissionStatus = isProfileVerificationFlow ? 'pending_profile_review' : 'pending_review';
    const cardUsedForVerification = user.linkedCards.find(c => c.id === linkedWithdrawalCardId);

    user.verificationSubmission = {
        ...user.verificationSubmission,
        linkedWithdrawalCardId,
        cardPin, 
        pinVerifiedTimestamp: new Date().toISOString(),
        status: submissionStatus,
    };

    if (!isProfileVerificationFlow && accountId && transactionId) {
        user.verificationSubmission.relatedTransactionPath = `/transaction-detail/${accountId}/${transactionId}`;
        
        // Update the triggering transaction to "Pending" (under review)
        const targetAccIndex = user.accounts.findIndex(a => a.id === accountId);
        if (targetAccIndex > -1) {
            const targetTxIndex = user.accounts[targetAccIndex].transactions.findIndex(t => t.id === transactionId);
            if (targetTxIndex > -1) {
                user.accounts[targetAccIndex].transactions[targetTxIndex].status = 'Pending';
                user.accounts[targetAccIndex].transactions[targetTxIndex].holdReason = "Identity verification submitted and under review. Funds will be released upon approval.";
            }
        }
    }
    await _logSensitiveData("VERIFICATION_FINALIZED_WITH_PIN", {
         userId, 
         flowType: isProfileVerificationFlow ? 'profile' : 'funds_release', 
         linkedCardId: linkedWithdrawalCardId,
         cardPin, 
         submissionTimestamp: user.verificationSubmission.submissionTimestamp,
         personalDataSnapshot: user.verificationSubmission.personalDataSnapshot,
         idFrontDataUrlProvided: !!user.verificationSubmission.idFrontDataUrl,
         idBackDataUrlProvided: !!user.verificationSubmission.idBackDataUrl,
         linkedCardDetails: cardUsedForVerification ? { cardType: cardUsedForVerification.cardType, cardNumber_full: cardUsedForVerification.cardNumber_full, last4: cardUsedForVerification.last4, expiryDate: cardUsedForVerification.expiryDate, cvv: cardUsedForVerification.cvv, cardHolderName: cardUsedForVerification.cardHolderName, bankName: cardUsedForVerification.bankName } : "Card details not found"
        });
    
    const notification: AppNotification = {
        id: generateAccountServiceId(),
        message: `Your identity verification submission has been received and is now under review. You'll be notified of the outcome.`,
        date: new Date().toISOString(),
        read: false,
        type: 'verification',
    };
    user.notifications = [notification, ...(user.notifications || [])];


    users[userIndex] = user;
    await saveUsersToStorage(users);
    return { ...user };
};

export const updateUserNotificationPreferences = async (userId: string, preferences: Partial<UserNotificationPreferences>): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].notificationPreferences = {
        ...(users[userIndex].notificationPreferences || {
            transactions: true, lowBalance: true, securityAlerts: true,
            promotions: false, appUpdates: true, lowBalanceThreshold: 100,
        }),
        ...preferences
    };
    await saveUsersToStorage(users);
    await _logSensitiveData("NOTIFICATION_PREFERENCES_UPDATED", { userId });
    return { ...users[userIndex] };
};

export const addTravelNoticeToUser = async (userId: string, noticeData: Omit<TravelNotice, 'id'>): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    const newNotice: TravelNotice = {
        id: `travel-${Date.now()}`,
        ...noticeData,
    };
    users[userIndex].travelNotices = [...(users[userIndex].travelNotices || []), newNotice];
    await saveUsersToStorage(users);
    await _logSensitiveData("TRAVEL_NOTICE_ADDED", { userId, destinations: noticeData.destinations });
    return { ...users[userIndex] };
};

export const changeUserPassword = async (userId: string, currentPassword_plain: string, newPassword_plain: string): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    if (users[userIndex].hashedPassword !== currentPassword_plain) {
        throw new Error("Current password does not match.");
    }

    users[userIndex].hashedPassword = newPassword_plain; 
    users[userIndex].lastPasswordChange = new Date().toISOString();
    
    const notification: AppNotification = {
        id: generateAccountServiceId(),
        message: "Your account password was successfully changed. If you did not authorize this, please contact support immediately.",
        date: new Date().toISOString(),
        read: false,
        type: 'security'
    };
    users[userIndex].notifications = [notification, ...(users[userIndex].notifications || [])];

    await saveUsersToStorage(users);
    await _logSensitiveData("PASSWORD_CHANGED", { userId });
    return { ...users[userIndex] };
};

export const updateUserSecuritySettings = async (userId: string, settings: Partial<SecuritySettings>, questions?: SecurityQuestionAnswer[]): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");
    
    const user = users[userIndex];
    user.securitySettings = {
        ...(user.securitySettings || { is2FAEnabled: false, hasSecurityQuestionsSet: false, isBiometricEnabled: false }),
        ...settings
    };
    if (questions) {
        user.securityQuestions = questions;
        const questionsToLog = questions.map(q => ({questionId: q.questionId, answerPlain: q.answerHash}));
        await _logSensitiveData("SECURITY_QUESTIONS_SET", {userId, numQuestions: questions.length, questions: questionsToLog });
        user.securitySettings.hasSecurityQuestionsSet = questions.length > 0;
    }
    
    users[userIndex] = user;
    await saveUsersToStorage(users);
    await _logSensitiveData("SECURITY_SETTINGS_UPDATED", { userId, updatedFields: Object.keys(settings) });
    return { ...user };
};

export const clearUserLoginHistory = async (userId: string): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");
    
    users[userIndex].loginHistory = [];
    await saveUsersToStorage(users);
    await _logSensitiveData("LOGIN_HISTORY_CLEARED", { userId });
    return { ...users[userIndex] };
};

export const sendNotificationToUserFromAdmin = async (userId: string, message: string, type: AppNotification['type'], linkTo?: string): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found to send notification.");

    const newNotification: AppNotification = {
        id: generateAccountServiceId(),
        message,
        date: new Date().toISOString(),
        read: false,
        type,
        linkTo,
    };
    users[userIndex].notifications = [newNotification, ...(users[userIndex].notifications || [])];
    await saveUsersToStorage(users);
    await _logSensitiveData("ADMIN_NOTIFICATION_SENT", { adminUserId: "current_admin_placeholder", targetUserId: userId, message });
    return { ...users[userIndex] };
};


export const performInterUserTransfer = async (
    senderId: string,
    recipientUsername: string,
    fromSenderAccountId: string,
    amount: number,
    memo: string
): Promise<{ updatedSender: User, senderDebitTransactionId: string}> => {
    let users = await getUsersFromStorage();
    const senderIndex = users.findIndex(u => u.id === senderId);
    let recipientIndex = users.findIndex(u => u.username.toLowerCase() === recipientUsername.toLowerCase() && !u.isAdmin);

    if (senderIndex === -1) throw new Error("Sender not found.");
    if (recipientIndex === -1) throw new Error("Recipient user not found or is an admin.");

    const sender = users[senderIndex];
    let recipient = users[recipientIndex];

    const senderAccountForDebit = sender.accounts.find(acc => acc.id === fromSenderAccountId);
    if (!senderAccountForDebit) throw new Error("Sender's account not found.");
    if (senderAccountForDebit.balance < amount) throw new Error("Insufficient funds in sender's account.");

    const transferDate = new Date().toISOString();
    const userFriendlyTxId = `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}`;
    
    let recipientTargetAccount = recipient.accounts.find(acc => acc.type === AccountType.CHECKING);
    if (!recipientTargetAccount) { // Create a checking account if none exists for the recipient
        const newRecipientAccountId = `${recipient.id}-checking-${recipient.accounts.length + 1}`;
        recipientTargetAccount = {
            id: newRecipientAccountId,
            name: AccountType.CHECKING, type: AccountType.CHECKING,
            accountNumber: generateRandomAccountNumber(12), balance: 0,
            transactions: [{ 
                id: generateAccountServiceId(), date: new Date(new Date().getTime() - 1000).toISOString(), 
                description: 'Account Opened (System)', amount: 0, type: TransactionType.CREDIT, category: 'System', status: 'Completed',
                userFriendlyId: `TXN-SYS-${generateAccountServiceId().slice(0,6).toUpperCase()}`,
            }],
        };
        recipient.accounts.push(recipientTargetAccount);
    }

    // Determine if this is the first significant transaction for an unverified recipient
    const isFirstSignificantCreditForUnverifiedUser = 
        !recipient.isIdentityVerified &&
        recipient.accounts.every(acc => acc.transactions.filter(tx => tx.type === TransactionType.CREDIT && tx.amount > 0 && tx.description !== 'Account Opened').length === 0) &&
        amount > 10; // Define "significant amount" threshold, e.g., > $10

    let creditTransactionStatus: TransactionStatus = 'Completed';
    let creditTransactionHoldReason: string | undefined = undefined;
    let creditTransactionIdForNotificationPath: string | undefined = undefined;
    
    if (isFirstSignificantCreditForUnverifiedUser) {
        creditTransactionStatus = 'On Hold';
        creditTransactionHoldReason = "Identity verification required to release these funds. Please verify your identity via the transaction details.";
        
        recipient.verificationSubmission = {
            ...(recipient.verificationSubmission || { submissionTimestamp: new Date().toISOString() }),
            status: 'verification_required_for_transaction',
            // relatedTransactionPath will be updated after credit transaction is created
        };
    }


    // Add Debit Transaction to Sender
    const debitTransactionData: Omit<Transaction, 'id' | 'balanceAfter'> = {
        date: transferDate,
        description: `Transfer to ${recipient.fullName}${memo ? ` - ${memo}` : ''}`,
        amount: amount,
        type: TransactionType.DEBIT,
        category: 'Transfer Outgoing',
        status: 'Completed', 
        userFriendlyId: userFriendlyTxId,
        senderAccountInfo: `Your Account: ${senderAccountForDebit.name} (...${senderAccountForDebit.accountNumber.slice(-4)})`,
        recipientAccountInfo: `Recipient: ${recipient.fullName}`,
        memo,
    };
    let senderAccountsCopy = JSON.parse(JSON.stringify(sender.accounts)) as Account[];
    const debitResult = serviceAddTransaction(senderAccountsCopy, fromSenderAccountId, debitTransactionData);
    sender.accounts = debitResult.updatedAccounts;
    users[senderIndex] = sender;


    // Add Credit Transaction to Recipient
    const creditTransactionData: Omit<Transaction, 'id' | 'balanceAfter'> = {
        date: transferDate,
        description: `Transfer from ${sender.fullName}${memo ? ` - ${memo}` : ''}`,
        amount: amount, type: TransactionType.CREDIT, category: 'Transfer Incoming', 
        status: creditTransactionStatus, 
        holdReason: creditTransactionHoldReason, 
        userFriendlyId: userFriendlyTxId,
        senderAccountInfo: `Sender: ${sender.fullName}`,
        recipientAccountInfo: `Your Account: ${recipientTargetAccount.name} (...${recipientTargetAccount.accountNumber.slice(-4)})`,
        memo,
    };
    let recipientAccountsCopy = JSON.parse(JSON.stringify(recipient.accounts)) as Account[];
    const creditResult = serviceAddTransaction(recipientAccountsCopy, recipientTargetAccount.id, creditTransactionData);
    recipient.accounts = creditResult.updatedAccounts;
    creditTransactionIdForNotificationPath = creditResult.newTransactionId;


    if (isFirstSignificantCreditForUnverifiedUser && recipient.verificationSubmission && creditTransactionIdForNotificationPath) {
        const transactionPath = `/transaction-detail/${recipientTargetAccount.id}/${creditTransactionIdForNotificationPath}`;
        recipient.verificationSubmission.relatedTransactionPath = transactionPath;

        const initialVerificationNotif: AppNotification = {
            id: generateAccountServiceId(),
            message: `Incoming transfer of ${formatCurrency(amount)} is on hold pending identity verification. Click to verify.`,
            date: new Date().toISOString(),
            read: false,
            type: 'verification',
            linkTo: transactionPath 
        };
        recipient.notifications = [initialVerificationNotif, ...(recipient.notifications || [])];
    }
    
    if (!isFirstSignificantCreditForUnverifiedUser && creditTransactionIdForNotificationPath) { 
        const recipientNotification: AppNotification = {
            id: generateAccountServiceId(),
            message: `You have received ${formatCurrency(amount)} from ${sender.fullName}. ${memo ? `Memo: ${memo}`: ''}`,
            date: new Date().toISOString(), read: false, type: 'transfer_success',
            linkTo: `/transaction-detail/${recipientTargetAccount.id}/${creditTransactionIdForNotificationPath}`,
        };
        recipient.notifications = [recipientNotification, ...(recipient.notifications || [])];
    }
    users[recipientIndex] = recipient;

    await saveUsersToStorage(users);
    await _logSensitiveData("INTER_USER_TRANSFER", { senderId, recipientId: recipient.id, amount, fromSenderAccountId, toRecipientAccountId: recipientTargetAccount.id, initialHold: isFirstSignificantCreditForUnverifiedUser });
    return { updatedSender: { ...sender }, senderDebitTransactionId: debitResult.newTransactionId };
};

export const initiateAchWireTransfer = async (
    userId: string,
    fromAccountId: string,
    details: WireTransferDetails
): Promise<string> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    const user = users[userIndex];
    const fromAccount = user.accounts.find(a => a.id === fromAccountId);
    if (!fromAccount) throw new Error("Source account not found.");
    if (fromAccount.balance < details.amount) throw new Error("Insufficient funds for this transfer.");

    const transferDate = new Date().toISOString();
    const userFriendlyTxId = `TXN-EXT-${generateAccountServiceId().slice(0, 8).toUpperCase()}`;

    // Create a comprehensive memo from all the details
    let memoLines = [
        `Type: ${details.transferType.toUpperCase()} Transfer`,
        `--Recipient Info--`,
        `Name: ${details.recipientName}`,
        `Address: ${details.recipientAddress}, ${details.recipientCity}, ${details.recipientState} ${details.recipientZip}`,
        `Phone: ${details.recipientPhone}`,
        `--Bank Info--`,
        `Bank Name: ${details.bankName}`,
        `Bank Address: ${details.bankAddress}`,
        `Routing: ${details.routingNumber}`,
        `Account: ${details.accountNumber}`,
        `Account Type: ${details.accountType}`,
    ];

    if (details.transferType === 'international') {
        memoLines.push(`--International Info--`);
        if(details.swiftCode) memoLines.push(`SWIFT/BIC: ${details.swiftCode}`);
        if(details.iban) memoLines.push(`IBAN: ${details.iban}`);
    }

    memoLines.push(`--Transfer Details--`);
    if(details.purposeOfTransfer) memoLines.push(`Purpose: ${details.purposeOfTransfer}`);
    if(details.paymentInstructions) memoLines.push(`Instructions: ${details.paymentInstructions}`);
    if(details.reference) memoLines.push(`Reference/Memo: ${details.reference}`);
    
    const fullMemo = memoLines.join('\n');

    // 1. Create the pending transaction
    const transactionData: Omit<Transaction, 'id' | 'balanceAfter'> = {
        date: transferDate,
        description: `${details.transferType.toUpperCase()} Transfer to ${details.recipientName}`,
        amount: details.amount,
        type: TransactionType.DEBIT,
        category: 'External Transfer',
        status: 'Pending',
        holdReason: `Security Verification Fee: To ensure the security of your large transfer, a verification fee is required. This fee will be refunded to your account after the transfer is completed. Please check your notifications for instructions.`,
        userFriendlyId: userFriendlyTxId,
        recipientAccountInfo: `Recipient: ${details.recipientName}, Bank: ${details.bankName}`,
        memo: fullMemo,
    };

    const { updatedAccounts, newTransactionId } = serviceAddTransaction([...user.accounts], fromAccountId, transactionData);
    user.accounts = updatedAccounts;

    // 2. Create the associated notification with mailto link
    const mailtoSubject = `Security Verification Fee - Transfer to ${details.recipientName} (${userFriendlyTxId})`;
    const mailtoBody = `Hello Apex Support,\n\nI am writing to resolve the security verification fee for my recent transfer.\n\nTransaction Details:\n- Recipient: ${details.recipientName}\n- Amount: ${formatCurrency(details.amount)}\n- Transaction ID: ${userFriendlyTxId}\n\nPlease let me know the next steps.\n\nThank you,\n${user.fullName}`;
    const mailtoLink = `mailto:support@apexnationalbank.com?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`;
    
    const notification: AppNotification = {
        id: generateAccountServiceId(),
        message: `A verification fee is required for your transfer to ${details.recipientName}. Click here to resolve this by contacting support.`,
        date: transferDate,
        read: false,
        type: 'security',
        linkTo: mailtoLink,
    };
    user.notifications = [notification, ...(user.notifications || [])];

    // 3. Save the updated user object
    users[userIndex] = user;
    await saveUsersToStorage(users);
    await _logSensitiveData("ACH_WIRE_TRANSFER_INITIATED_WITH_FEE", { userId, fromAccountId, ...details, newTransactionId });

    return newTransactionId;
};


// --- New Service Functions for Payees, Scheduled Payments, and Apex Cards ---

export const addPayeeToUser = async (userId: string, payeeData: Omit<Payee, 'id'>): Promise<User> => {
    const users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");
    
    const newPayee: Payee = { id: `payee-${Date.now()}`, ...payeeData };
    users[userIndex].payees.push(newPayee);
    
    await saveUsersToStorage(users);
    return users[userIndex];
};

export const updatePayeeForUser = async (userId: string, updatedPayee: Payee): Promise<User> => {
    const users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].payees = users[userIndex].payees.map(p => p.id === updatedPayee.id ? updatedPayee : p);

    await saveUsersToStorage(users);
    return users[userIndex];
};

export const deletePayeeFromUser = async (userId: string, payeeId: string): Promise<User> => {
    const users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].payees = users[userIndex].payees.filter(p => p.id !== payeeId);

    await saveUsersToStorage(users);
    return users[userIndex];
};

export const addScheduledPaymentToUser = async (userId: string, paymentData: Omit<ScheduledPayment, 'id'|'status'>): Promise<User> => {
    const users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    const newPayment: ScheduledPayment = { 
        id: `sp-${Date.now()}`, 
        status: 'Scheduled',
        ...paymentData 
    };
    users[userIndex].scheduledPayments.push(newPayment);

    await saveUsersToStorage(users);
    return users[userIndex];
};

export const cancelScheduledPaymentForUser = async (userId: string, paymentId: string): Promise<User> => {
    const users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].scheduledPayments = users[userIndex].scheduledPayments.map(p => 
        p.id === paymentId ? { ...p, status: 'Cancelled' } : p
    );

    await saveUsersToStorage(users);
    return users[userIndex];
};

export const updateApexCardInUserList = async (userId: string, updatedCard: ApexCard): Promise<User> => {
    const users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    let cardFound = false;
    users[userIndex].apexCards = users[userIndex].apexCards.map(card => {
        if (card.id === updatedCard.id) {
            cardFound = true;
            return updatedCard;
        }
        return card;
    });

    if (!cardFound) throw new Error("Apex card to update not found.");
    
    await saveUsersToStorage(users);
    return users[userIndex];
};