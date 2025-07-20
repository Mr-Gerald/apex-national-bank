
import { User, UserProfileData, Account, AccountType, Transaction, TransactionType, LinkedExternalAccount, LinkedCard, SavingsGoal, AppNotification, VerificationSubmissionData, UserNotificationPreferences, TravelNotice, SecuritySettings, SecurityQuestionAnswer, LoginAttempt, DeviceInfo, TransactionStatus, PREDEFINED_SECURITY_QUESTIONS, VerificationSubmissionStatus, Payee, ScheduledPayment, ApexCard } from '../types';
import { BANK_NAME } from '../constants';
import { 
    recalculateBalancesForAccount,
    generateNewId as generateAccountServiceId, 
    generateRandomAccountNumber,
    addTransactionToUserAccountList as serviceAddTransaction
} from './accountService';
import { formatCurrency, formatDate } from '../utils/formatters'; 

// --- Functions moved from accountService.ts to resolve module loading issue ---

// Helper to create date strings
const createDateISO = (year: number, month: number, day: number, hour = 0, minute = 0, second = 0): string => {
  return new Date(year, month - 1, day, hour, minute, second).toISOString();
};

// Generate detailed historical transactions for a specific target balance and type
const generateHistoricalTransactionsForSeed = (
    initialTargetBalance: number,
    accountType: AccountType,
    isAlexAccount: boolean = false // Flag to adjust date generation for Alex
  ): { transactions: Transaction[], finalBalanceBeforeLatestIncome: number, maxHistoricalDate: Date } => {
  
  let balance = initialTargetBalance * (0.3 + Math.random() * 0.2); 
  const transactions: Transaction[] = [];
  const today = new Date();
  // For Alex, ensure historical data is older to make the "contract payment" relatively recent but still past
  const refYear = isAlexAccount ? today.getFullYear() -1 : today.getFullYear(); 
  let maxHistoricalDate = new Date(refYear - 3, 0, 1); // Start further back for maxHistoricalDate

  let baseSalary = 6500;
  let businessBaseRevenue = 15000;

  // Generate data for a few years back, ending before "refYear" for Alex if needed
  const startYear = refYear - (isAlexAccount ? 3 : 2); // e.g., 3 years of history

  for (let year = refYear; year >= startYear; year--) {
    for (let month = 12; month >= 1; month--) {
      // Skip future months if generating for the current year (for non-Alex)
      if (!isAlexAccount && year === today.getFullYear() && month > today.getMonth() + 1) continue;
      // If it's Alex, and we are in refYear (which is today.getFullYear() -1), generate all months
      // No special skip needed unless refYear itself is the current year (which it isn't for Alex by design)

      const daysInMonth = new Date(year, month, 0).getDate();
      
      if (accountType === AccountType.CHECKING) {
        if (month % 2 === 0) { 
         const incomeAmount = Math.floor(baseSalary * (0.9 + Math.random() * 0.2));
         const incomeDate = createDateISO(year, month, Math.random() > 0.5 ? 5 : 20, Math.floor(Math.random()*6)+9);
         transactions.push({
           id: generateAccountServiceId(), date: incomeDate, description: 'Direct Deposit - Employer',
           amount: incomeAmount, type: TransactionType.CREDIT, category: 'Income', status: 'Completed',
           userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}`,
         });
         balance += incomeAmount;
         if (new Date(incomeDate) > maxHistoricalDate) maxHistoricalDate = new Date(incomeDate);
        }
        if (year > startYear && month % 5 === 0 && Math.random() > 0.6) { 
            const bonusAmount = Math.floor(Math.random() * 15000) + 5000;
            const bonusDate = createDateISO(year, month, Math.floor(Math.random() * 10) + 10, Math.floor(Math.random()*6)+9);
            transactions.push({
              id: generateAccountServiceId(), date: bonusDate, description: 'Annual Performance Bonus',
              amount: bonusAmount, type: TransactionType.CREDIT, category: 'Bonus', status: 'Completed',
              userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}`,
            });
            balance += bonusAmount;
            if (new Date(bonusDate) > maxHistoricalDate) maxHistoricalDate = new Date(bonusDate);
        }
      } else if (accountType === AccountType.BUSINESS_CHECKING) {
        const numClientPayments = Math.floor(Math.random() * 3) + 2;
        for(let k=0; k<numClientPayments; k++) {
            const incomeAmount = Math.floor(businessBaseRevenue * (0.3 + Math.random() * 1.5));
            const paymentDate = createDateISO(year, month, Math.floor(Math.random() * 20) + 5, Math.floor(Math.random()*6)+9);
            transactions.push({
            id: generateAccountServiceId(), date: paymentDate, description: `Client Payment - ${['Alpha Corp', 'Beta LLC', 'Gamma Solutions'][k%3]}`,
            amount: incomeAmount, type: TransactionType.CREDIT, category: 'Revenue', status: 'Completed',
            userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}`,
            });
            balance += incomeAmount;
            if (new Date(paymentDate) > maxHistoricalDate) maxHistoricalDate = new Date(paymentDate);
        }
        if (year > startYear && month % 7 === 0 && Math.random() > 0.5) { 
            const contractAmount = Math.floor(Math.random() * 150000) + 50000;
            const contractDate = createDateISO(year, month, Math.floor(Math.random() * 15) + 5, Math.floor(Math.random()*6)+9);
            transactions.push({
              id: generateAccountServiceId(), date: contractDate, description: 'Major Contract Payout - Project Phoenix',
              amount: contractAmount, type: TransactionType.CREDIT, category: 'Contract Revenue', status: 'Completed',
              userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}`,
            });
            balance += contractAmount;
            if (new Date(contractDate) > maxHistoricalDate) maxHistoricalDate = new Date(contractDate);
        }
      } else if (accountType === AccountType.SAVINGS) {
        const interestAmount = Math.floor(balance * (0.0012 + Math.random() * 0.0020)); 
        if (interestAmount > 1) {
            const interestDate = createDateISO(year, month, 28, Math.floor(Math.random()*6)+9);
            transactions.push({
            id: generateAccountServiceId(), date: interestDate, description: 'Interest Earned',
            amount: interestAmount, type: TransactionType.CREDIT, category: 'Interest', status: 'Completed',
            userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}`,
            });
            balance += interestAmount;
            if (new Date(interestDate) > maxHistoricalDate) maxHistoricalDate = new Date(interestDate);
        }
         if (year > startYear && month % 8 === 0 && Math.random() > 0.6) { 
            const largeDeposit = Math.floor(Math.random() * 75000) + 25000;
            const depositDate = createDateISO(year, month, Math.floor(Math.random() * 10) + 1, Math.floor(Math.random()*6)+9);
            transactions.push({
              id: generateAccountServiceId(), date: depositDate, description: 'Investment Portfolio Dividend',
              amount: largeDeposit, type: TransactionType.CREDIT, category: 'Investment', status: 'Completed',
              userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}`,
            });
            balance += largeDeposit;
            if (new Date(depositDate) > maxHistoricalDate) maxHistoricalDate = new Date(depositDate);
        }
      } else if (accountType === AccountType.IRA) {
        if (month === 1 || (month === 7 && year > startYear)) { 
            const contributionAmount = Math.floor(Math.random() * (10000 - 4000 +1)) + 4000;
            const contributionDate = createDateISO(year, month, Math.floor(Math.random() * 10) + 5, Math.floor(Math.random()*6)+9);
             transactions.push({
                id: generateAccountServiceId(), date: contributionDate, description: 'IRA Contribution',
                amount: contributionAmount, type: TransactionType.CREDIT, category: 'Contribution', status: 'Completed',
                userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}`,
            });
            balance += contributionAmount;
            if (new Date(contributionDate) > maxHistoricalDate) maxHistoricalDate = new Date(contributionDate);
        }
        const marketFluctuation = balance * ( (Math.random() - 0.40) * 0.15 ); 
        if (Math.abs(marketFluctuation) > 100) {
             const marketDate = createDateISO(year, month, Math.floor(Math.random() * 5) + 20, Math.floor(Math.random()*6)+10);
             transactions.push({
                id: generateAccountServiceId(), date: marketDate, description: marketFluctuation > 0 ? 'Market Gains Investment' : 'Market Fluctuation Loss',
                amount: Math.abs(marketFluctuation), type: marketFluctuation > 0 ? TransactionType.CREDIT : TransactionType.DEBIT, category: 'Investment', status: 'Completed',
                userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}`,
            });
            balance += marketFluctuation;
            if (new Date(marketDate) > maxHistoricalDate) maxHistoricalDate = new Date(marketDate);
        }
      }

      const numExpenses = Math.floor(Math.random() * (accountType === AccountType.CHECKING ? 10 : (accountType === AccountType.BUSINESS_CHECKING ? 7 : 3))) + (accountType === AccountType.CHECKING ? 7 : (accountType === AccountType.BUSINESS_CHECKING ? 4 : 1));
      const humanCategories = ['Coffee Shop', 'Online Subscription', 'Book Store', 'Dinner with Friends', 'Weekend Getaway', 'Concert Tickets', 'Charity Donation', 'Gym Membership', 'Electronics Store'];
      const businessCategories = ['Software Subscription', 'Office Supplies', 'Client Lunch & Entertainment', 'Travel Expense', 'Consulting Fees', 'Marketing Campaign', 'Cloud Services Bill'];
      
      let expenseCategories = ['Groceries', 'Utilities', 'Rent/Mortgage', 'Dining Out', 'Shopping', 'Transport', 'Entertainment', 'Healthcare', ...humanCategories];
      if (accountType === AccountType.BUSINESS_CHECKING) {
        expenseCategories = ['Operating Costs', 'Digital Advertising', 'Payroll Processing Fee', ...businessCategories];
      }
      if (accountType === AccountType.SAVINGS || accountType === AccountType.IRA) {
        expenseCategories = ['Withdrawal', 'Account Maintenance Fee']; 
      }

      for (let i = 0; i < numExpenses; i++) {
        const day = Math.floor(Math.random() * daysInMonth) + 1;
        const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
        let amount = Math.floor(Math.random() * (accountType === AccountType.CHECKING ? 350 : (accountType === AccountType.BUSINESS_CHECKING ? 1500 : 150))) + 20;
        
        if (category === 'Rent/Mortgage' && accountType === AccountType.CHECKING) amount = Math.floor(Math.random() * 1200) + 1800;
        if ((category === 'Payroll Processing Fee' || category === 'Operating Costs') && accountType === AccountType.BUSINESS_CHECKING) amount = Math.floor(Math.random() * 4000) + 6000;
        if (category === 'Withdrawal' && (accountType === AccountType.SAVINGS || accountType === AccountType.IRA)) {
             if (year > refYear -1 || Math.random() > 0.05) continue; // Make withdrawals rarer for savings/IRA and older
            amount = Math.floor(Math.random() * 2000) + 500;
        }

        if (balance - amount < 200 && year < refYear -1 ) { 
            amount = Math.max(0, balance - 200 - (Math.random()*100));
        }
        if (amount <= 10) continue; 

        const expenseDate = createDateISO(year, month, day, Math.floor(Math.random()*12)+8, Math.floor(Math.random()*60));
        transactions.push({
          id: generateAccountServiceId(), date: expenseDate, 
          description: category === 'Online Subscription' ? `Subscription - ${['Zenith Streaming', 'Apex Pro Tools', 'NewsNow'][Math.floor(Math.random()*3)]}` : `${category}`,
          amount: amount, type: TransactionType.DEBIT, category: category, status: 'Completed',
          userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}`,
        });
        balance -= amount;
        if (new Date(expenseDate) > maxHistoricalDate) maxHistoricalDate = new Date(expenseDate);
      }
    }
  }
  
  const diffFromTarget = initialTargetBalance - balance;
  if (Math.abs(diffFromTarget) > initialTargetBalance * 0.1 && transactions.length > 5) { 
      // Make adjustment on a date relative to maxHistoricalDate but ensure it's reasonable
      const adjustmentBaseDate = maxHistoricalDate > new Date(2000,0,1) ? maxHistoricalDate : new Date(refYear, 0, 15);
      const adjustmentDate = new Date(adjustmentBaseDate);
      adjustmentDate.setDate(adjustmentDate.getDate() - (Math.floor(Math.random()*30)+15) ); // 15-45 days before maxHistoricalDate

      transactions.push({
          id: generateAccountServiceId(), date: adjustmentDate.toISOString(),
          description: `Historical Balance Adjustment (${accountType})`,
          amount: Math.abs(diffFromTarget), 
          type: diffFromTarget > 0 ? TransactionType.CREDIT : TransactionType.DEBIT, 
          category: "Adjustment", status: 'Completed',
          userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}`,
      });
      balance += diffFromTarget;
      // No need to update maxHistoricalDate here as this adjustment is older
  }

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return { transactions, finalBalanceBeforeLatestIncome: balance, maxHistoricalDate };
};

