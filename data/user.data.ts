

import { User, Account, SavingsGoal, AppNotification, LinkedExternalAccount, LinkedCard, Payee, ScheduledPayment, ApexCard, SecuritySettings, SecurityQuestionAnswer, LoginAttempt, DeviceInfo, PREDEFINED_SECURITY_QUESTIONS, UserNotificationPreferences, AccountType, TransactionType, Transaction } from '../types';
import { generateNewId as generateAccountServiceId, generateRandomAccountNumber } from '../services/accountService';

// --- Default Settings Templates ---
const defaultNotificationPreferences: UserNotificationPreferences = {
    transactions: true,
    lowBalance: true,
    securityAlerts: true,
    promotions: false,
    appUpdates: true,
    lowBalanceThreshold: 100,
};
const defaultSecuritySettings: SecuritySettings = {
    is2FAEnabled: false,
    twoFAMethod: undefined,
    hasSecurityQuestionsSet: false,
    isBiometricEnabled: false,
};

// --- Alex's Hardcoded Static Data ---

const alexPrimaryCheckingTransactions: Transaction[] = [
    // Previous transactions plus new high-value ones
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 45).toISOString(), description: 'Direct Deposit - Employer', amount: 3250, type: TransactionType.CREDIT, category: 'Income', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 40).toISOString(), description: 'Apex Mortgage', amount: 1250, type: TransactionType.DEBIT, category: 'Mortgage', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 35).toISOString(), description: 'Online Shopping - Amazon', amount: 145.99, type: TransactionType.DEBIT, category: 'Shopping', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 30).toISOString(), description: 'Groceries - Whole Foods', amount: 210.45, type: TransactionType.DEBIT, category: 'Groceries', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 28).toISOString(), description: 'Direct Deposit - Employer', amount: 3250, type: TransactionType.CREDIT, category: 'Income', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 20).toISOString(), description: 'Stock Vesting - GOOGL', amount: 75830.50, type: TransactionType.CREDIT, category: 'Investment', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 15).toISOString(), description: 'Luxury Car Lease Payment', amount: 1800, type: TransactionType.DEBIT, category: 'Auto', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 5).toISOString(), description: 'Property Sale Proceeds', amount: 850000, type: TransactionType.CREDIT, category: 'Income', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 3).toISOString(), description: 'Contract Payment - Project Apex Titan', amount: 220000, type: TransactionType.CREDIT, category: 'Income', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 2).toISOString(), description: 'Transfer to High-Yield Savings', amount: 750000, type: TransactionType.DEBIT, category: 'Transfer', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
];

const alexBusinessCheckingTransactions: Transaction[] = [
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 50).toISOString(), description: 'Client Payment - Gamma Solutions', amount: 150000, type: TransactionType.CREDIT, category: 'Revenue', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 40).toISOString(), description: 'Office Equipment - Mac Pro', amount: 6999, type: TransactionType.DEBIT, category: 'Business Expense', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 30).toISOString(), description: 'Software Subscription - Adobe CC', amount: 59.99, type: TransactionType.DEBIT, category: 'Software', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 20).toISOString(), description: 'Client Payment - Beta LLC', amount: 450000, type: TransactionType.CREDIT, category: 'Revenue', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 10).toISOString(), description: 'Series A Funding Round', amount: 5000000, type: TransactionType.CREDIT, category: 'Investment', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
];

const alexSavingsTransactions: Transaction[] = [
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 30).toISOString(), description: 'Interest Earned', amount: 150.23, type: TransactionType.CREDIT, category: 'Interest', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 2).toISOString(), description: 'Transfer from Primary Checking', amount: 750000, type: TransactionType.CREDIT, category: 'Transfer', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 1).toISOString(), description: 'Interest Earned', amount: 2845.77, type: TransactionType.CREDIT, category: 'Interest', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
];

