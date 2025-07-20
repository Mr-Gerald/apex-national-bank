
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Account, Transaction, TransactionType } from '../types';
import { useAuth } from './AuthContext';
import { 
    generateNewId as serviceGenerateNewId, 
    recalculateBalancesForAccount as serviceRecalculateBalances,
    addTransactionToUserAccountList as serviceAddTransaction 
} from '../services/accountService';
import { performInterUserTransfer, initiateWireTransfer as serviceInitiateWireTransfer } from '../services/userService';


interface AccountContextType {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  fetchAccountById: (id: string) => Account | undefined;
  refreshUserAccounts: () => void; 
  initiateTransfer: (fromAccountId: string, toAccountIdOrUsername: string, amount: number, memo: string, recipientUsername?: string) => Promise<string | undefined>;
  initiateWireTransfer: (fromAccountId: string, amount: number, recipientName: string, recipientRoutingNumber: string, recipientAccountNumber: string, wireType: 'domestic' | 'international', swiftCode: string | undefined, recipientCountry: string | undefined, recipientBankName: string, recipientBankAddress: string, recipientAddress: string, purposeOfWire: string, memo?: string) => Promise<Transaction | undefined>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateUserAccountsInContext } = useAuth(); 
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserAccounts = useCallback(() => {
    setLoading(true);
    if (user && user.accounts) {
      const accountsWithCalculatedBalances = user.accounts.map(acc => {
        const newAcc = {...acc, transactions: [...acc.transactions]}; 
        serviceRecalculateBalances(newAcc); 
        return newAcc;
      });
      setAccounts(accountsWithCalculatedBalances);
      setError(null);
    } else {
      setAccounts([]); 
      setError(null); 
    }
    setLoading(false);
  }, [user]);
  
  useEffect(() => {
    loadUserAccounts();
  }, [loadUserAccounts]); 

  const fetchAccountById = (id: string): Account | undefined => {
    return accounts.find(acc => acc.id === id);
  };

  const refreshUserAccounts = useCallback(() => { 
    loadUserAccounts(); 
  }, [loadUserAccounts]);

  const initiateTransfer = async (fromAccountId: string, toAccountIdOrUsername: string, amount: number, memo: string, recipientUsername?: string): Promise<string | undefined> => {
    if (!user) {
      throw new Error("User not authenticated for transfer.");
    }
    setLoading(true);
    setError(null);

    try {
      if (recipientUsername) { // Inter-user transfer
        const { updatedSender, senderDebitTransactionId } = await performInterUserTransfer(user.id, recipientUsername, fromAccountId, amount, memo);
        if (updateUserAccountsInContext) { 
            await updateUserAccountsInContext(updatedSender.accounts); 
        }
        refreshUserAccounts(); 
        return senderDebitTransactionId;

      } else { // Intra-user transfer (to another of the logged-in user's accounts)
        const currentAccountsState = JSON.parse(JSON.stringify(user.accounts)) as Account[];
        
        const fromAccountIndex = currentAccountsState.findIndex(acc => acc.id === fromAccountId);
        const toAccountIndex = currentAccountsState.findIndex(acc => acc.id === toAccountIdOrUsername);

        if (fromAccountIndex === -1 || toAccountIndex === -1) {
          throw new Error("One or both accounts not found for internal transfer.");
        }
        
        const fromAccount = currentAccountsState[fromAccountIndex];
        const toAccount = currentAccountsState[toAccountIndex];

        if (fromAccount.balance < amount) {
          throw new Error("Insufficient funds for transfer.");
        }

        const transferDate = new Date().toISOString();
        const userFriendlyTxId = `TXN-${serviceGenerateNewId().slice(0,8).toUpperCase()}`;

        const debitTransactionData: Omit<Transaction, 'id' | 'balanceAfter'> = {
          date: transferDate,
          description: `Transfer to ${toAccount.name} (...${toAccount.accountNumber.slice(-4)})${memo ? ` - ${memo}` : ''}`,
          amount: amount,
          type: TransactionType.DEBIT,
          category: 'Transfer',
          status: 'Completed', 
          userFriendlyId: userFriendlyTxId,
          senderAccountInfo: `Your Account: ${fromAccount.name} (...${fromAccount.accountNumber.slice(-4)})`,
          recipientAccountInfo: `Your Account: ${toAccount.name} (...${toAccount.accountNumber.slice(-4)})`,
        };
        
        const creditTransactionData: Omit<Transaction, 'id' | 'balanceAfter'> = {
          date: transferDate,
          description: `Transfer from ${fromAccount.name} (...${fromAccount.accountNumber.slice(-4)})${memo ? ` - ${memo}` : ''}`,
          amount: amount,
          type: TransactionType.CREDIT,
          category: 'Transfer',
          status: 'Completed',
          userFriendlyId: userFriendlyTxId,
          senderAccountInfo: `Your Account: ${fromAccount.name} (...${fromAccount.accountNumber.slice(-4)})`,
          recipientAccountInfo: `Your Account: ${toAccount.name} (...${toAccount.accountNumber.slice(-4)})`,
        };
        
        const debitTxResult = serviceAddTransaction(currentAccountsState, fromAccount.id, debitTransactionData);
        const accountsAfterDebit = debitTxResult.updatedAccounts;
        const debitTransactionId = debitTxResult.newTransactionId; 

        const creditTxResult = serviceAddTransaction(accountsAfterDebit, toAccount.id, creditTransactionData);
        const accountsAfterCredit = creditTxResult.updatedAccounts;

        await updateUserAccountsInContext(accountsAfterCredit);
        refreshUserAccounts(); 
        return debitTransactionId;
      }
    } catch (e: any) {
      console.error("Transfer failed:", e);
      setError(e.message || "Transfer failed. Please try again.");
      throw e; 
    } finally {
      setLoading(false);
    }
  };

  const initiateWireTransfer = async (fromAccountId: string, amount: number, recipientName: string, recipientRoutingNumber: string, recipientAccountNumber: string, wireType: 'domestic' | 'international', swiftCode: string | undefined, recipientCountry: string | undefined, recipientBankName: string, recipientBankAddress: string, recipientAddress: string, purposeOfWire: string, memo?: string): Promise<Transaction | undefined> => {
    if (!user) {
      throw new Error("User not authenticated for wire transfer.");
    }
    setLoading(true);
    setError(null);
    try {
      const { updatedUser, newTransaction } = await serviceInitiateWireTransfer(
          user.id, fromAccountId, amount, recipientName, recipientRoutingNumber, recipientAccountNumber, 
          wireType, swiftCode, recipientCountry, recipientBankName, recipientBankAddress, recipientAddress, purposeOfWire, memo
      );
      if (updateUserAccountsInContext) {
          await updateUserAccountsInContext(updatedUser.accounts);
      }
      refreshUserAccounts();
      return newTransaction;
    } catch (e: any) {
      console.error("Wire transfer failed:", e);
      setError(e.message || "Wire transfer failed. Please try again.");
      throw e;
    } finally {
      setLoading(false);
    }
  };


  return (
    <AccountContext.Provider value={{ accounts, loading, error, fetchAccountById, refreshUserAccounts, initiateTransfer, initiateWireTransfer }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = (): AccountContextType => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
};