

import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Providers and Contexts
import { AccountProvider } from './contexts/AccountContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout Components
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import FloatingActionButton from './components/FloatingActionButton';
import Modal from './components/Modal';
import AdminHeader from './components/AdminHeader';

// Icons
import { ChatBubbleOvalLeftEllipsisIcon } from './constants';

// Page/Screen Components
import DashboardScreen from './screens/DashboardScreen';
import AccountsScreen from './screens/AccountsScreen';
import AccountDetailScreen from './screens/AccountDetailScreen';
import TransferScreen from './screens/TransferScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotFoundScreen from './screens/NotFoundScreen';
import LinkCardScreen from './screens/LinkCardScreen';
import CheckDepositScreen from './screens/CheckDepositScreen';
import ACHTransferScreen from './screens/ACHTransferScreen';
import SavingsGoalsScreen from './screens/SavingsGoalsScreen';
import AIChatScreen from './screens/AIChatScreen';
import DepositOptionsScreen from './screens/DepositOptionsScreen';
import ACHDepositScreen from './screens/ACHDepositScreen';
import TransferFromLinkedScreen from './screens/TransferFromLinkedScreen';
import PayBillsScreen from './screens/PayBillsScreen';
import PayNewBillScreen from './screens/PayNewBillScreen';
import ManagePayeesScreen from './screens/ManagePayeesScreen';
import ScheduledPaymentsScreen from './screens/ScheduledPaymentsScreen';
import PersonalInfoScreen from './screens/PersonalInfoScreen';
import SecuritySettingsScreen from './screens/SecuritySettingsScreen';
import NotificationSettingsScreen from './screens/NotificationSettingsScreen';
import LinkedExternalAccountsScreen from './screens/LinkedExternalAccountsScreen';
import LinkBankAccountScreen from './screens/LinkBankAccountScreen';
import ZelleScreen from './screens/ZelleScreen';
import HelpCenterScreen from './screens/HelpCenterScreen';
import ContactUsScreen from './screens/ContactUsScreen';
import TermsScreen from './screens/TermsScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import AddAccountOptionsScreen from './screens/AddAccountOptionsScreen';
import OpenApexAccountScreen from './screens/OpenApexAccountScreen';
import CreditScoreScreen from './screens/CreditScoreScreen';
import ManageLinkedAccountScreen from './screens/ManageLinkedAccountScreen';
import ManageLinkedCardScreen from './screens/ManageLinkedCardScreen';
import ManageApexCardsScreen from './screens/ManageApexCardsScreen';
import ApexCardDetailScreen from './screens/ApexCardDetailScreen';
import SetTravelNoticeScreen from './screens/SetTravelNoticeScreen';
import DocumentCenterScreen from './screens/DocumentCenterScreen';
import TransactionDetailScreen from './screens/TransactionDetailScreen';
import BuyGiftCardScreen from './screens/BuyGiftCardScreen';
import ApplyLoanScreen from './screens/ApplyLoanScreen';
import InsuranceProductsScreen from './screens/InsuranceProductsScreen';
import MyRewardsScreen from './screens/MyRewardsScreen';
import LoanProductDetailScreen from './screens/LoanProductDetailScreen';
import InsuranceProductDetailScreen from './screens/InsuranceProductDetailScreen';
import GiftCardDetailScreen from './screens/GiftCardDetailScreen';
import VerifyIdentityDataScreen from './screens/VerifyIdentityDataScreen';
import VerifyIdentityUploadIdScreen from './screens/VerifyIdentityUploadIdScreen';
import VerifyIdentityLinkCardScreen from './screens/VerifyIdentityLinkCardScreen';
import VerifyIdentityPinScreen from './screens/VerifyIdentityPinScreen';
import VerifyProfileDataScreen from './screens/VerifyProfileDataScreen';
import VerifyProfileUploadIdScreen from './screens/VerifyProfileUploadIdScreen';
import VerifyProfileLinkCardScreen from './screens/VerifyProfileLinkCardScreen';
import VerifyProfilePinScreen from './screens/VerifyProfilePinScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import TwoFactorAuthScreen from './screens/TwoFactorAuthScreen';
import SecurityQuestionsScreen from './screens/SecurityQuestionsScreen';
import LoginHistoryScreen from './screens/LoginHistoryScreen';
import RecognizedDevicesScreen from './screens/RecognizedDevicesScreen';
import BiometricLoginScreen from './screens/BiometricLoginScreen';
import SetupTwoFactorAuthScreen from './screens/SetupTwoFactorAuthScreen';
import SetupSecurityQuestionsScreen from './screens/SetupSecurityQuestionsScreen';
import StartIdentityVerificationScreen from './screens/StartIdentityVerificationScreen';
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminUserListScreen from './screens/admin/AdminUserListScreen';
import AdminUserDetailScreen from './screens/admin/AdminUserDetailScreen';
import AdminSendNotificationScreen from './screens/admin/AdminSendNotificationScreen';
import LoginLoadingScreen from './screens/LoginLoadingScreen';

