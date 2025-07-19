
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AccountCard from '../components/AccountCard';
import TransactionListItem from '../components/TransactionListItem';
import Button from '../components/Button';
import { useAccounts } from '../contexts/AccountContext';
import { useAuth } from '../contexts/AuthContext';
import { TransactionType, FinancialSnapshot } from '../types'; 
import { formatCurrency } from '../utils/formatters';
import { GoogleGenAI } from '@google/genai';
import { 
    PlusCircleIcon, ArrowPathIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, CameraIcon, StarIcon,
    GiftIcon, CurrencyDollarIcon, ShieldCheckIcon, TrophyIcon, SparklesIcon, InformationCircleIcon
} from '../constants';

const API_KEY = process.env.API_KEY;

const DashboardScreen: React.FC = () => {
  const { loading: accountsLoading, error: accountsError } = useAccounts(); 
  const { user } = useAuth();
  
  const [snapshot, setSnapshot] = useState<FinancialSnapshot | null>(null);
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);


  if (accountsLoading || !user) return <div className="p-4 text-center">Loading dashboard data...</div>;
  if (accountsError) return <div className="p-4 text-center text-red-500">{accountsError}</div>;

  const totalBalance = user.accounts.reduce((sum, acc) => sum + acc.balance, 0); 
  
  let recentTransactions = user.accounts
    .flatMap(acc => acc.transactions.map(tx => ({ ...tx, accountName: acc.name, accountId: acc.id })))
    .filter(tx => !(tx.description.toLowerCase() === 'account opened' && tx.amount === 0))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);


  const handleGenerateSnapshot = async () => {
      if (!API_KEY) {
        setSnapshotError("This AI feature is currently unavailable due to a missing API key configuration.");
        return;
      }
      setIsSnapshotLoading(true);
      setSnapshotError(null);
      setSnapshot(null);

      try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentSpendingTransactions = user.accounts
            .flatMap(acc => acc.transactions)
            .filter(tx => tx.type === TransactionType.DEBIT && new Date(tx.date) > thirtyDaysAgo)
            .map(tx => ({
                description: tx.description,
                amount: tx.amount,
                category: tx.category
            }));
        
        if (recentSpendingTransactions.length < 3) {
            setSnapshotError("Not enough recent transaction data to generate a meaningful snapshot. Please check back later.");
            setIsSnapshotLoading(false);
            return;
        }

        const prompt = `
            Analyze the following list of transactions from a user's bank account for the last 30 days.
            Based on this data, provide a financial snapshot.
            The user's name is ${user.fullName}.

            Transactions:
            ${JSON.stringify(recentSpendingTransactions, null, 2)}

            Your task is to return a JSON object with the following structure:
            {
              "summary": "A very brief, one-sentence summary of the user's spending habit (e.g., 'Your spending is focused on essentials with some discretionary spending on dining.')",
              "insight": "A single, interesting insight. This should be a factual observation from the data (e.g., 'Your largest spending category this month was 'Groceries'.').",
              "suggestion": "A single, actionable, and encouraging financial suggestion based on the data (e.g., 'You're doing great with savings! Consider creating a 'Dining Out' budget to track that category more closely.').",
              "topCategories": [
                { "category": "Name of the top spending category", "total": sum_of_spending_in_that_category_as_number },
                { "category": "Name of the 2nd top spending category", "total": sum_of_spending_in_that_category_as_number },
                { "category": "Name of the 3rd top spending category", "total": sum_of_spending_in_that_category_as_number }
              ],
              "notableTransactions": [
                { "description": "Description of the single largest transaction", "amount": amount_of_that_transaction_as_number },
                { "description": "Description of another high-value or unusual transaction", "amount": amount_of_that_transaction_as_number }
              ]
            }

            Rules:
            - Provide exactly the JSON structure specified.
            - Keep all text concise and easy to read.
            - Ensure all monetary values are numbers, not strings.
            - Do not include any text, notes or markdown outside of the main JSON object.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }

        const parsedData: FinancialSnapshot = JSON.parse(jsonStr);
        setSnapshot(parsedData);

      } catch (e) {
          console.error("AI Snapshot Error:", e);
          setSnapshotError("Sorry, I couldn't generate the snapshot right now. Please try again later.");
      } finally {
          setIsSnapshotLoading(false);
      }
  };


  return (
    <div className="p-4 space-y-6">
      {/* User Greeting and Total Balance Summary */}
      <div className="bg-gradient-to-br from-primary to-blue-700 text-white p-5 rounded-xl shadow-lg">
        <p className="text-lg opacity-90">Hello, {user.fullName || 'Valued Customer'}!</p>
        <p className="text-sm opacity-70 mt-2">Total Available Balance</p>
        <p className="text-4xl font-bold mt-1 tracking-tight">{formatCurrency(totalBalance)}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
            <Link to="/transfer">
                <Button variant="ghost" size="sm" className="bg-white/15 hover:bg-white/25 text-white w-full py-2.5">
                    <ArrowPathIcon className="w-4 h-4 mr-1.5" /> Transfer
                </Button>
            </Link>
             <Link to="/deposit">
                <Button variant="ghost" size="sm" className="bg-white/15 hover:bg-white/25 text-white w-full py-2.5">
                    <ArrowDownTrayIcon className="w-4 h-4 mr-1.5" /> Deposit
                </Button>
            </Link>
        </div>
      </div>

      {/* Explore Our Services Section */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-800 mb-3">Explore Our Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ServiceLinkButton icon={<ArrowUpTrayIcon className="w-6 h-6" />} label="Pay Bills" to="/pay-bills" />
            <ServiceLinkButton icon={<PlusCircleIcon className="w-6 h-6" />} label="Add Account" to="/add-account-options" />
            <ServiceLinkButton icon={<CameraIcon className="w-6 h-6" />} label="Mobile Deposit" to="/deposit/check" />
            <ServiceLinkButton icon={<StarIcon className="w-6 h-6" />} label="Savings Goals" to="/profile/savings-goals" />
            <ServiceLinkButton icon={<GiftIcon className="w-6 h-6"/>} label="Gift Cards" to="/products/gift-cards" />
            <ServiceLinkButton icon={<CurrencyDollarIcon className="w-6 h-6"/>} label="Apply for Loan" to="/products/loans" />
            <ServiceLinkButton icon={<ShieldCheckIcon className="w-6 h-6"/>} label="Insurance" to="/products/insurance" />
            <ServiceLinkButton icon={<TrophyIcon className="w-6 h-6"/>} label="My Rewards" to="/user/rewards" />
        </div>
      </div>
      
      {/* Account Overviews */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-800 mb-3">Your Accounts</h2>
        {(user.accounts && user.accounts.length > 0) ? (
          user.accounts.map(account => <AccountCard key={account.id} account={account} />)
        ) : (
          <p className="text-neutral-500 bg-white p-4 rounded-lg shadow">No accounts found. You can add one!</p>
        )}
      </div>

      {/* AI Financial Snapshot */}
      <div className="bg-white p-4 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
                <SparklesIcon className="w-7 h-7 text-primary"/>
                <h3 className="text-lg font-semibold text-neutral-700">Your AI Financial Snapshot</h3>
            </div>
            <Button size="sm" variant="outline" onClick={handleGenerateSnapshot} isLoading={isSnapshotLoading}>
                {snapshot ? 'Regenerate' : 'Generate'}
            </Button>
        </div>
        
        {isSnapshotLoading && <p className="text-center text-primary p-4">Analyzing your recent activity...</p>}
        {snapshotError && <p className="text-center text-red-500 p-4">{snapshotError}</p>}
        
        {snapshot ? (
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-neutral-600">Summary</h4>
                    <p className="text-sm text-neutral-800">{snapshot.summary}</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                    <h4 className="font-semibold text-accent-700">Suggestion</h4>
                    <p className="text-sm text-neutral-800">{snapshot.suggestion}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-neutral-600 mb-1">Top Spending Categories</h4>
                        <ul className="space-y-1 text-sm">
                            {snapshot.topCategories.map((cat, index) => (
                                <li key={index} className="flex justify-between">
                                    <span>{cat.category}</span>
                                    <span className="font-medium">{formatCurrency(cat.total)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-neutral-600 mb-1">Notable Transactions</h4>
                        <ul className="space-y-1 text-sm">
                            {snapshot.notableTransactions.map((tx, index) => (
                                <li key={index} className="flex justify-between">
                                    <span className="truncate pr-2">{tx.description}</span>
                                    <span className="font-medium">{formatCurrency(tx.amount)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <p className="text-xs text-neutral-400 text-center pt-2 border-t">This AI-generated snapshot is for informational purposes only and is not financial advice.</p>
            </div>
        ) : (
            !isSnapshotLoading && !snapshotError && (
                <p className="text-center text-neutral-500 p-4">Click "Generate" to get a personalized summary of your recent financial activity.</p>
            )
        )}
      </div>

      
      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-neutral-800">Recent Activity</h2>
            {user.accounts && user.accounts.length > 0 && recentTransactions.length > 0 && (
                <Link 
                    to={user.accounts.find(acc => acc.type === 'Primary Checking')?.id ? `/accounts/${user.accounts.find(acc => acc.type === 'Primary Checking')?.id}` : (user.accounts[0] ? `/accounts/${user.accounts[0].id}` : '/accounts')} 
                    className="text-sm text-primary hover:underline font-medium"
                >
                    View All
                </Link>
            )}
        </div>
        {recentTransactions.length > 0 ? (
          <ul className="bg-white rounded-lg shadow divide-y divide-neutral-200">
            {recentTransactions.map(tx => (
              <TransactionListItem key={tx.id} transaction={tx} />
            ))}
          </ul>
        ) : (
          <p className="text-neutral-500 bg-white p-4 rounded-lg shadow">No recent transactions.</p>
        )}
      </div>

    </div>
  );
};

const ServiceLinkButton: React.FC<{icon: React.ReactNode, label: string, to: string}> = ({ icon, label, to }) => (
  <Link 
      to={to}
      className="flex flex-col items-center justify-center p-3 bg-neutral-100 hover:bg-neutral-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-neutral-700 hover:text-primary space-y-1.5 h-full text-center border border-neutral-200"
  >
      <span className="text-primary">{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
  </Link>
);


export default DashboardScreen;