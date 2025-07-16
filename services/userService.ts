
import { User, UserProfileData, Account, AccountType, Transaction, TransactionType, LinkedExternalAccount, LinkedCard, SavingsGoal, AppNotification, VerificationSubmissionData, UserNotificationPreferences, TravelNotice, SecuritySettings, SecurityQuestionAnswer, LoginAttempt, DeviceInfo, TransactionStatus, PREDEFINED_SECURITY_QUESTIONS, VerificationSubmissionStatus, Payee, ScheduledPayment, ApexCard } from '../types';
import * as api from './api';
import { BANK_NAME } from '../constants';
import { 
    generateInitialAlexAccounts, 
    generateInitialAccountsForNewUser,
    recalculateBalancesForAccount,
    generateNewId as generateAccountServiceId, 
    generateRandomAccountNumber,
    addTransactionToUserAccountList as serviceAddTransaction
} from './accountService';
import { formatCurrency, formatDate } from '../utils/formatters'; 

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

// Define these at a scope accessible by createAlexTemplate
const alexInitialSavingsGoalsScoped: SavingsGoal[] = [
  { id: 'alexGoal1', name: 'European Backpacking Trip', targetAmount: 7500, currentAmount: 2300, deadline: new Date(new Date().getFullYear() + 1, 8, 15).toISOString() },
  { id: 'alexGoal2', name: 'New Laptop Fund', targetAmount: 2000, currentAmount: 1850, deadline: new Date(new Date().getFullYear(), 11, 20).toISOString() },
  { id: 'alexGoal3', name: 'Emergency Fund Top-up', targetAmount: 15000, currentAmount: 12000 }
];
const alexInitialNotificationsScoped: AppNotification[] = [
    { id: 'notif1_alex', message: `Welcome to ${BANK_NAME}, Alex! Explore your new account features.`, date: new Date(Date.now() - 86400000 * 2).toISOString(), read: true, type: 'general' },
    { id: 'notif2_alex', message: 'Your recent transfer of $500.00 to Savings Goal "European Backpacking Trip" was successful.', date: new Date(Date.now() - 86400000 * 1).toISOString(), read: false, type: 'transfer_success', linkTo: '/profile/savings-goals'},
];
const alexInitialLinkedAccountsScoped: LinkedExternalAccount[] = [
    { id: 'chase1001', bankName: 'Chase', accountType: 'Checking', last4: '1001', accountNumber_full: "987654321001", accountHolderName: 'Alex Johnson', isVerified: true },
    { id: 'boa2002', bankName: 'Bank of America', accountType: 'Savings', last4: '2002', accountNumber_full: "123450987002", accountHolderName: 'Alex Johnson', isVerified: true },
];
const alexInitialLinkedCardsScoped: LinkedCard[] = [
    { id: 'visaGold2002', cardType: 'Visa', last4: '2002', cardNumber_full: "4111222233332002", expiryDate: '12/26', cardHolderName: 'Alex Johnson', isDefault: true, bankName: 'External Bank XYZ', cvv: "123" },
    { id: 'mcPlatinum3003', cardType: 'Mastercard', last4: '3003', cardNumber_full: "5454666677773003", expiryDate: '10/25', cardHolderName: 'Alex Johnson', isDefault: false, bankName: 'Another Credit Union', cvv: "456" },
];
const alexInitialPayeesScoped: Payee[] = [
    { id: 'payee1_alex', name: 'City Electric Co.', accountNumber: '100200300', zipCode: '90210', category: 'Utilities' },
    { id: 'payee2_alex', name: 'Apex Mortgage', accountNumber: '9988776655', zipCode: '90211', category: 'Mortgage' },
    { id: 'payee3_alex', name: 'Gigabit Internet', accountNumber: 'GI-7654321', zipCode: '90210', category: 'Utilities' },
];
const alexInitialScheduledPaymentsScoped: ScheduledPayment[] = [
    { id: 'sp1_alex', payeeId: 'payee1_alex', payeeName: 'City Electric Co.', amount: 75.50, paymentDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), frequency: 'Monthly', status: 'Scheduled' },
    { id: 'sp2_alex', payeeId: 'payee2_alex', payeeName: 'Apex Mortgage', amount: 1250.00, paymentDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), frequency: 'Monthly', status: 'Scheduled' },
];
const alexInitialApexCardsScoped: ApexCard[] = [
    { id: 'apexDebit1234', cardType: 'Debit', cardName: 'Primary Checking Debit', last4: '1234', expiryDate: '11/27', isLocked: false, linkedAccountId: 'alexPrimaryChecking' },
    { id: 'apexCredit5678', cardType: 'Credit', cardName: 'Apex Rewards Visa', last4: '5678', expiryDate: '08/28', isLocked: true, creditLimit: 10000, availableCredit: 7500.50 },
];

