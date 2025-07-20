
import { Account, Transaction, AccountType, TransactionType } from '../types';

// Helper to generate a unique ID
export const generateNewId = (): string => Math.random().toString(36).substring(2, 15);

export const generateRandomAccountNumber = (length: number = 12): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
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