const generateInitialAlexAccounts = (): Account[] => {
    let primaryCheckingTargetBeforeContract = 281234.56; 
    // Generate Alex's historical data ensuring it's older
    let primaryCheckingHistoricalData = generateHistoricalTransactionsForSeed(primaryCheckingTargetBeforeContract, AccountType.CHECKING, true);
    let businessCheckingData = generateHistoricalTransactionsForSeed(1075827.10, AccountType.BUSINESS_CHECKING, true);
    let savingsData = generateHistoricalTransactionsForSeed(1550567.12, AccountType.SAVINGS, true);
    let iraData = generateHistoricalTransactionsForSeed(1000110.05, AccountType.IRA, true);

    // Set the major contract payment to be a few days in the past from today
    const contractPaymentDate = new Date();
    contractPaymentDate.setDate(contractPaymentDate.getDate() - 3); // 3 days ago
    contractPaymentDate.setHours(15, 30, 0, 0);

    const contractPaymentAmount = 220000;
    const contractPayment: Transaction = {
      id: 'contract-payment-alex-latest',
      date: contractPaymentDate.toISOString(),
      description: 'Contract Payment - Project Apex Titan',
      amount: contractPaymentAmount,
      type: TransactionType.CREDIT,
      category: 'Income',
      status: 'Completed',
      userFriendlyId: `TXN-${generateAccountServiceId().slice(0,8).toUpperCase()}`,
      senderAccountInfo: "External Payer",
      recipientAccountInfo: "Your Account: Primary Checking"
    };
    
    let finalPrimaryCheckingTransactions = [contractPayment, ...primaryCheckingHistoricalData.transactions];
    
    let alexAccounts: Account[] = [
      {
        id: 'alexPrimaryChecking', name: AccountType.CHECKING, type: AccountType.CHECKING,
        accountNumber: generateRandomAccountNumber(12), balance: 0,
        transactions: finalPrimaryCheckingTransactions,
      },
      {
        id: 'alexBusinessChecking', name: AccountType.BUSINESS_CHECKING, type: AccountType.BUSINESS_CHECKING,
        accountNumber: generateRandomAccountNumber(10), balance: 0, 
        transactions: businessCheckingData.transactions,
      },
      {
        id: 'alexSavings', name: AccountType.SAVINGS, type: AccountType.SAVINGS,
        accountNumber: generateRandomAccountNumber(12), balance: 0,
        transactions: savingsData.transactions,
      },
      {
        id: 'alexIRA', name: AccountType.IRA, type: AccountType.IRA,
        accountNumber: generateRandomAccountNumber(10), balance: 0,
        transactions: iraData.transactions,
      },
    ];
    
    alexAccounts.forEach(recalculateBalancesForAccount); 

    const targetTotalAlex = 4127738.83;
    let currentTotalAlex = alexAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    let differenceAlex = targetTotalAlex - currentTotalAlex;

    if (Math.abs(differenceAlex) > 0.01 && alexAccounts.length > 0) {
        const savingsAccount = alexAccounts.find(acc => acc.type === AccountType.SAVINGS);
        const targetAdjustmentAccount = savingsAccount || alexAccounts.sort((a,b) => b.balance - a.balance)[0];
        
        if (targetAdjustmentAccount) {
            if (Math.abs(differenceAlex) > 0.01) { 
                // Make adjustment date slightly after contract payment for logical flow if needed
                const adjDate = new Date(contractPaymentDate.getTime() + (60*60*1000)); 
                const adjTransaction: Transaction = {
                    id: generateAccountServiceId(), date: adjDate.toISOString(),
                    description: differenceAlex > 0 ? 'Year-End Interest/Dividend Adjustment' : 'Year-End Fee/Tax Adjustment',
                    amount: Math.abs(differenceAlex), 
                    type: differenceAlex > 0 ? TransactionType.CREDIT : TransactionType.DEBIT,
                    category: 'Adjustment',
                    status: 'Completed',
                    userFriendlyId: `TXN-${generateAccountServiceId().slice(0,6).toUpperCase()}`,
                };
                targetAdjustmentAccount.transactions.unshift(adjTransaction); 
            }
        }
    }
    
    alexAccounts.forEach(recalculateBalancesForAccount); 
    return alexAccounts;
};

