import { User, UserProfileData, Account, AccountType, Transaction, TransactionType, LinkedExternalAccount, LinkedCard, SavingsGoal, AppNotification, VerificationSubmissionData, UserNotificationPreferences, TravelNotice, SecuritySettings, SecurityQuestionAnswer, LoginAttempt, DeviceInfo, PREDEFINED_SECURITY_QUESTIONS, Payee, ScheduledPayment, ApexCard } from '../types';
import * as api from './api';
import { BANK_NAME } from '../constants';
import { 
    generateInitialAlexAccounts, 
    generateInitialAccountsForNewUser,
    generateNewId as generateAccountServiceId, 
} from './accountService';


// --- Scoped Data for User Templates ---

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
export const createInitialUsers = async (): Promise<void> => {
    let users = await api.fetchAllUsers();
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
        await api.saveAllUsers(users);
    }
};