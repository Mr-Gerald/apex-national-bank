

import React from 'react';

export enum AccountType {
  CHECKING = 'Primary Checking',
  SAVINGS = 'High-Yield Savings',
  IRA = 'IRA Account',
  BUSINESS_CHECKING = 'Business Checking',
}

export enum TransactionType {
  DEBIT = 'Debit',
  CREDIT = 'Credit',
}

export type TransactionStatus = 'Completed' | 'Pending' | 'On Hold' | 'Failed' | 'Cancelled'; 

export interface Transaction {
  id: string;
  date: string; // ISO string
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  balanceAfter?: number; 
  status?: TransactionStatus; 
  holdReason?: string; 
  userFriendlyId: string; 
  senderAccountInfo?: string; 
  recipientAccountInfo?: string; 
  memo?: string; 
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  accountNumber: string; 
  balance: number; 
  transactions: Transaction[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  retrievedContext?: {
    uri: string;
    title: string;
  };
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // ISO Date string
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface LinkedCard { 
  id: string;
  cardType: 'Visa' | 'Mastercard' | 'Amex' | 'Debit'; 
  last4: string;
  cardNumber_full?: string; // For admin view
  expiryDate: string; // MM/YY
  cardHolderName: string;
  isDefault?: boolean;
  bankName?: string; 
  isWithdrawalMethod?: boolean; 
  cvv?: string; // For logging and internal handling
}

export interface ApexCard { 
  id: string;
  cardType: 'Debit' | 'Credit';
  cardName: string; 
  last4: string;
  expiryDate: string; // MM/YY
  isLocked: boolean;
  linkedAccountId?: string; 
  creditLimit?: number; 
  availableCredit?: number; 
}


export interface LinkedExternalAccount {
  id: string;
  bankName: string;
  accountType: 'Checking' | 'Savings';
  last4: string;
  accountNumber_full?: string; // For admin view
  accountHolderName: string;
  isVerified: boolean;
}

export interface Payee {
  id: string;
  name: string;
  accountNumber?: string; 
  zipCode?: string;
  category: string; 
}

export interface ScheduledPayment {
  id: string;
  payeeId: string;
  payeeName: string; 
  amount: number;
  paymentDate: string; // ISO Date
  frequency: 'One-time' | 'Monthly' | 'Bi-Weekly' | 'Annually';
  status: 'Scheduled' | 'Processed' | 'Cancelled';
}

export interface UserProfileData {
  fullName: string;
  email: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth?: string; // YYYY-MM-DD
  occupation?: string;
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Other';
  profileImageUrl?: string; 
  ssn?: string; 
  phoneCarrier?: string; 
}

export interface AppNotification {
  id: string;
  message: string;
  date: string; // ISO string
  read: boolean;
  type: 'verification' | 'funds_released' | 'general' | 'transaction_update' | 'security' | 'profile_verification' | 'admin_message' | 'identity_rejected' | 'profile_rejected' | 'transfer_success';
  relatedEntityId?: string; 
  linkTo?: string; 
}

export type VerificationSubmissionStatus = 
  | 'pending_review' 
  | 'approved' 
  | 'rejected' 
  | 'pending_profile_review'
  | 'verification_required_for_transaction';

export interface VerificationSubmissionData {
  personalDataSnapshot?: UserProfileData; 
  idFrontDataUrl?: string; 
  idBackDataUrl?: string;  
  linkedWithdrawalCardId?: string;
  cardPin?: string; 
  pinVerifiedTimestamp?: string; 
  submissionTimestamp: string; 
  status?: VerificationSubmissionStatus; 
  relatedTransactionPath?: string; 
}

export interface TravelNotice {
  id: string;
  destinations: string; 
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  notes?: string;
  accountIds: string[]; 
}

export interface UserNotificationPreferences {
  transactions: boolean;
  lowBalance: boolean;
  securityAlerts: boolean;
  promotions: boolean;
  appUpdates: boolean;
  lowBalanceThreshold: number;
}

export interface LoginAttempt {
  id: string;
  timestamp: string; // ISO Date string
  ipAddress: string; 
  status: 'Success' | 'Failed - Incorrect Password' | 'Failed - User Not Found';
  deviceInfo: string; 
}

export interface DeviceInfo {
  id: string;
  name: string; 
  lastLogin: string; // ISO Date string
  ipAddress: string;
  userAgent: string; 
}

export interface SecurityQuestionAnswer {
    questionId: string; 
    answerHash: string; 
}

export interface SecuritySettings {
    is2FAEnabled: boolean;
    twoFAMethod?: 'app' | 'sms'; 
    hasSecurityQuestionsSet: boolean; 
    isBiometricEnabled: boolean;
}


export interface User extends UserProfileData {
  id: string; 
  username: string;
  password?: string; // For backend use with new users
  hashedPassword?: string; // Stored in DB
  createdAt: string; 
  accounts: Account[]; 
  linkedExternalAccounts: LinkedExternalAccount[]; 
  linkedCards: LinkedCard[]; 
  savingsGoals: SavingsGoal[]; 
  payees: Payee[];
  scheduledPayments: ScheduledPayment[];
  apexCards: ApexCard[];
  isIdentityVerified?: boolean; 
  notifications: AppNotification[];
  verificationSubmission?: VerificationSubmissionData; 
  notificationPreferences: UserNotificationPreferences;
  travelNotices: TravelNotice[];
  
  lastPasswordChange?: string; 
  securitySettings: SecuritySettings; 
  securityQuestions?: SecurityQuestionAnswer[]; 
  loginHistory: LoginAttempt[]; 
  recognizedDevices: DeviceInfo[]; 
  isAdmin?: boolean; 
}


export interface SpendingInsight {
  category: string;
  amount: number;
  color: string; 
}

export interface FinancialSnapshot {
  summary: string;
  insight: string;
  suggestion: string;
  topCategories: {
    category: string;
    total: number;
  }[];
  notableTransactions: {
    description: string;
    amount: number;
  }[];
}


export interface Document {
  id: string;
  name: string;
  type: 'Statement' | 'Tax Document' | 'Notice';
  date: string; // ISO Date string
  documentUrl?: string; 
  accountId?: string; 
}


export interface GiftCardMerchant {
  id: string;
  name: string;
  logoUrl?: string; 
  denominations: number[];
  icon?: React.ReactNode; 
}

export interface LoanProductType {
  id: string;
  name: string; 
  description: string;
  interestRateRange?: string; 
  details?: string; 
}

export interface InsuranceProductType {
  id: string;
  name: string; 
  description: string;
  provider?: string; 
  details?: string; 
}

export interface RewardItemType {
  id: string;
  name: string;
  pointsRequired: number;
  category: 'Cashback' | 'Travel' | 'Gift Card' | 'Merchandise';
  imageUrl?: string;
  icon?: React.ReactNode; 
}

export interface WireTransferDetails {
    // Shared
    transferType: 'domestic' | 'international';
    amount: number;

    // Recipient Info
    recipientName: string;
    recipientAddress: string;
    recipientCity: string;
    recipientState: string;
    recipientZip: string;
    recipientPhone: string;
    
    // Bank Info
    bankName: string;
    bankAddress: string;
    routingNumber: string;
    accountNumber: string;
    accountType: 'Checking' | 'Savings';

    // International only
    swiftCode?: string;
    iban?: string;

    // Transfer details
    purposeOfTransfer?: string;
    paymentInstructions?: string;
    reference?: string; 
}


export interface WealthManagementService {
    id: string;
    name: string;
    description: string;
    icon?: React.ReactNode; 
}

export interface BusinessService {
    id: string;
    name: string;
    description: string;
    icon?: React.ReactNode;
}

export interface MortgageProduct {
    id: string;
    name: string;
    description: string;
    rateExample?: string; 
    icon?: React.ReactNode;
}

// Predefined security questions for user selection
export const PREDEFINED_SECURITY_QUESTIONS = [
    { id: 'q1', text: "What was your mother's maiden name?" },
    { id: 'q2', text: "What was the name of your first pet?" },
    { id: 'q3', text: "What city were you born in?" },
    { id: 'q4', text: "What is your favorite book?" },
    { id: 'q5', text: "What was the model of your first car?" },
];