const generateInitialAccountsForNewUser = (userIdPrefix: string): Account[] => {
    const today = new Date();
    const checkingTransactions: Transaction[] = [
        { 
            id: generateAccountServiceId(), 
            date: createDateISO(today.getFullYear(), today.getMonth()+1, today.getDate(), 9, 0, 0), 
            description: 'Account Opened', 
            amount: 0, 
            type: TransactionType.CREDIT, 
            category: 'System',
            status: 'Completed',
            userFriendlyId: `TXN-SYS-${generateAccountServiceId().slice(0,6).toUpperCase()}`, // Ensure distinct userFriendlyId
            recipientAccountInfo: "Your Account: Primary Checking",
        },
    ];
    
    const initialAccounts: Account[] = [
        {
            id: `${userIdPrefix}-checking1`, name: AccountType.CHECKING, type: AccountType.CHECKING,
            accountNumber: generateRandomAccountNumber(12), balance: 0.00, transactions: checkingTransactions,
        }
    ];
    initialAccounts.forEach(recalculateBalancesForAccount);
    return initialAccounts;
};

// --- Storage Service Logic (LocalStorage) ---

const USERS_STORAGE_KEY = 'apexBankUsers';
const CURRENT_USER_ID_KEY = 'apexBankCurrentUserId';
const ADMIN_SESSION_KEY = 'isAdmin';
const SESSION_LOGGED_IN_KEY = 'apexBankIsLoggedInThisSession';