const alexIraTransactions: Transaction[] = [
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 45).toISOString(), description: 'IRA Contribution', amount: 6500, type: TransactionType.CREDIT, category: 'Contribution', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
    { id: generateAccountServiceId(), date: new Date(Date.now() - 86400000 * 15).toISOString(), description: 'Market Gains Investment', amount: 1234.56, type: TransactionType.CREDIT, category: 'Investment', status: 'Completed', userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}` },
];


const alexAccounts: Account[] = [
    { id: 'alexPrimaryChecking', name: AccountType.CHECKING, type: AccountType.CHECKING, accountNumber: '112233445566', balance: 0, transactions: alexPrimaryCheckingTransactions },
    { id: 'alexBusinessChecking', name: AccountType.BUSINESS_CHECKING, type: AccountType.BUSINESS_CHECKING, accountNumber: '998877665544', balance: 0, transactions: alexBusinessCheckingTransactions },
    { id: 'alexSavings', name: AccountType.SAVINGS, type: AccountType.SAVINGS, accountNumber: '123456789012', balance: 0, transactions: alexSavingsTransactions },
    { id: 'alexIRA', name: AccountType.IRA, type: AccountType.IRA, accountNumber: '5432109876', balance: 0, transactions: alexIraTransactions },
];
// Recalculate balances once on creation
alexAccounts.forEach(acc => {
    let currentBalance = 0;
    acc.transactions.forEach(tx => {
        if(tx.status === 'Completed') {
            currentBalance += (tx.type === TransactionType.CREDIT ? tx.amount : -tx.amount);
        }
    });
    acc.balance = parseFloat(currentBalance.toFixed(2));
});


const alexInitialSavingsGoals: SavingsGoal[] = [
  { id: 'alexGoal1', name: 'European Backpacking Trip', targetAmount: 7500, currentAmount: 2300, deadline: new Date(new Date().getFullYear() + 1, 8, 15).toISOString() },
  { id: 'alexGoal2', name: 'New Laptop Fund', targetAmount: 2000, currentAmount: 1850, deadline: new Date(new Date().getFullYear(), 11, 20).toISOString() },
  { id: 'alexGoal3', name: 'Emergency Fund Top-up', targetAmount: 15000, currentAmount: 12000 }
];

const alexInitialNotifications: AppNotification[] = [
    { id: 'notif2_alex', message: 'Your scheduled payment to City Electric Co. for $75.50 was processed.', date: new Date(Date.now() - 86400000 * 1).toISOString(), read: false, type: 'transfer_success', linkTo: '/pay-bills/scheduled'},
    { id: 'notif4_alex', message: 'Your statement for Primary Checking is now available.', date: new Date(Date.now() - 86400000 * 4).toISOString(), read: true, type: 'general', linkTo: '/profile/documents' },
    { id: 'notif5_alex', message: 'Did you know you can set up savings goals? Start planning for your future today!', date: new Date(Date.now() - 86400000 * 5).toISOString(), read: true, type: 'general', linkTo: '/profile/savings-goals' },
    { id: 'notif6_alex', message: 'Your Apex Rewards Visa card was used for a purchase of $125.43 at Best Buy.', date: new Date(Date.now() - 86400000 * 6).toISOString(), read: true, type: 'transaction_update' },
    { id: 'notif7_alex', message: 'Your credit score has been updated. Check it now to see what\'s changed.', date: new Date(Date.now() - 86400000 * 7).toISOString(), read: true, type: 'general', linkTo: '/credit-score' },
    { id: 'notif8_alex', message: 'A new payee \'Netflix\' has been added to your account.', date: new Date(Date.now() - 86400000 * 8).toISOString(), read: true, type: 'security', linkTo: '/pay-bills/payees' },
    { id: 'notif9_alex', message: 'Your password was changed on ' + new Date(Date.now() - 86400000 * 30).toLocaleDateString() + '. If you did not make this change, please contact us immediately.', date: new Date(Date.now() - 86400000 * 9).toISOString(), read: true, type: 'security' },
];

const alexInitialLinkedAccounts: LinkedExternalAccount[] = [
    { id: 'chase1001', bankName: 'Chase', accountType: 'Checking', last4: '1001', accountNumber_full: "987654321001", accountHolderName: 'Alex Johnson', isVerified: true },
    { id: 'boa2002', bankName: 'Bank of America', accountType: 'Savings', last4: '2002', accountNumber_full: "123450987002", accountHolderName: 'Alex Johnson', isVerified: true },
];

const alexInitialLinkedCards: LinkedCard[] = [
    { id: 'visaGold2002', cardType: 'Visa', last4: '2002', cardNumber_full: "4111222233332002", expiryDate: '12/26', cardHolderName: 'Alex Johnson', isDefault: true, bankName: 'External Bank XYZ', cvv: "123" },
    { id: 'mcPlatinum3003', cardType: 'Mastercard', last4: '3003', cardNumber_full: "5454666677773003", expiryDate: '10/25', cardHolderName: 'Alex Johnson', isDefault: false, bankName: 'Another Credit Union', cvv: "456" },
];

const alexInitialPayees: Payee[] = [
    { id: 'payee1_alex', name: 'City Electric Co.', accountNumber: '100200300', zipCode: '90210', category: 'Utilities' },
    { id: 'payee2_alex', name: 'Apex Mortgage', accountNumber: '9988776655', zipCode: '90211', category: 'Mortgage' },
    { id: 'payee3_alex', name: 'Gigabit Internet', accountNumber: 'GI-7654321', zipCode: '90210', category: 'Utilities' },
];

const alexInitialScheduledPayments: ScheduledPayment[] = [
    { id: 'sp1_alex', payeeId: 'payee1_alex', payeeName: 'City Electric Co.', amount: 75.50, paymentDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), frequency: 'Monthly', status: 'Scheduled' },
    { id: 'sp2_alex', payeeId: 'payee2_alex', payeeName: 'Apex Mortgage', amount: 1250.00, paymentDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), frequency: 'Monthly', status: 'Scheduled' },
];

const alexInitialApexCards: ApexCard[] = [
    { id: 'apexDebit1234', cardType: 'Debit', cardName: 'Primary Checking Debit', last4: '1234', expiryDate: '11/27', isLocked: false, linkedAccountId: 'alexPrimaryChecking' },
    { id: 'apexCredit5678', cardType: 'Credit', cardName: 'Apex Rewards Visa', last4: '5678', expiryDate: '08/28', isLocked: true, creditLimit: 10000, availableCredit: 7500.50 },
];

const alexLoginHistory: LoginAttempt[] = [
    {id: generateAccountServiceId(), timestamp: new Date(Date.now() - 86400000*2).toISOString(), ipAddress: "73.12.34.56", status: "Success", deviceInfo: "Chrome on macOS"},
    {id: generateAccountServiceId(), timestamp: new Date(Date.now() - 86400000).toISOString(), ipAddress: "102.98.76.54", status: "Success", deviceInfo: "Safari on iPhone"},
];

const alexRecognizedDevices: DeviceInfo[] = [
    {id: generateAccountServiceId(), name: "Alex's MacBook Pro", lastLogin: new Date(Date.now() - 86400000*2).toISOString(), ipAddress: "73.12.34.56", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"},
];

export const alexUserTemplate: User = {
    id: 'userAlex123', username: 'MidnightTaco', hashedPassword: 'MidnightTaco#2025',
    fullName: 'Fernando Malachovski', email: 'malnando@gmail.com', phoneNumber: '555-123-4567',
    addressLine1: '118 Innovation Drive', city: 'techville', state: 'CA', zipCode: '90210',
    dateOfBirth: '1985-07-15', occupation: 'US ARMY', maritalStatus: 'Single',
    profileImageUrl: `https://scontent.fbni1-1.fna.fbcdn.net/v/t1.15752-9/514910270_2092030547954630_8659896196217363493_n.jpg?stp=dst-jpg_p480x480_tt6&_nc_cat=111&ccb=1-7&_nc_sid=0024fc&_nc_ohc=8OJl_1CfbjEQ7kNvwEI1FDL&_nc_oc=Adm2BN9mHsIbzJxc4fzhzIUbjFREhk-PQzoDnUDJHFhkaWWy2tTdqdijOae4cAeJFAI&_nc_ad=z-m&_nc_cid=1361&_nc_zt=23&_nc_ht=scontent.fbni1-1.fna&oh=03_Q7cD2wGRgL2bqD1yE_ApncCeXqHpIdmeA8FT9Ih1odb0Wc2Sog&oe=689E613C`,
    ssn: "26326373", phoneCarrier: "Verizon",
    createdAt: new Date('2019-01-10T10:00:00Z').toISOString(),
    accounts: alexAccounts,
    linkedExternalAccounts: alexInitialLinkedAccounts,
    linkedCards: alexInitialLinkedCards,
    savingsGoals: alexInitialSavingsGoals,
    payees: alexInitialPayees,
    scheduledPayments: alexInitialScheduledPayments,
    apexCards: alexInitialApexCards,
    isIdentityVerified: true,
    verificationSubmission: {
        personalDataSnapshot: { fullName: 'Alex Johnson', email: 'alex.johnson@example.com', phoneNumber: '555-123-4567', addressLine1: '123 Innovation Drive', city: 'Techville', state: 'CA', zipCode: '90210', dateOfBirth: '1985-07-15', ssn: "000000001", phoneCarrier: "Verizon" },
        idFrontDataUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
        idBackDataUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
        linkedWithdrawalCardId: alexInitialLinkedCards[0]?.id || 'defaultCardIdFallback',
        cardPin: "1234", 
        pinVerifiedTimestamp: new Date().toISOString(),
        submissionTimestamp: new Date().toISOString(),
        status: 'approved'
    },
    notifications: alexInitialNotifications,
    notificationPreferences: {...defaultNotificationPreferences, promotions: true},
    travelNotices: [{id: 'travel1_alex', destinations: "Paris, France", startDate: new Date(Date.now() + 86400000 * 10).toISOString() , endDate: new Date(Date.now() + 86400000 * 20).toISOString(), accountIds: ['alexPrimaryChecking', 'alexBusinessChecking']}],
    lastPasswordChange: new Date(Date.now() - 86400000 * 30).toISOString(),
    securitySettings: {...defaultSecuritySettings, is2FAEnabled: true, twoFAMethod: 'app', hasSecurityQuestionsSet: true, isBiometricEnabled: true},
    securityQuestions: [{questionId: PREDEFINED_SECURITY_QUESTIONS[0].id, answerHash: "Johnson"}, {questionId: PREDEFINED_SECURITY_QUESTIONS[1].id, answerHash: "Buddy"}],
    loginHistory: alexLoginHistory,
    recognizedDevices: alexRecognizedDevices,
    isAdmin: false,
};

// --- Admin Template ---
export const adminUserTemplate: User = {
    id: 'adminUser999', username: 'Admin', hashedPassword: 'AdminApexR0cks!',
    fullName: 'Apex Admin', email: 'admin@apexnationalbank.com', phoneNumber: 'N/A',
    addressLine1: 'N/A', city: 'N/A', state: 'N/A', zipCode: 'N/A',
    createdAt: new Date().toISOString(),
    accounts: [], linkedExternalAccounts: [], linkedCards: [], savingsGoals: [], notifications: [],
    payees: [], scheduledPayments: [], apexCards: [],
    notificationPreferences: defaultNotificationPreferences, travelNotices: [],
    securitySettings: defaultSecuritySettings, loginHistory: [], recognizedDevices: [],
    isAdmin: true,
};