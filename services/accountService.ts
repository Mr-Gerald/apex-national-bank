
import { Account, Transaction, AccountType, TransactionType } from '../types';

// Helper to generate a unique ID
export const generateNewId = (): string => Math.random().toString(36).substring(2, 15);

// Helper to create date strings
const createDateISO = (year: number, month: number, day: number, hour = 0, minute = 0, second = 0): string => {
  return new Date(year, month - 1, day, hour, minute, second).toISOString();
};

export const generateRandomAccountNumber = (length: number = 12): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
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
           id: generateNewId(), date: incomeDate, description: 'Direct Deposit - Employer',
           amount: incomeAmount, type: TransactionType.CREDIT, category: 'Income', status: 'Completed',
           userFriendlyId: `TXN-${generateNewId().slice(0,8).toUpperCase()}`,
         });
         balance += incomeAmount;
         if (new Date(incomeDate) > maxHistoricalDate) maxHistoricalDate = new Date(incomeDate);
        }
        if (year > startYear && month % 5 === 0 && Math.random() > 0.6) { 
            const bonusAmount = Math.floor(Math.random() * 15000) + 5000;
            const bonusDate = createDateISO(year, month, Math.floor(Math.random() * 10) + 10, Math.floor(Math.random()*6)+9);
            transactions.push({
              id: generateNewId(), date: bonusDate, description: 'Annual Performance Bonus',
              amount: bonusAmount, type: TransactionType.CREDIT, category: 'Bonus', status: 'Completed',
              userFriendlyId: `TXN-${generateNewId().slice(0,8).toUpperCase()}`,
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
            id: generateNewId(), date: paymentDate, description: `Client Payment - ${['Alpha Corp', 'Beta LLC', 'Gamma Solutions'][k%3]}`,
            amount: incomeAmount, type: TransactionType.CREDIT, category: 'Revenue', status: 'Completed',
            userFriendlyId: `TXN-${generateNewId().slice(0,8).toUpperCase()}`,
            });
            balance += incomeAmount;
            if (new Date(paymentDate) > maxHistoricalDate) maxHistoricalDate = new Date(paymentDate);
        }
        if (year > startYear && month % 7 === 0 && Math.random() > 0.5) { 
            const contractAmount = Math.floor(Math.random() * 150000) + 50000;
            const contractDate = createDateISO(year, month, Math.floor(Math.random() * 15) + 5, Math.floor(Math.random()*6)+9);
            transactions.push({
              id: generateNewId(), date: contractDate, description: 'Major Contract Payout - Project Phoenix',
              amount: contractAmount, type: TransactionType.CREDIT, category: 'Contract Revenue', status: 'Completed',
              userFriendlyId: `TXN-${generateNewId().slice(0,8).toUpperCase()}`,
            });
            balance += contractAmount;
            if (new Date(contractDate) > maxHistoricalDate) maxHistoricalDate = new Date(contractDate);
        }
      } else if (accountType === AccountType.SAVINGS) {
        const interestAmount = Math.floor(balance * (0.0012 + Math.random() * 0.0020)); 
        if (interestAmount > 1) {
            const interestDate = createDateISO(year, month, 28, Math.floor(Math.random()*6)+9);
            transactions.push({
            id: generateNewId(), date: interestDate, description: 'Interest Earned',
            amount: interestAmount, type: TransactionType.CREDIT, category: 'Interest', status: 'Completed',
            userFriendlyId: `TXN-${generateNewId().slice(0,8).toUpperCase()}`,
            });
            balance += interestAmount;
            if (new Date(interestDate) > maxHistoricalDate) maxHistoricalDate = new Date(interestDate);
        }
         if (year > startYear && month % 8 === 0 && Math.random() > 0.6) { 
            const largeDeposit = Math.floor(Math.random() * 75000) + 25000;
            const depositDate = createDateISO(year, month, Math.floor(Math.random() * 10) + 1, Math.floor(Math.random()*6)+9);
            transactions.push({
              id: generateNewId(), date: depositDate, description: 'Investment Portfolio Dividend',
              amount: largeDeposit, type: TransactionType.CREDIT, category: 'Investment', status: 'Completed',
              userFriendlyId: `TXN-${generateNewId().slice(0,8).toUpperCase()}`,
            });
            balance += largeDeposit;
            if (new Date(depositDate) > maxHistoricalDate) maxHistoricalDate = new Date(depositDate);
        }
      } else if (accountType === AccountType.IRA) {
        if (month === 1 || (month === 7 && year > startYear)) { 
            const contributionAmount = Math.floor(Math.random() * (10000 - 4000 +1)) + 4000;
            const contributionDate = createDateISO(year, month, Math.floor(Math.random() * 10) + 5, Math.floor(Math.random()*6)+9);
             transactions.push({
                id: generateNewId(), date: contributionDate, description: 'IRA Contribution',
                amount: contributionAmount, type: TransactionType.CREDIT, category: 'Contribution', status: 'Completed',
                userFriendlyId: `TXN-${generateNewId().slice(0,8).toUpperCase()}`,
            });
            balance += contributionAmount;
            if (new Date(contributionDate) > maxHistoricalDate) maxHistoricalDate = new Date(contributionDate);
        }
        const marketFluctuation = balance * ( (Math.random() - 0.40) * 0.15 ); 
        if (Math.abs(marketFluctuation) > 100) {
             const marketDate = createDateISO(year, month, Math.floor(Math.random() * 5) + 20, Math.floor(Math.random()*6)+10);
             transactions.push({
                id: generateNewId(), date: marketDate, description: marketFluctuation > 0 ? 'Market Gains Investment' : 'Market Fluctuation Loss',
                amount: Math.abs(marketFluctuation), type: marketFluctuation > 0 ? TransactionType.CREDIT : TransactionType.DEBIT, category: 'Investment', status: 'Completed',
                userFriendlyId: `TXN-${generateNewId().slice(0,8).toUpperCase()}`,
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
          id: generateNewId(), date: expenseDate, 
          description: category === 'Online Subscription' ? `Subscription - ${['Zenith Streaming', 'Apex Pro Tools', 'NewsNow'][Math.floor(Math.random()*3)]}` : `${category}`,
          amount: amount, type: TransactionType.DEBIT, category: category, status: 'Completed',
          userFriendlyId: `TXN-${generateNewId().slice(0,8).toUpperCase()}`,
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
          id: generateNewId(), date: adjustmentDate.toISOString(),
          description: `Historical Balance Adjustment (${accountType})`,
          amount: Math.abs(diffFromTarget), 
          type: diffFromTarget > 0 ? TransactionType.CREDIT : TransactionType.DEBIT, 
          category: "Adjustment", status: 'Completed',
          userFriendlyId: `TXN-${generateNewId().slice(0,8).toUpperCase()}`,
      });
      balance += diffFromTarget;
      // No need to update maxHistoricalDate here as this adjustment is older
  }

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return { transactions, finalBalanceBeforeLatestIncome: balance, maxHistoricalDate };
};