// --- User Data ---
const getUsersFromStorage = (): User[] => {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
};

const saveUsersToStorage = (users: User[]): void => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// --- Current User Session ---
export const getCurrentUserId = (): string | null => localStorage.getItem(CURRENT_USER_ID_KEY);
export const saveCurrentUserId = (userId: string): void => localStorage.setItem(CURRENT_USER_ID_KEY, userId);
export const clearCurrentUserId = (): void => localStorage.removeItem(CURRENT_USER_ID_KEY);

// --- Admin Session ---
export const getAdminSession = (): boolean => sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
export const saveAdminSession = (): void => sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
export const clearAdminSession = (): void => sessionStorage.removeItem(ADMIN_SESSION_KEY);

// --- General Session Flag ---
export const getIsLoggedInThisSession = (): boolean => sessionStorage.getItem(SESSION_LOGGED_IN_KEY) === 'true';
export const saveIsLoggedInThisSession = (): void => sessionStorage.setItem(SESSION_LOGGED_IN_KEY, 'true');
export const clearIsLoggedInThisSession = (): void => sessionStorage.removeItem(SESSION_LOGGED_IN_KEY);


// --- User Data Management ---

// Define these at a scope accessible by createAlexTemplate
const alexInitialSavingsGoalsScoped: SavingsGoal[] = [
  { id: 'alexGoal1', name: 'European Backpacking Trip', targetAmount: 7500, currentAmount: 2300, deadline: new Date(new Date().getFullYear() + 1, 8, 15).toISOString() },
  { id: 'alexGoal2', name: 'New Laptop Fund', targetAmount: 2000, currentAmount: 1850, deadline: new Date(new Date().getFullYear(), 11, 20).toISOString() },
  { id: 'alexGoal3', name: 'Emergency Fund Top-up', targetAmount: 15000, currentAmount: 12000 }
];
const alexInitialNotificationsScoped: AppNotification[] = [
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
        id: 'userAlex123', username: 'MidnightTaco', hashedPassword: 'MidnightTaco#2025',
        fullName: 'Mac Frosh', email: 'alex.johnson@example.com', phoneNumber: '555-123-4567',
        addressLine1: '123 Innovation Drive', city: 'Techville', state: 'CA', zipCode: '90210',
        dateOfBirth: '1985-07-15', occupation: 'Software Engineer', maritalStatus: 'Single',
        profileImageUrl: `https://i.pravatar.cc/150?u=alex.johnson@example.com`,
        ssn: "000000001", phoneCarrier: "Verizon",
        createdAt: new Date('2019-01-10T10:00:00Z').toISOString(),
        accounts: alexAccounts,
        linkedExternalAccounts: alexInitialLinkedAccountsScoped,
        linkedCards: alexInitialLinkedCardsScoped,
        savingsGoals: alexInitialSavingsGoalsScoped,
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
    let users = getUsersFromStorage();
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
        saveUsersToStorage(users);
    }
};