const defaultNotificationPreferencesScoped: UserNotificationPreferences = {
    transactions: true,
    lowBalance: true,
    securityAlerts: true,
    promotions: false,
    appUpdates: true,
    lowBalanceThreshold: 100,
};
const defaultSecuritySettingsScoped: SecuritySettings = {
    is2FAEnabled: false,
    twoFAMethod: undefined,
    hasSecurityQuestionsSet: false,
    isBiometricEnabled: false,
};

// Function to create a fresh Alex user object
const createAlexTemplate = (): User => {
    const alexAccounts = generateInitialAlexAccounts();
    const alexLoginHistory: LoginAttempt[] = [
        {id: generateAccountServiceId(), timestamp: new Date(Date.now() - 86400000*2).toISOString(), ipAddress: "73.12.34.56", status: "Success", deviceInfo: "Chrome on macOS"},
        {id: generateAccountServiceId(), timestamp: new Date(Date.now() - 86400000).toISOString(), ipAddress: "102.98.76.54", status: "Success", deviceInfo: "Safari on iPhone"},
    ];
    const alexRecognizedDevices: DeviceInfo[] = [
        {id: generateAccountServiceId(), name: "Alex's MacBook Pro", lastLogin: new Date(Date.now() - 86400000*2).toISOString(), ipAddress: "73.12.34.56", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"},
    ];

    return {
        id: 'userAlex123', username: 'Alex', hashedPassword: 'ApexBankR0cks!',
        fullName: 'Alex Johnson', email: 'alex.johnson@example.com', phoneNumber: '555-123-4567',
        addressLine1: '123 Innovation Drive', city: 'Techville', state: 'CA', zipCode: '90210',
        dateOfBirth: '1985-07-15', occupation: 'Software Engineer', maritalStatus: 'Single',
        profileImageUrl: `https://i.pravatar.cc/150?u=alex.johnson@example.com`,
        ssn: "000000001", phoneCarrier: "Verizon",
        createdAt: new Date('2019-01-10T10:00:00Z').toISOString(),
        accounts: alexAccounts,
        linkedExternalAccounts: alexInitialLinkedAccountsScoped,
        linkedCards: alexInitialLinkedCardsScoped,
        payees: alexInitialPayeesScoped,
        scheduledPayments: alexInitialScheduledPaymentsScoped,
        apexCards: alexInitialApexCardsScoped,
        isIdentityVerified: true,
        verificationSubmission: {
            personalDataSnapshot: { fullName: 'Alex Johnson', email: 'alex.johnson@example.com', phoneNumber: '555-123-4567', addressLine1: '123 Innovation Drive', city: 'Techville', state: 'CA', zipCode: '90210', dateOfBirth: '1985-07-15', ssn: "000000001", phoneCarrier: "Verizon" },
            idFrontDataUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
            idBackDataUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
            linkedWithdrawalCardId: alexInitialLinkedCardsScoped[0]?.id || 'defaultCardIdFallback',
            cardPin: "1234", 
            pinVerifiedTimestamp: new Date().toISOString(),
            submissionTimestamp: new Date().toISOString(),
            status: 'approved'
        },
        notifications: alexInitialNotificationsScoped,
        notificationPreferences: {...defaultNotificationPreferencesScoped, promotions: true},
        travelNotices: [{id: 'travel1_alex', destinations: "Paris, France", startDate: new Date(Date.now() + 86400000 * 10).toISOString() , endDate: new Date(Date.now() + 86400000 * 20).toISOString(), accountIds: [alexAccounts[0].id, alexAccounts[1].id]}],
        lastPasswordChange: new Date(Date.now() - 86400000 * 30).toISOString(),
        securitySettings: {...defaultSecuritySettingsScoped, is2FAEnabled: true, twoFAMethod: 'app', hasSecurityQuestionsSet: true, isBiometricEnabled: true},
        securityQuestions: [{questionId: PREDEFINED_SECURITY_QUESTIONS[0].id, answerHash: "Johnson"}, {questionId: PREDEFINED_SECURITY_QUESTIONS[1].id, answerHash: "Buddy"}],
        loginHistory: alexLoginHistory,
        recognizedDevices: alexRecognizedDevices,
        savingsGoals: alexInitialSavingsGoalsScoped,
        isAdmin: false,
    };
};

// Function to create a fresh Admin user object
const createAdminTemplate = (): User => {
    return {
        id: 'adminUser999', username: 'Admin', hashedPassword: 'AdminApexR0cks!',
        fullName: 'Apex Admin', email: 'admin@apexnationalbank.com', phoneNumber: 'N/A',
        addressLine1: 'N/A', city: 'N/A', state: 'N/A', zipCode: 'N/A',
        createdAt: new Date().toISOString(),
        accounts: [], linkedExternalAccounts: [], linkedCards: [], savingsGoals: [], notifications: [],
        payees: [], scheduledPayments: [], apexCards: [],
        notificationPreferences: defaultNotificationPreferencesScoped, travelNotices: [],
        securitySettings: defaultSecuritySettingsScoped, loginHistory: [], recognizedDevices: [],
        isAdmin: true,
    };
};


// Reworked createInitialUsers to be non-destructive
const createInitialUsers = async (): Promise<void> => {
    let users = await getUsersFromStorage();
    let madeChanges = false;

    // Check for Alex
    const alexExists = users.some(u => u.id === 'userAlex123');
    if (!alexExists) {
        console.log("Alex user not found, creating from template.");
        const freshAlex = createAlexTemplate();
        users.push(freshAlex);
        madeChanges = true;
    }

    // Check for Admin
    const adminExists = users.some(u => u.id === 'adminUser999');
    if (!adminExists) {
        console.log("Admin user not found, creating from template.");
        const freshAdmin = createAdminTemplate();
        users.push(freshAdmin);
        madeChanges = true;
    }
    
    // Ensure all other users (not Alex or Admin) have default empty arrays for new properties
    users = users.map(user => {
        if (user.id !== 'userAlex123' && user.id !== 'adminUser999') {
            let userChanged = false;
            const defaults = {
                notificationPreferences: defaultNotificationPreferencesScoped,
                securitySettings: defaultSecuritySettingsScoped,
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
                    userChanged = true;
                }
            }

            if(userChanged) {
                madeChanges = true;
            }
        }
        return user;
    });

    if (madeChanges) {
        await saveUsersToStorage(users);
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
        notificationPreferences: { ...defaultNotificationPreferencesScoped },
        travelNotices: [],
        lastPasswordChange: undefined,
        securitySettings: { ...defaultSecuritySettingsScoped },
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
        ...(users[userIndex].notificationPreferences || defaultNotificationPreferencesScoped),
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
        ...(user.securitySettings || defaultSecuritySettingsScoped),
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

export const initiateWireTransfer = async (
    userId: string, 
    fromAccountId: string, 
    amount: number, 
    recipientName: string,
    memo: string,
): Promise<User> => {
    let users = await getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    const user = users[userIndex];
    const fromAccountIndex = user.accounts.findIndex(acc => acc.id === fromAccountId);
    if (fromAccountIndex === -1) throw new Error("Source account not found.");

    if (user.accounts[fromAccountIndex].balance < amount) {
        throw new Error("Insufficient funds for this transfer.");
    }
    
    const transferDate = new Date().toISOString();
    const userFriendlyTxId = `TXN-WRE-${generateAccountServiceId().slice(0, 8).toUpperCase()}`;

    const wireTransactionData: Omit<Transaction, 'id' | 'balanceAfter'> = {
        date: transferDate,
        description: `Wire Transfer to ${recipientName}`,
        amount,
        type: TransactionType.DEBIT,
        category: 'Wire Transfer',
        status: 'Pending',
        holdReason: 'To ensure the security of your large transfer, a one-time verification fee of $1200 is required. This fee will be refunded to your account after the transfer is completed.',
        userFriendlyId: userFriendlyTxId,
        recipientAccountInfo: `Recipient: ${recipientName}`,
        senderAccountInfo: `Your Account: ${user.accounts[fromAccountIndex].name} (...${user.accounts[fromAccountIndex].accountNumber.slice(-4)})`,
        memo,
    };

    const { updatedAccounts } = serviceAddTransaction(user.accounts, fromAccountId, wireTransactionData);
    user.accounts = updatedAccounts;
    // Note: serviceAddTransaction already runs recalculateBalancesForAccount which only considers 'Completed' transactions.
    // This is correct behavior as a 'Pending' transaction should not affect the available balance.

    const emailSubject = `Wire Transfer Security Fee - Transaction ID ${userFriendlyTxId}`;
    const emailBody = `Please assist with the security fee for my wire transfer.\n\nTransaction ID: ${userFriendlyTxId}\nAmount: ${formatCurrency(amount)}\n\nThank you.`;
    const mailtoLink = `mailto:support@apexnationalbank.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    const notification: AppNotification = {
        id: generateAccountServiceId(),
        message: `Your wire transfer of ${formatCurrency(amount)} is pending a security fee. Please contact support to proceed.`,
        date: transferDate,
        read: false,
        type: 'verification',
        linkTo: mailtoLink,
    };
    user.notifications = [notification, ...(user.notifications || [])];

    users[userIndex] = user;
    await saveUsersToStorage(users);
    await _logSensitiveData("WIRE_TRANSFER_INITIATED_PENDING_FEE", { userId, fromAccountId, amount, userFriendlyTxId });

    return user;
};