const UserLayout: React.FC = () => (
  <div className="flex flex-col h-screen max-w-md mx-auto shadow-2xl relative bg-neutral-50">
    <Header />
    <main className="flex-grow overflow-y-auto pb-24">
      <Outlet />
    </main>
    <BottomNav />
    <FloatingActionButton
      to="/ai-chat"
      icon={<ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7" />}
      ariaLabel="Open AI Financial Assistant"
    />
  </div>
);

const AdminLayout: React.FC = () => (
  <div className="flex flex-col h-screen bg-neutral-100">
    <AdminHeader />
    <main className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8">
      <Outlet />
    </main>
  </div>
);

// --- Route Guards ---

const PublicRoutes: React.FC = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    if (isAuthenticated) {
        return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
    }
    return <Outlet />;
};

const PrivateUserRoutes: React.FC = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    return isAuthenticated && !isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

const PrivateAdminRoutes: React.FC = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

// --- Main Routing Component ---

const AppRoutes: React.FC = () => {
  const { 
      isLoading, user, isLoginTransition,
      showLogoutConfirmModal, setShowLogoutConfirmModal, executeLogout,
      showAdminLogoutConfirmModal, setShowAdminLogoutConfirmModal, adminLogout 
  } = useAuth();

  if (isLoginTransition) {
    return <LoginLoadingScreen />;
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Initializing Application...</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Routes: accessible only when not authenticated */}
        <Route element={<PublicRoutes />}>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignUpScreen />} />
        </Route>

        {/* Regular User Routes: accessible only when authenticated as a regular user */}
        <Route element={<PrivateUserRoutes />}>
            <Route path="/" element={<UserLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardScreen />} />
                <Route path="accounts" element={<AccountsScreen />} />
                <Route path="accounts/:accountId" element={<AccountDetailScreen />} />
                <Route path="transaction-detail/:accountId/:transactionId" element={<TransactionDetailScreen />} /> 
                <Route path="transfer" element={<TransferScreen />} />
                <Route path="transfer/ach" element={<ACHTransferScreen />} />
                <Route path="deposit" element={<DepositOptionsScreen />} />
                <Route path="deposit/check" element={<CheckDepositScreen />} />
                <Route path="deposit/ach-pull" element={<ACHDepositScreen />} />
                <Route path="deposit/from-linked" element={<TransferFromLinkedScreen />} />
                <Route path="pay-bills" element={<PayBillsScreen />} />
                <Route path="pay-bills/new" element={<PayNewBillScreen />} />
                <Route path="pay-bills/payees" element={<ManagePayeesScreen />} />
                <Route path="pay-bills/scheduled" element={<ScheduledPaymentsScreen />} />
                <Route path="profile" element={<ProfileScreen />} />
                <Route path="profile/personal-info" element={<PersonalInfoScreen />} />
                <Route path="profile/security" element={<SecuritySettingsScreen />} />
                <Route path="profile/security/change-password" element={<ChangePasswordScreen />} />
                <Route path="profile/security/2fa" element={<TwoFactorAuthScreen />} />
                <Route path="profile/security/2fa-setup" element={<SetupTwoFactorAuthScreen />} />
                <Route path="profile/security/questions" element={<SecurityQuestionsScreen />} />
                <Route path="profile/security/questions-setup" element={<SetupSecurityQuestionsScreen />} />
                <Route path="profile/security/login-history" element={<LoginHistoryScreen />} />
                <Route path="profile/security/devices" element={<RecognizedDevicesScreen />} />
                <Route path="profile/security/biometrics" element={<BiometricLoginScreen />} />
                <Route path="profile/notifications" element={<NotificationSettingsScreen />} /> 
                <Route path="profile/linked-accounts" element={<LinkedExternalAccountsScreen />} />
                <Route path="profile/link-card" element={<LinkCardScreen />} />
                <Route path="profile/link-bank-account" element={<LinkBankAccountScreen />} />
                <Route path="profile/savings-goals" element={<SavingsGoalsScreen />} />
                <Route path="profile/zelle" element={<ZelleScreen />} />
                <Route path="profile/help" element={<HelpCenterScreen />} />
                <Route path="profile/contact" element={<ContactUsScreen />} />
                <Route path="profile/terms" element={<TermsScreen />} />
                <Route path="profile/privacy" element={<PrivacyPolicyScreen />} />
                <Route path="profile/manage-apex-cards" element={<ManageApexCardsScreen />} />
                <Route path="profile/apex-card/:cardId" element={<ApexCardDetailScreen />} />
                <Route path="profile/travel-notice" element={<SetTravelNoticeScreen />} />
                <Route path="profile/documents" element={<DocumentCenterScreen />} />
                <Route path="products/gift-cards" element={<BuyGiftCardScreen />} />
                <Route path="products/gift-cards/:merchantId" element={<GiftCardDetailScreen />} /> 
                <Route path="products/loans" element={<ApplyLoanScreen />} />
                <Route path="products/loans/:loanProductId" element={<LoanProductDetailScreen />} />
                <Route path="products/insurance" element={<InsuranceProductsScreen />} />
                <Route path="products/insurance/:insuranceProductId" element={<InsuranceProductDetailScreen />} />
                <Route path="user/rewards" element={<MyRewardsScreen />} />
                <Route path="add-account-options" element={<AddAccountOptionsScreen />} />
                <Route path="open-new-apex-account" element={<OpenApexAccountScreen />} />
                <Route path="credit-score" element={<CreditScoreScreen />} />
                <Route path="manage-linked-account/:externalAccountId" element={<ManageLinkedAccountScreen />} />
                <Route path="manage-linked-card/:externalCardId" element={<ManageLinkedCardScreen />} />
                <Route path="verify-identity/:accountId/:transactionId" element={<VerifyIdentityDataScreen />} />
                <Route path="verify-identity/upload-id/:accountId/:transactionId" element={<VerifyIdentityUploadIdScreen />} />
                <Route path="verify-identity/link-card/:accountId/:transactionId" element={<VerifyIdentityLinkCardScreen />} />
                <Route path="verify-identity/pin/:accountId/:transactionId/:linkedCardId" element={<VerifyIdentityPinScreen />} />
                <Route path="profile-verification/data" element={<VerifyProfileDataScreen />} />
                <Route path="profile-verification/upload-id" element={<VerifyProfileUploadIdScreen />} />
                <Route path="profile-verification/link-card" element={<VerifyProfileLinkCardScreen />} />
                <Route path="profile-verification/pin/:linkedCardId" element={<VerifyProfilePinScreen />} />
                <Route path="start-identity-verification" element={<StartIdentityVerificationScreen />} />
                <Route path="notifications" element={<NotificationsScreen />} /> 
                <Route path="ai-chat" element={<AIChatScreen />} />
            </Route>
        </Route>

        {/* Admin Routes: accessible only when authenticated as an admin */}
        <Route element={<PrivateAdminRoutes />}>
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardScreen />} />
                <Route path="users" element={<AdminUserListScreen />} />
                <Route path="users/:userId" element={<AdminUserDetailScreen />} />
                <Route path="notifications" element={<AdminSendNotificationScreen />} />
            </Route>
        </Route>

        {/* Fallback route to catch all other paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      
      {/* Regular User Logout Modal */}
      {user && !user.isAdmin && (
        <Modal
          isOpen={showLogoutConfirmModal}
          onClose={() => setShowLogoutConfirmModal(false)}
          title="Confirm Logout"
          primaryActionText="Log Out"
          onPrimaryAction={executeLogout}
          secondaryActionText="Cancel"
          onSecondaryAction={() => setShowLogoutConfirmModal(false)}
        >
          Are you sure you want to log out of Apex National Bank?
        </Modal>
      )}

      {/* Admin User Logout Modal */}
      {user && user.isAdmin && (
        <Modal
          isOpen={showAdminLogoutConfirmModal}
          onClose={() => setShowAdminLogoutConfirmModal(false)}
          title="Confirm Admin Logout"
          primaryActionText="Log Out"
          onPrimaryAction={adminLogout}
          secondaryActionText="Cancel"
          onSecondaryAction={() => setShowAdminLogoutConfirmModal(false)}
        >
          Are you sure you want to log out of the Admin Panel?
        </Modal>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AccountProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AccountProvider>
    </AuthProvider>
  );
};

export default App;