export const getAllUsers = async (): Promise<User[]> => {
    const users = getUsersFromStorage();
    return users.filter(u => !u.isAdmin); // Exclude admin from general user list
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
    const users = getUsersFromStorage();
    return users.find(u => u.id === userId);
};

export const updateUserById = async (userId: string, updatedData: Partial<User>): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found for update by ID.");

    users[userIndex] = { ...users[userIndex], ...updatedData };
    saveUsersToStorage(users);
    return users[userIndex];
};


// --- Authentication ---
export const loginUser = async (username_input: string, password_input: string, ipAddress: string, deviceAgent: string): Promise<User> => {
    const users = getUsersFromStorage();
    const user = users.find(u => u.username.toLowerCase() === username_input.toLowerCase());

    if (!user) {
        throw new Error("User not found.");
    }

    if (user.hashedPassword !== password_input) {
        if(!user.isAdmin) {
            const failedLoginAttempt: LoginAttempt = {
                id: generateAccountServiceId(), timestamp: new Date().toISOString(), ipAddress, status: "Failed - Incorrect Password", deviceInfo: deviceAgent,
            };
            user.loginHistory = [failedLoginAttempt, ...(user.loginHistory || [])].slice(0,20);
            saveUsersToStorage(users);
        }
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
        saveUsersToStorage(users);
    }

    saveCurrentUserId(user.id);
    return { ...user };
};