export const generateInitialAlexAccounts = (): Account[] => {
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
      userFriendlyId: `TXN-${generateNewId().slice(0,8).toUpperCase()}`,
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
                    id: generateNewId(), date: adjDate.toISOString(),
                    description: differenceAlex > 0 ? 'Year-End Interest/Dividend Adjustment' : 'Year-End Fee/Tax Adjustment',
                    amount: Math.abs(differenceAlex), 
                    type: differenceAlex > 0 ? TransactionType.CREDIT : TransactionType.DEBIT,
                    category: 'Adjustment',
                    status: 'Completed',
                    userFriendlyId: `TXN-${generateNewId().slice(0,8).toUpperCase()}`,
                };
                targetAdjustmentAccount.transactions.unshift(adjTransaction); 
            }
        }
    }
    
    alexAccounts.forEach(recalculateBalancesForAccount); 
    return alexAccounts;
};

export const generateInitialAccountsForNewUser = (userIdPrefix: string): Account[] => {
    const today = new Date();
    const checkingTransactions: Transaction[] = [
        { 
            id: generateNewId(), 
            date: createDateISO(today.getFullYear(), today.getMonth()+1, today.getDate(), 9, 0, 0), 
            description: 'Account Opened', 
            amount: 0, 
            type: TransactionType.CREDIT, 
            category: 'System',
            status: 'Completed',
            userFriendlyId: `TXN-SYS-${generateNewId().slice(0,6).toUpperCase()}`, // Ensure distinct userFriendlyId
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


export const recalculateBalancesForAccount = (account: Account): void => {
    if (!account || !account.transactions) return;

    account.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let currentAvailableBalance = 0;
    const chronologicalTransactions = [...account.transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    chronologicalTransactions.forEach(tx => {
        if (tx.status === 'Completed') {
            if (tx.type === TransactionType.CREDIT) {
                currentAvailableBalance += tx.amount;
            } else {
                currentAvailableBalance -= tx.amount;
            }
        }
    });
    account.balance = parseFloat(currentAvailableBalance.toFixed(2));

    let runningBalance = 0;
    // Calculate initial running balance by summing all 'Completed' transactions based on their effect
    chronologicalTransactions.forEach(tx => {
      if (tx.status === 'Completed') {
        runningBalance += (tx.type === TransactionType.CREDIT ? tx.amount : -tx.amount);
      }
    });

    // Now iterate backwards through sorted (most recent first) transactions to set balanceAfter
    // Start with the final calculated availableBalance as the balanceAfter for the latest transaction
    // (or rather, work forwards chronologically and then reverse for the list)
    
    // Alternative: Recalculate balanceAfter for each transaction based on chronological order
    let tempBalance = 0;
    const txWithBalanceAfter = chronologicalTransactions.map(tx => {
        if(tx.status === 'Completed') {
            tempBalance += (tx.type === TransactionType.CREDIT ? tx.amount : -tx.amount);
        }
        return {...tx, balanceAfter: parseFloat(tempBalance.toFixed(2)) };
    });
    
    // Map these calculated balances back to the original (potentially differently sorted) transactions array
    account.transactions = account.transactions.map(originalTx => {
        const foundTx = txWithBalanceAfter.find(calcTx => calcTx.id === originalTx.id);
        return foundTx ? { ...originalTx, balanceAfter: foundTx.balanceAfter } : originalTx;
    });
};


export const addTransactionToUserAccountList = (
    accounts: Account[], 
    accountId: string, 
    transactionData: Omit<Transaction, 'id' | 'balanceAfter'>
): { updatedAccounts: Account[], newTransactionId: string } => { 
    const accountIndex = accounts.findIndex(acc => acc.id === accountId);
    if (accountIndex === -1) {
        console.error(`Account not found for transaction: ${accountId}`);
        return { updatedAccounts: accounts, newTransactionId: `error-acc-not-found-${generateNewId()}` };
    }

    const updatedAccounts = accounts.map((acc, index) => {
        if (index === accountIndex) {
            return {
                ...acc,
                transactions: [...acc.transactions] 
            };
        }
        return acc; 
    });
    
    const targetAccount = updatedAccounts[accountIndex];
    const newTransactionId = generateNewId();

    const newTransaction: Transaction = {
        id: newTransactionId,
        userFriendlyId: transactionData.userFriendlyId || `TXN-${generateNewId().slice(0,8).toUpperCase()}`,
        ...transactionData,
        status: transactionData.status || 'Completed',
        holdReason: transactionData.holdReason,
        senderAccountInfo: transactionData.senderAccountInfo,
        recipientAccountInfo: transactionData.recipientAccountInfo,
        memo: transactionData.memo,
    };
    
    targetAccount.transactions.unshift(newTransaction); 
    recalculateBalancesForAccount(targetAccount); 

    return { updatedAccounts, newTransactionId }; 
};
