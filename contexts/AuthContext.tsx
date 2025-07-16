



import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserProfileData, Account, AccountType, LinkedExternalAccount, LinkedCard, SavingsGoal, Transaction, AppNotification, VerificationSubmissionData, UserNotificationPreferences, TravelNotice, SecuritySettings, SecurityQuestionAnswer, LoginAttempt, DeviceInfo, TransactionStatus, PREDEFINED_SECURITY_QUESTIONS, VerificationSubmissionStatus, Payee, ScheduledPayment, ApexCard, WireTransferDetails } from '../types';
import * as api from '../services/api';
import {
    loginUser as loginUserService,
    registerUser as registerUserService,
    logoutUser as logoutUserService,
    updateUserProfileData as updateUserProfileDataService,
    getCurrentLoggedInUser as getCurrentLoggedInUserService,
    addApexAccountToUser as addApexAccountToUserService,
    updateUserAccountData as updateUserAccountDataService,
    linkExternalBankAccountToUser as linkExternalBankAccountToUserService,
    unlinkExternalBankAccountFromUser as unlinkExternalBankAccountFromUserService,
    linkExternalCardToUser as linkExternalCardToUserService,
    unlinkExternalCardFromUser as unlinkExternalCardFromUserService,
    updateExternalCardInUserList as updateExternalCardInUserListService,
    addSavingsGoalToUser as addSavingsGoalToUserService,
    updateSavingsGoalForUser as updateSavingsGoalForUserService,
    deleteSavingsGoalFromUser as deleteSavingsGoalFromUserService,
    markUserAsIdentityVerified as markUserAsIdentityVerifiedService,
    updateTransactionStatusForUser as updateTransactionStatusForUserService,
    markNotificationAsRead as markNotificationAsReadService,
    markAllNotificationsAsRead as markAllNotificationsAsReadService,
    saveUserVerificationIdImages as saveUserVerificationIdImagesService,
    finalizeVerificationSubmission as finalizeUserVerificationSubmissionService, 
    updateUserNotificationPreferences as updateUserNotificationPreferencesService,
    addTravelNoticeToUser as addTravelNoticeToUserService,
    changeUserPassword as changeUserPasswordService,
    updateUserSecuritySettings as updateUserSecuritySettingsService,
    deleteNotificationFromUser as deleteNotificationFromUserService,
    deleteAllReadNotificationsFromUser as deleteAllReadNotificationsFromUserService,
    clearUserLoginHistory as clearUserLoginHistoryService,
    getAllUsers,
    updateUserById as serviceUpdateUserById, // Renamed to avoid conflict
    sendNotificationToUserFromAdmin as serviceSendNotificationToUserFromAdmin,
    markUserAsIdentityVerified as serviceAdminMarkUserVerifiedContext, // Renamed
    // New service imports
    addPayeeToUser,
    updatePayeeForUser,
    deletePayeeFromUser,
    addScheduledPaymentToUser,
    cancelScheduledPaymentForUser,
    updateApexCardInUserList,
    initiateAchWireTransfer as initiateAchWireTransferService
} from '../services/userService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  isLoginTransition: boolean;
  login: (username?: string, password?: string) => Promise<void>;
  register: (username: string, password_plain: string, profileData: Omit<UserProfileData, 'profileImageUrl'| 'ssn' | 'phoneCarrier'>) => Promise<User>;
  requestLogout: () => void;
  executeLogout: () => Promise<void>;
  requestAdminLogout: () => void;
  adminLogout: () => Promise<void>;
  updateUserProfile: (updatedProfileData: Partial<UserProfileData>) => Promise<void>;
  authError: string | null;
  addApexAccount: (newAccountData: Pick<Account, 'name' | 'type'> & { initialBalance?: number }) => Promise<Account | null>;
  updateUserAccountsInContext: (updatedAccounts: Account[]) => Promise<void>;
  linkExternalAccount: (accountData: Omit<LinkedExternalAccount, 'id' | 'isVerified'> & { routingNumber?: string }) => Promise<void>;
  unlinkExternalAccount: (externalAccountId: string) => Promise<void>;
  linkExternalCard: (cardData: Omit<LinkedCard, 'id'> & { cvv?: string }) => Promise<LinkedCard>;
  unlinkExternalCard: (cardId: string) => Promise<void>;
  updateExternalCard: (updatedCard: LinkedCard) => Promise<void>;
  addSavingsGoal: (goalData: Omit<SavingsGoal, 'id'>) => Promise<void>;
  updateSavingsGoal: (updatedGoal: SavingsGoal) => Promise<void>;
  deleteSavingsGoal: (goalId: string) => Promise<void>;
  markUserAsVerified: (isProfileVerification: boolean, isAdminAction: boolean) => Promise<void>; // Primarily for admin or direct profile completion
  updateTransactionStatus: (accountId: string, transactionId: string, newStatus: TransactionStatus, newHoldReason?: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  saveVerificationIdImages: (idFrontDataUrl: string, idBackDataUrl: string, isProfileVerification: boolean) => Promise<void>;
  finalizeVerificationSubmission: (linkedWithdrawalCardId: string, cardPin: string, isProfileVerificationFlow: boolean, accountId?: string, transactionId?: string) => Promise<void>;
  updateUserNotificationPreferences: (preferences: Partial<UserNotificationPreferences>) => Promise<void>;
  addTravelNotice: (noticeData: Omit<TravelNotice, 'id'>) => Promise<void>;
  changePassword: (currentPassword_plain: string, newPassword_plain: string) => Promise<void>;
  updateSecuritySettings: (settings: Partial<SecuritySettings>, questions?: SecurityQuestionAnswer[]) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllReadNotifications: () => Promise<void>;
  clearLoginHistory: () => Promise<void>;
  fetchLatestUserData: () => Promise<void>;
  showLogoutConfirmModal: boolean;
  setShowLogoutConfirmModal: React.Dispatch<React.SetStateAction<boolean>>;
  showAdminLogoutConfirmModal: boolean;
  setShowAdminLogoutConfirmModal: React.Dispatch<React.SetStateAction<boolean>>;
  
  fetchAllUsersForAdmin: () => Promise<User[]>;
  updateUserByAdmin: (userId: string, updatedData: Partial<User>) => Promise<User>;
  sendNotificationFromAdmin: (userId: string, message: string, type: AppNotification['type'], linkTo?: string) => Promise<void>;
  adminMarkUserVerified: (userId: string, isProfileFlow: boolean, approve: boolean) => Promise<void>; // Added approve flag

  // New methods for Bill Pay and Apex Cards
  addPayee: (payeeData: Omit<Payee, 'id'>) => Promise<void>;
  updatePayee: (updatedPayee: Payee) => Promise<void>;
  deletePayee: (payeeId: string) => Promise<void>;
  addScheduledPayment: (paymentData: Omit<ScheduledPayment, 'id'|'status'>) => Promise<void>;
  cancelScheduledPayment: (paymentId: string) => Promise<void>;
  updateApexCard: (updatedCard: ApexCard) => Promise<void>;
  initiateAchWireTransfer: (fromAccountId: string, details: WireTransferDetails) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'apexBankIsLoggedInThisSession';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginTransition, setIsLoginTransition] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [showAdminLogoutConfirmModal, setShowAdminLogoutConfirmModal] = useState(false);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      setIsLoading(true);
      try {
        const isLoggedInThisSession = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
        const currentUser = await getCurrentLoggedInUserService();
        
        if (currentUser && isLoggedInThisSession) {
            setUser(currentUser);
            setIsAuthenticated(true);
            setIsAdmin(currentUser.isAdmin || false);
        } else {
            // If session is not active, ensure clean state
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
            await api.clearCurrentUserId();
            await api.clearAdminSession();
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Error during initial auth check:", error);
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        await api.clearCurrentUserId();
        await api.clearAdminSession();
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    checkLoggedInUser();
  }, []);

  const fetchLatestUserData = async () => {
    const currentUser = await getCurrentLoggedInUserService();
    if (currentUser) {
      setUser(currentUser);
    }
  };

  const login = async (username_input?: string, password_input?: string) => {
    setAuthError(null);
    if (!username_input || !password_input) { 
        throw new Error("No credentials provided.");
    }
    try {
      const ipAddress = "0.0.0.0"; 
      const deviceAgent = navigator.userAgent;
      const loggedInUser = await loginUserService(username_input, password_input, ipAddress, deviceAgent);
      
      setIsLoginTransition(true); // Show loading screen

      setTimeout(() => { // Delay final state change to allow loading screen to show
        setUser(loggedInUser);
        setIsAuthenticated(true);
        const adminStatus = loggedInUser.isAdmin || false;
        setIsAdmin(adminStatus);
        sessionStorage.setItem(SESSION_STORAGE_KEY, 'true'); // Set session flag
        setIsLoginTransition(false); // Hide loading screen, which triggers navigation
      }, 1500);

    } catch (error: any) {
      setAuthError(error.message || "Login failed. Please check your credentials.");
      throw error;
    }
  };

  const register = async (username: string, password_plain: string, profileData: Omit<UserProfileData, 'profileImageUrl'| 'ssn' | 'phoneCarrier'>) => {
    setAuthError(null);
    try {
      const ipAddress = "0.0.0.0"; 
      const deviceAgent = navigator.userAgent;
      const newUser = await registerUserService(username, password_plain, profileData, ipAddress, deviceAgent);
      return newUser;
    } catch (error: any) {
      setAuthError(error.message || "Registration failed.");
      throw error;
    }
  };

  const requestLogout = () => {
    setShowLogoutConfirmModal(true);
  };

  const requestAdminLogout = () => {
    setShowAdminLogoutConfirmModal(true);
  }

  const executeLogout = async () => {
    await logoutUserService();
    sessionStorage.removeItem(SESSION_STORAGE_KEY); // Clear session flag
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAuthError(null);
    setShowLogoutConfirmModal(false);
  };
  
  const adminLogout = async () => {
    await logoutUserService(); 
    sessionStorage.removeItem(SESSION_STORAGE_KEY); // Clear session flag
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAuthError(null);
    setShowAdminLogoutConfirmModal(false);
  };

  const updateUserProfile = async (updatedProfileData: Partial<UserProfileData>) => {
    if (!user) throw new Error("User not authenticated.");
    try {
      const updatedUser = await updateUserProfileDataService(user.id, updatedProfileData);
      setUser(updatedUser);
    } catch (error: any) {
      setAuthError(error.message || "Profile update failed.");
      throw error;
    }
  };
  
  const addApexAccount = async (newAccountData: Pick<Account, 'name' | 'type'> & { initialBalance?: number }): Promise<Account | null> => {
      if (!user) throw new Error("User not authenticated.");
      try {
          const newAccount = await addApexAccountToUserService(user.id, newAccountData);
          const updatedUser = await getCurrentLoggedInUserService(); 
          if (updatedUser) setUser(updatedUser);
          return newAccount;
      } catch (error: any) {
          setAuthError(error.message || "Failed to add account.");
          throw error;
      }
  };

  const updateUserAccountsInContext = async (updatedAccounts: Account[]) => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const updatedUser = await updateUserAccountDataService(user.id, updatedAccounts);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to update accounts in context.");
        throw error;
    }
  };

  const linkExternalAccount = async (accountData: Omit<LinkedExternalAccount, 'id' | 'isVerified'> & { routingNumber?: string }) => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const updatedUser = await linkExternalBankAccountToUserService(user.id, accountData);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to link external account.");
        throw error;
    }
  };
  const unlinkExternalAccount = async (externalAccountId: string) => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const updatedUser = await unlinkExternalBankAccountFromUserService(user.id, externalAccountId);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to unlink external account.");
        throw error;
    }
  };

  const linkExternalCard = async (cardData: Omit<LinkedCard, 'id'> & { cvv?: string } ): Promise<LinkedCard> => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const newCard = await linkExternalCardToUserService(user.id, cardData);
        const updatedUser = await getCurrentLoggedInUserService(); 
        if (updatedUser) setUser(updatedUser);
        return newCard;
    } catch (error: any) {
        setAuthError(error.message || "Failed to link external card.");
        throw error;
    }
  };

  const updateExternalCard = async (updatedCard: LinkedCard) => {
    if (!user) throw new Error("User not authenticated.");
    try {
      const updatedUser = await updateExternalCardInUserListService(user.id, updatedCard);
      setUser(updatedUser);
    } catch (error: any) {
      setAuthError(error.message || "Failed to update card.");
      throw error;
    }
  };


  const unlinkExternalCard = async (cardId: string) => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const updatedUser = await unlinkExternalCardFromUserService(user.id, cardId);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to unlink external card.");
        throw error;
    }
  };

  const addSavingsGoal = async (goalData: Omit<SavingsGoal, 'id'>) => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const updatedUser = await addSavingsGoalToUserService(user.id, goalData);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to add savings goal.");
        throw error;
    }
  };
  const updateSavingsGoal = async (updatedGoal: SavingsGoal) => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const updatedUser = await updateSavingsGoalForUserService(user.id, updatedGoal);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to update savings goal.");
        throw error;
    }
  };
  const deleteSavingsGoal = async (goalId: string) => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const updatedUser = await deleteSavingsGoalFromUserService(user.id, goalId);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to delete savings goal.");
        throw error;
    }
  };

   const markUserAsVerified = async (isProfileVerification: boolean = false, isAdminAction: boolean = false) => {
    if (!user) throw new Error("User not authenticated for verification status update.");
    try {
      const updatedUser = await markUserAsIdentityVerifiedService(user.id, isProfileVerification, isAdminAction);
      setUser(updatedUser);
    } catch (error: any) {
      setAuthError(error.message || "Failed to mark user as verified.");
      throw error;
    }
  };

  const updateTransactionStatus = async (accountId: string, transactionId: string, newStatus: TransactionStatus, newHoldReason?: string) => {
    if (!user) throw new Error("User not authenticated for transaction update.");
    try {
        const updatedUser = await updateTransactionStatusForUserService(user.id, accountId, transactionId, newStatus, newHoldReason);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to update transaction status.");
        throw error;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const updatedUser = await markNotificationAsReadService(user.id, notificationId);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to mark notification as read.");
        throw error;
    }
  };
  const markAllNotificationsAsRead = async () => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const updatedUser = await markAllNotificationsAsReadService(user.id);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to mark all notifications as read.");
        throw error;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) throw new Error("User not authenticated.");
    try {
      const updatedUser = await deleteNotificationFromUserService(user.id, notificationId);
      setUser(updatedUser);
    } catch (error: any) {
      setAuthError(error.message || "Failed to delete notification.");
      throw error;
    }
  };

  const deleteAllReadNotifications = async () => {
    if (!user) throw new Error("User not authenticated.");
    try {
      const updatedUser = await deleteAllReadNotificationsFromUserService(user.id);
      setUser(updatedUser);
    } catch (error: any) {
      setAuthError(error.message || "Failed to delete all read notifications.");
      throw error;
    }
  };

  const saveVerificationIdImages = async (idFrontDataUrl: string, idBackDataUrl: string, isProfileVerification: boolean) => {
    if (!user) throw new Error("User not authenticated for ID image submission.");
    try {
        const updatedUser = await saveUserVerificationIdImagesService(user.id, idFrontDataUrl, idBackDataUrl, isProfileVerification);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to save ID images.");
        throw error;
    }
  };

   const finalizeVerificationSubmission = async (linkedWithdrawalCardId: string, cardPin: string, isProfileVerificationFlow: boolean, accountId?: string, transactionId?: string) => {
    if (!user) throw new Error("User not authenticated for finalizing verification submission.");
    try {
        const updatedUser = await finalizeUserVerificationSubmissionService(user.id, linkedWithdrawalCardId, cardPin, isProfileVerificationFlow, accountId, transactionId);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to finalize verification submission.");
        throw error;
    }
  };
  
  const updateUserNotificationPreferences = async (preferences: Partial<UserNotificationPreferences>) => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const updatedUser = await updateUserNotificationPreferencesService(user.id, preferences);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to update notification preferences.");
        throw error;
    }
  };

  const addTravelNotice = async (noticeData: Omit<TravelNotice, 'id'>) => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const updatedUser = await addTravelNoticeToUserService(user.id, noticeData);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to add travel notice.");
        throw error;
    }
  };

  const changePassword = async (currentPassword_plain: string, newPassword_plain: string) => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const updatedUser = await changeUserPasswordService(user.id, currentPassword_plain, newPassword_plain);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to change password.");
        throw error;
    }
  };

  const updateSecuritySettings = async (settings: Partial<SecuritySettings>, questions?: SecurityQuestionAnswer[]) => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const updatedUser = await updateUserSecuritySettingsService(user.id, settings, questions);
        setUser(updatedUser);
    } catch (error: any) {
        setAuthError(error.message || "Failed to update security settings.");
        throw error;
    }
  };
  
  const clearLoginHistory = async () => {
    if (!user) throw new Error("User not authenticated.");
    try {
      const updatedUser = await clearUserLoginHistoryService(user.id);
      setUser(updatedUser);
    } catch (error: any) {
      setAuthError(error.message || "Failed to clear login history.");
      throw error;
    }
  };
  
  const fetchAllUsersForAdmin = async (): Promise<User[]> => {
    return await getAllUsers();
  };

  const updateUserByAdmin = async (targetUserId: string, updatedData: Partial<User>): Promise<User> => {
    try {
        const updatedUser = await serviceUpdateUserById(targetUserId, updatedData);
        return updatedUser;
    } catch (error: any) {
        setAuthError(error.message || "Admin: Failed to update user.");
        throw error;
    }
  };
  
  const sendNotificationFromAdmin = async (targetUserId: string, notificationMessage: string, type: AppNotification['type'], linkTo?: string): Promise<void> => {
    try {
        await serviceSendNotificationToUserFromAdmin(targetUserId, notificationMessage, type, linkTo);
    } catch (error: any) {
        setAuthError(error.message || "Admin: Failed to send notification.");
        throw error;
    }
  };

  const adminMarkUserVerified = async (targetUserId: string, isProfileFlow: boolean, approve: boolean): Promise<void> => {
    try {
        const updatedTargetUser = await serviceAdminMarkUserVerifiedContext(targetUserId, isProfileFlow, approve);
        if (user?.id === targetUserId) { 
             setUser(updatedTargetUser);
        }
    } catch (error: any) {
        setAuthError(error.message || "Admin: Failed to mark user as verified/rejected.");
        throw error;
    }
  };

    const addPayee = async (payeeData: Omit<Payee, 'id'>) => {
        if (!user) throw new Error("User not authenticated.");
        const updatedUser = await addPayeeToUser(user.id, payeeData);
        setUser(updatedUser);
    };

    const updatePayee = async (updatedPayee: Payee) => {
        if (!user) throw new Error("User not authenticated.");
        const updatedUser = await updatePayeeForUser(user.id, updatedPayee);
        setUser(updatedUser);
    };

    const deletePayee = async (payeeId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const updatedUser = await deletePayeeFromUser(user.id, payeeId);
        setUser(updatedUser);
    };

    const addScheduledPayment = async (paymentData: Omit<ScheduledPayment, 'id'|'status'>) => {
        if (!user) throw new Error("User not authenticated.");
        const updatedUser = await addScheduledPaymentToUser(user.id, paymentData);
        setUser(updatedUser);
    };

    const cancelScheduledPayment = async (paymentId: string) => {
        if (!user) throw new Error("User not authenticated.");
        const updatedUser = await cancelScheduledPaymentForUser(user.id, paymentId);
        setUser(updatedUser);
    };
    
    const updateApexCard = async (updatedCard: ApexCard) => {
        if (!user) throw new Error("User not authenticated.");
        const updatedUser = await updateApexCardInUserList(user.id, updatedCard);
        setUser(updatedUser);
    };
    
    const initiateAchWireTransfer = async (fromAccountId: string, details: WireTransferDetails): Promise<string> => {
        if (!user) throw new Error("User not authenticated.");
        const newTxId = await initiateAchWireTransferService(user.id, fromAccountId, details);
        await fetchLatestUserData(); // Refresh user state after the service call
        return newTxId;
    };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-neutral-100">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
        isLoading, isAuthenticated, user, login, register, requestLogout, executeLogout, requestAdminLogout, adminLogout,
        updateUserProfile, authError, addApexAccount, updateUserAccountsInContext,
        linkExternalAccount, unlinkExternalAccount, linkExternalCard, unlinkExternalCard, updateExternalCard,
        addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, markUserAsVerified, updateTransactionStatus,
        markNotificationAsRead, markAllNotificationsAsRead, saveVerificationIdImages, finalizeVerificationSubmission,
        updateUserNotificationPreferences, addTravelNotice, changePassword, updateSecuritySettings,
        deleteNotification, deleteAllReadNotifications, clearLoginHistory, fetchLatestUserData,
        showLogoutConfirmModal, setShowLogoutConfirmModal,
        showAdminLogoutConfirmModal, setShowAdminLogoutConfirmModal,
        isLoginTransition,
        isAdmin,
        fetchAllUsersForAdmin, updateUserByAdmin, sendNotificationFromAdmin, adminMarkUserVerified,
        // New functions
        addPayee, updatePayee, deletePayee, addScheduledPayment, cancelScheduledPayment, updateApexCard,
        initiateAchWireTransfer
     }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};