export const registerUser = async (
    username_input: string, 
    password_plain: string, 
    profileData: Omit<UserProfileData, 'profileImageUrl' | 'ssn' | 'phoneCarrier'>,
    ipAddress: string, 
    deviceAgent: string
): Promise<User> => {
    let users = getUsersFromStorage();
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
    saveUsersToStorage(users);
    return { ...newUser };
};

export const logoutUser = async (): Promise<void> => {
    clearCurrentUserId();
    clearAdminSession();
};

export const getCurrentLoggedInUser = async (): Promise<User | null> => {
    const userId = getCurrentUserId();
    if (!userId) return null;
    const users = getUsersFromStorage();
    const user = users.find(u => u.id === userId);
    return user ? { ...user } : null; 
};

// --- User Profile & Account Management ---
export const updateUserProfileData = async (userId: string, updatedProfileData: Partial<UserProfileData>): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex] = { ...users[userIndex], ...updatedProfileData };
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const addApexAccountToUser = async (userId: string, newAccountData: Pick<Account, 'name' | 'type'> & { initialBalance?: number }): Promise<Account> => {
    let users = getUsersFromStorage();
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
    saveUsersToStorage(users);
    return newApexAccount;
};

export const updateUserAccountData = async (userId: string, updatedAccounts: Account[]): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");
    
    users[userIndex].accounts = updatedAccounts.map(acc => {
        recalculateBalancesForAccount(acc); 
        return acc;
    });
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};


export const linkExternalBankAccountToUser = async (userId: string, accountData: Omit<LinkedExternalAccount, 'id' | 'isVerified'> & { routingNumber?: string }): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");
    
    const newExternalAccount: LinkedExternalAccount = {
        id: `extAcc-${Date.now()}`,
        ...accountData,
        isVerified: false, 
    };
    users[userIndex].linkedExternalAccounts = [...(users[userIndex].linkedExternalAccounts || []), newExternalAccount];
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const unlinkExternalBankAccountFromUser = async (userId: string, externalAccountId: string): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].linkedExternalAccounts = (users[userIndex].linkedExternalAccounts || []).filter(acc => acc.id !== externalAccountId);
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const linkExternalCardToUser = async (userId: string, cardData: Omit<LinkedCard, 'id'> & { cvv?: string } ): Promise<LinkedCard> => {
    let users = getUsersFromStorage();
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
    saveUsersToStorage(users);
    return newCard; 
};

export const updateExternalCardInUserList = async (userId: string, updatedCard: LinkedCard): Promise<User> => {
    let users = getUsersFromStorage();
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
    
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};


export const unlinkExternalCardFromUser = async (userId: string, cardId: string): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].linkedCards = (users[userIndex].linkedCards || []).filter(c => c.id !== cardId);
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const addSavingsGoalToUser = async (userId: string, goalData: Omit<SavingsGoal, 'id'>): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");
    
    const newGoal: SavingsGoal = {
        id: `goal-${Date.now()}`,
        ...goalData,
    };
    users[userIndex].savingsGoals = [...(users[userIndex].savingsGoals || []), newGoal];
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const updateSavingsGoalForUser = async (userId: string, updatedGoal: SavingsGoal): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].savingsGoals = (users[userIndex].savingsGoals || []).map(g => g.id === updatedGoal.id ? updatedGoal : g);
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const deleteSavingsGoalFromUser = async (userId: string, goalId: string): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].savingsGoals = (users[userIndex].savingsGoals || []).filter(g => g.id !== goalId);
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const markUserAsIdentityVerified = async (userId: string, isProfileVerification: boolean, approve: boolean): Promise<User> => {
    let users = getUsersFromStorage();
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
    }

    users[userIndex] = userToUpdate;
    saveUsersToStorage(users);
    return { ...userToUpdate };
};


export const updateTransactionStatusForUser = async (userId: string, accountId: string, transactionId: string, newStatus: TransactionStatus, newHoldReason?: string): Promise<User> => {
    let users = getUsersFromStorage();
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
    saveUsersToStorage(users);
    return { ...user };
};


export const markNotificationAsRead = async (userId: string, notificationId: string): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].notifications = (users[userIndex].notifications || []).map(n => 
        n.id === notificationId ? { ...n, read: true } : n
    );
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const markAllNotificationsAsRead = async (userId: string): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].notifications = (users[userIndex].notifications || []).map(n => ({ ...n, read: true }));
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const deleteNotificationFromUser = async (userId: string, notificationId: string): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].notifications = (users[userIndex].notifications || []).filter(n => n.id !== notificationId);
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const deleteAllReadNotificationsFromUser = async (userId: string): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].notifications = (users[userIndex].notifications || []).filter(n => !n.read);
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};


export const saveUserVerificationIdImages = async (userId: string, idFrontDataUrl: string, idBackDataUrl: string, isProfileVerification: boolean): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    const user = users[userIndex];
    
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

    users[userIndex] = user;
    saveUsersToStorage(users);
    return { ...user };
};

export const finalizeVerificationSubmission = async (userId: string, linkedWithdrawalCardId: string, cardPin: string, isProfileVerificationFlow: boolean, accountId?: string, transactionId?: string): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    const user = users[userIndex];
    if (!user.verificationSubmission) {
        throw new Error("ID images must be submitted before PIN verification.");
    }
    
    const submissionStatus: VerificationSubmissionStatus = isProfileVerificationFlow ? 'pending_profile_review' : 'pending_review';

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
    
    const notification: AppNotification = {
        id: generateAccountServiceId(),
        message: `Your identity verification submission has been received and is now under review. You'll be notified of the outcome.`,
        date: new Date().toISOString(),
        read: false,
        type: 'verification',
    };
    user.notifications = [notification, ...(user.notifications || [])];


    users[userIndex] = user;
    saveUsersToStorage(users);
    return { ...user };
};

export const updateUserNotificationPreferences = async (userId: string, preferences: Partial<UserNotificationPreferences>): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].notificationPreferences = {
        ...(users[userIndex].notificationPreferences || defaultNotificationPreferencesScoped),
        ...preferences
    };
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const addTravelNoticeToUser = async (userId: string, noticeData: Omit<TravelNotice, 'id'>): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    const newNotice: TravelNotice = {
        id: `travel-${Date.now()}`,
        ...noticeData,
    };
    users[userIndex].travelNotices = [...(users[userIndex].travelNotices || []), newNotice];
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const changeUserPassword = async (userId: string, currentPassword_plain: string, newPassword_plain: string): Promise<User> => {
    let users = getUsersFromStorage();
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

    saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const updateUserSecuritySettings = async (userId: string, settings: Partial<SecuritySettings>, questions?: SecurityQuestionAnswer[]): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");
    
    const user = users[userIndex];
    user.securitySettings = {
        ...(user.securitySettings || defaultSecuritySettingsScoped),
        ...settings
    };
    if (questions) {
        user.securityQuestions = questions;
        user.securitySettings.hasSecurityQuestionsSet = questions.length > 0;
    }
    
    users[userIndex] = user;
    saveUsersToStorage(users);
    return { ...user };
};

export const clearUserLoginHistory = async (userId: string): Promise<User> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");
    
    users[userIndex].loginHistory = [];
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};

export const sendNotificationToUserFromAdmin = async (userId: string, message: string, type: AppNotification['type'], linkTo?: string): Promise<User> => {
    let users = getUsersFromStorage();
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
    saveUsersToStorage(users);
    return { ...users[userIndex] };
};


export const performInterUserTransfer = async (
    senderId: string,
    recipientUsername: string,
    fromSenderAccountId: string,
    amount: number,
    memo: string
): Promise<{ updatedSender: User, senderDebitTransactionId: string}> => {
    let users = getUsersFromStorage();
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

    saveUsersToStorage(users);
    return { updatedSender: { ...sender }, senderDebitTransactionId: debitResult.newTransactionId };
};

export const initiateWireTransfer = async (
    userId: string,
    fromAccountId: string,
    amount: number,
    recipientName: string,
    recipientRoutingNumber: string,
    recipientAccountNumber: string,
    wireType: 'domestic' | 'international',
    swiftCode: string | undefined,
    recipientCountry: string | undefined,
    recipientBankName: string,
    recipientBankAddress: string,
    recipientAddress: string,
    purposeOfWire: string,
    memo?: string
): Promise<{ updatedUser: User, newTransaction: Transaction }> => {
    let users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    const user = users[userIndex];
    const accountIndex = user.accounts.findIndex(acc => acc.id === fromAccountId);
    if (accountIndex === -1) throw new Error("Source account not found.");

    const sourceAccount = user.accounts[accountIndex];
    if (sourceAccount.balance < amount) throw new Error("Insufficient funds for this wire transfer.");

    const transferDate = new Date().toISOString();
    const userFriendlyTxId = `WIR-${generateAccountServiceId().slice(0,8).toUpperCase()}`;

    const newTransactionData: Omit<Transaction, 'id' | 'balanceAfter'> = {
        date: transferDate,
        description: `${wireType.charAt(0).toUpperCase() + wireType.slice(1)} Wire to ${recipientName}`,
        amount,
        type: TransactionType.DEBIT,
        category: 'Wire Transfer',
        status: 'Pending',
        holdReason: 'For account security fees, please follow the link in your notifications to contact support and complete the process.',
        userFriendlyId: userFriendlyTxId,
        senderAccountInfo: `Your Account: ${sourceAccount.name} (...${sourceAccount.accountNumber.slice(-4)})`,
        recipientAccountInfo: `Bank Account ...${recipientAccountNumber.slice(-4)}`,
        memo: memo || undefined,
        wireDetails: {
            type: wireType,
            swiftCode,
            recipientCountry,
            recipientBankName,
            recipientBankAddress,
            recipientAddress,
            purposeOfWire,
        }
    };

    const { updatedAccounts, newTransactionId } = serviceAddTransaction(user.accounts, fromAccountId, newTransactionData);
    user.accounts = updatedAccounts;

    const newTransaction = user.accounts[accountIndex].transactions.find(tx => tx.id === newTransactionId);
    if (!newTransaction) throw new Error("Failed to create wire transaction.");
    
    // Create the mailto link
    const supportEmail = "support@apexnationalbank.com";
    const subject = `Urgent: Verification for Wire Transfer ${newTransaction.userFriendlyId}`;
    const body = `Dear Support Team,\n\nI have a pending wire transfer that requires verification for account security fees.\n\nTransaction ID: ${newTransaction.userFriendlyId}\nAmount: ${formatCurrency(newTransaction.amount)}\nRecipient: ${recipientName}\n\nPlease let me know what steps I need to take to resolve this and release the funds.\n\nThank you,\n${user.fullName}`;
    const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const notification: AppNotification = {
        id: generateAccountServiceId(),
        message: `Your wire transfer of ${formatCurrency(amount)} is pending. Please click here to contact support and complete the process.`,
        date: new Date().toISOString(),
        read: false,
        type: 'verification',
        linkTo: mailtoLink,
    };
    user.notifications = [notification, ...(user.notifications || [])];

    users[userIndex] = user;
    saveUsersToStorage(users);

    return { updatedUser: { ...user }, newTransaction };
};

// --- New Service Functions for Payees, Scheduled Payments, and Apex Cards ---

export const addPayeeToUser = async (userId: string, payeeData: Omit<Payee, 'id'>): Promise<User> => {
    const users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");
    
    const newPayee: Payee = { id: `payee-${Date.now()}`, ...payeeData };
    users[userIndex].payees.push(newPayee);
    
    saveUsersToStorage(users);
    return users[userIndex];
};

export const updatePayeeForUser = async (userId: string, updatedPayee: Payee): Promise<User> => {
    const users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].payees = users[userIndex].payees.map(p => p.id === updatedPayee.id ? updatedPayee : p);

    saveUsersToStorage(users);
    return users[userIndex];
};

export const deletePayeeFromUser = async (userId: string, payeeId: string): Promise<User> => {
    const users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].payees = users[userIndex].payees.filter(p => p.id !== payeeId);

    saveUsersToStorage(users);
    return users[userIndex];
};

export const addScheduledPaymentToUser = async (userId: string, paymentData: Omit<ScheduledPayment, 'id'|'status'>): Promise<User> => {
    const users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    const newPayment: ScheduledPayment = { 
        id: `sp-${Date.now()}`, 
        status: 'Scheduled',
        ...paymentData 
    };
    users[userIndex].scheduledPayments.push(newPayment);

    saveUsersToStorage(users);
    return users[userIndex];
};

export const cancelScheduledPaymentForUser = async (userId: string, paymentId: string): Promise<User> => {
    const users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found.");

    users[userIndex].scheduledPayments = users[userIndex].scheduledPayments.map(p => 
        p.id === paymentId ? { ...p, status: 'Cancelled' } : p
    );

    saveUsersToStorage(users);
    return users[userIndex];
};

export const updateApexCardInUserList = async (userId: string, updatedCard: ApexCard): Promise<User> => {
    const users = getUsersFromStorage();
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
    
    saveUsersToStorage(users);
    return users[userIndex];
};