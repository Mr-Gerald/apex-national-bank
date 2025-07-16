
# Apex National Bank - System Overview

## 1. Introduction

**Apex National Bank** is a modern digital banking application interface designed to simulate a comprehensive online banking experience. It allows users to manage accounts, view transactions, perform transfers, pay bills, explore financial products, and interact with an AI-powered financial assistant. The application also includes an administrative panel for user management and system notifications.

**Core User-Facing Features:**
- User Authentication (Login, Sign Up)
- Account Management (Checking, Savings, Business, IRA)
- Transaction Viewing & Details
- Fund Transfers (Internal, Inter-User, ACH/Wire simulation, Zelle simulation)
- Bill Pay System (Manage Payees, Schedule Payments)
- Mobile Check Deposit (Simulation)
- Profile Management (Personal Info, Security Settings, Notification Preferences)
- Identity Verification Flows (for on-hold funds and top-tier access)
- Linked External Accounts & Cards Management
- Savings Goals
- Product Exploration (Gift Cards, Loans, Insurance)
- AI Financial Assistant (Zen - powered by Gemini API)
- Notifications Center

**Core Admin-Facing Features:**
- Admin Dashboard (User stats, pending verifications)
- User List & Detailed User View (including full 16-digit card numbers for the "Card for Verification" and all other linked cards, always displayed clearly and directly. If `cardNumber_full` data is missing for a specific card, a "Full Number Data Missing" message is shown. Other sensitive data like SSN may use show/hide toggles).
- User Verification Management (Approve/Reject)
- System-wide Notification Sending (can include internal app links or external URLs)

## 2. Technology Stack

- **Frontend Framework:** React 19 (`react`, `react-dom`) with functional components and Hooks.
- **Language:** TypeScript (`.tsx`, `.ts`).
- **Routing:** React Router DOM v7 (`react-router-dom`) using HashRouter.
- **Styling:** Tailwind CSS (configured in `index.html` and `tailwind.config.js`).
- **State Management:** React Context API (`AuthContext`, `AccountContext`).
- **AI Integration:** Google Gemini API (`@google/genai`) for the AI Chat feature.
- **Data Persistence:** Browser `localStorage` for all user and application data.
- **Icons:** Heroicons (embedded as SVG components in `constants.tsx`).

## 3. Project Structure

- **`/public` (Implicit):** Contains `index.html`.
- **`/src` (Implicit):** Contains all TypeScript/React code.
    - **`App.tsx`:** Main application component, sets up routing and global providers.
    - **`index.tsx`:** Entry point, renders the `App` component.
    - **`metadata.json`:** Application metadata, permissions (e.g., camera).
    - **`types.ts`:** Defines all TypeScript types and interfaces used across the application.
    - **`constants.tsx`:** Global constants, bank name, SVG icon components, localStorage keys.
    - **`/components`:** Reusable UI components (e.g., `Button.tsx`, `Modal.tsx`, `Header.tsx`, `BottomNav.tsx`, `AccountCard.tsx`).
        - **`AdminHeader.tsx`:** Header specific to the admin panel.
        - **`AdminRouteGuard.tsx`:** Protects admin routes.
        - **`AIChatBubble.tsx`:** Renders individual chat messages.
        - **`CircularProgressScore.tsx`:** Displays credit score visually.
        - **`FloatingActionButton.tsx`:** FAB for quick access (e.g., AI Chat).
        - **`FormRow.tsx`:** Reusable form input row.
        - **`NotificationDetailModal.tsx`:** Modal for viewing notification details. Handles internal and external links.
        - **`StepIndicator.tsx`:** Visual indicator for multi-step flows.
    - **`/contexts`:** Global state management.
        - **`AuthContext.tsx`:** Manages authentication, user data, profile updates, verification processes, and related actions.
        - **`AccountContext.tsx`:** Manages user's bank accounts, transactions, and fund transfer logic.
    - **`/screens`:** Top-level components representing different application views/pages.
        - **`/admin`:** Screens specific to the admin panel (`AdminDashboardScreen.tsx`, `AdminUserListScreen.tsx`, etc.).
        - Contains screens for all major features like `DashboardScreen.tsx`, `AccountsScreen.tsx`, `TransferScreen.tsx`, `ProfileScreen.tsx`, identity verification flows (`VerifyIdentityDataScreen.tsx`, etc.), product exploration, and settings.
    - **`/services`:** Business logic and data interaction layer.
        - **`userService.ts`:** Handles user data CRUD, authentication, profile updates, identity verification logic, notifications, and interaction with `localStorage` for users.
        - **`accountService.ts`:** Handles account creation, transaction generation (including detailed historical data), and balance calculations.
    - **`/utils`:** Utility functions.
        - **`formatters.ts`:** Date and currency formatting utilities.
- **`CHANGELOG.md`:** Tracks incremental changes to the application.
- **`SYSTEM_OVERVIEW.md`:** This document, providing a high-level system architecture.
- **`index.html`:** Main HTML entry point, includes Tailwind CSS setup and import maps for ESM modules.
- **`tailwind.config.js`:** Configuration for Tailwind CSS.

## 4. Core Concepts & Data Flow

### 4.1. Authentication & User Management
- **`AuthContext.tsx`** is the central hub for authentication state (`isAuthenticated`, `user`, `isAdmin`).
- **`userService.ts`** handles:
    - User registration (`registerUser`): Creates new user objects, hashes passwords (simulated), and stores them.
    - User login (`loginUser`): Verifies credentials against stored data, sets current user ID.
    - User logout (`logoutUser`): Clears current user ID.
    - Fetching current user (`getCurrentLoggedInUser`).
    - Profile updates (`updateUserProfileData`).
    - Admin login is a special case handled in `LoginScreen.tsx` that sets a `sessionStorage` flag.
- User data, including hashed passwords (simulated as plain text for this demo), accounts, notifications, and all other user-specific information, is persisted in `localStorage` under the key `apexBankUsers`.
- The `AdminRouteGuard.tsx` checks `sessionStorage` for an admin flag to protect admin routes.

### 4.2. Account & Transaction Management
- **`AccountContext.tsx`** provides access to the current user's accounts and balances.
- **`accountService.ts`** is responsible for:
    - Generating initial account data for new users and the demo "Alex" user.
    - Generating detailed historical transaction data for accounts (`generateHistoricalTransactionsForSeed`).
    - Recalculating account balances based on transactions (`recalculateBalancesForAccount`).
    - Adding new transactions to an account (`addTransactionToUserAccountList`).
- Account and transaction data is part of the `User` object stored in `localStorage`.

### 4.3. Data Persistence
- All application data (users, accounts, transactions, settings) is stored in the browser's **`localStorage`**.
- `STORAGE_KEY_USERS` (`apexBankUsers`) stores an array of all user objects.
- `STORAGE_KEY_CURRENT_USER_ID` (`apexBankCurrentUserId`) stores the ID of the currently logged-in user.

### 4.4. State Management
- Global state (current user, accounts) is managed via React Context API (`AuthContext`, `AccountContext`).
- Screen-specific and component-specific state is managed using `useState` and `useEffect` hooks.

### 4.5. Navigation
- **React Router DOM v7** is used for client-side routing.
- `HashRouter` is employed.
- `App.tsx` defines all routes, including nested layouts for user and admin sections.
- Programmatic navigation is done using the `useNavigate` hook.

## 5. Key Features & Screen Workflows

### 5.1. User Authentication
- **`LoginScreen.tsx`**: Allows users and admin to log in. Handles default "Alex" (Alex&77) and "Admin" (Apex&77) credentials.
- **`SignUpScreen.tsx`**: Allows new users to register.
- **`LoginLoadingScreen.tsx`**: Brief loading animation after successful login before redirecting to the dashboard.

### 5.2. Dashboard & Accounts
- **`DashboardScreen.tsx`**: Main landing page after login. Shows total balance, quick action buttons, account overviews, recent activity, credit score (mocked), and spending insights (mocked).
- **`AccountsScreen.tsx`**: Lists all user accounts using `AccountCard.tsx`.
- **`AccountDetailScreen.tsx`**: Shows details for a specific account, including transaction history with filtering and search. Allows viewing full account number with a confirmation modal.
- **`TransactionDetailScreen.tsx`**: Displays detailed information for a single transaction. Includes "Print Receipt" (uses `window.print()` with aggressive CSS to prepare for browser's "Save as PDF", aiming for clean output) and "Share" functionality (Web Share API with fallback modal).

### 5.3. Fund Transfers
- **`TransferScreen.tsx`**: Main hub for initiating transfers. Allows selection of transfer mode:
    - **Internal:** Between the user's own accounts.
    - **Another User:** To another Apex National Bank user by username.
    - **Zelle®/External:** Simulates a Zelle transfer (no actual P2P).
- **`ACHTransferScreen.tsx`**: Simulates ACH/Wire transfers to external bank accounts.
- **`ZelleScreen.tsx`**: Dedicated screen for Zelle® P2P payment simulation.

### 5.4. Deposits
- **`DepositOptionsScreen.tsx`**: Presents various deposit methods.
- **`CheckDepositScreen.tsx`**: Simulates mobile check deposit with image upload (uses `input type="file"` and FileReader API). Requires camera permission.
- **`ACHDepositScreen.tsx`**: Simulates ACH pull from an external bank account.
- **`TransferFromLinkedScreen.tsx`**: Simulates transferring funds from a linked external bank account.

### 5.5. Bill Payments
- **`PayBillsScreen.tsx`**: Hub for bill payment features.
- **`PayNewBillScreen.tsx`**: Form to make one-time or schedule recurring payments to existing payees.
- **`ManagePayeesScreen.tsx`**: Allows users to add, edit, and delete payees (mocked data).
- **`ScheduledPaymentsScreen.tsx`**: Lists upcoming and past scheduled payments (mocked data).

### 5.6. Profile Management
- **`ProfileScreen.tsx`**: Central navigation for all profile-related settings and information.
- **`PersonalInfoScreen.tsx`**: View and edit user's personal details (name, email, address, etc.). Includes profile image upload simulation.
- **Security Settings (`SecuritySettingsScreen.tsx` and sub-screens):**
    - **`ChangePasswordScreen.tsx`**: Allows users to change their account password.
    - **`TwoFactorAuthScreen.tsx` & `SetupTwoFactorAuthScreen.tsx`**: Manage and set up 2FA (simulated, stores preferences).
    - **`SecurityQuestionsScreen.tsx` & `SetupSecurityQuestionsScreen.tsx`**: Manage and set up security questions (simulated, stores preferences).
    - **`LoginHistoryScreen.tsx`**: Displays recent login attempts. Allows clearing history.
    - **`RecognizedDevicesScreen.tsx`**: Lists devices recognized during login (simulated).
    - **`BiometricLoginScreen.tsx`**: Toggle biometric login preference (simulated).
- **`NotificationSettingsScreen.tsx`**: Manage preferences for different types of notifications.
- **`LinkedExternalAccountsScreen.tsx`**: View linked external bank accounts and cards.
    - **`LinkBankAccountScreen.tsx`**: Form to link an external bank account.
    - **`LinkCardScreen.tsx`**: Form to link an external debit/credit card.
    - **`ManageLinkedAccountScreen.tsx` & `ManageLinkedCardScreen.tsx`**: Screens to manage individual linked accounts/cards (e.g., unlink, set as default).
- **`SavingsGoalsScreen.tsx`**: Create, view, and manage savings goals.
- **`SetTravelNoticeScreen.tsx`**: Allows users to inform the bank about their travel plans.
- **`DocumentCenterScreen.tsx`**: View and download account statements, tax documents, and notices (mocked for "Alex").

### 5.7. Identity Verification
- Two main flows:
    1.  **Funds Release Verification (On-Hold Transactions):**
        - Initiated from `TransactionDetailScreen.tsx` if a `CREDIT` transaction is `On Hold` for verification and the user is not yet verified.
        - **`VerifyIdentityDataScreen.tsx`**: Collects/confirms personal data.
        - **`VerifyIdentityUploadIdScreen.tsx`**: Simulates ID document upload.
        - **`VerifyIdentityLinkCardScreen.tsx`**: Links an external card for potential withdrawal post-verification. Ensures `cardNumber_full` is saved.
        - **`VerifyIdentityPinScreen.tsx`**: Simulates card PIN entry to complete verification.
        - On completion, transaction status changes to "Pending Review", and user gets a notification: "Identity confirmation under process... This process typically takes 1-2 business days."
    2.  **Profile/Top-Tier Access Verification:**
        - Initiated from `ProfileScreen.tsx` or `StartIdentityVerificationScreen.tsx`.
        - **`StartIdentityVerificationScreen.tsx`**: Explains the benefits.
        - **`VerifyProfileDataScreen.tsx`**: Collects/confirms personal data.
        - **`VerifyProfileUploadIdScreen.tsx`**: Simulates ID document upload.
        - **`VerifyProfileLinkCardScreen.tsx`**: Links an external card. Ensures `cardNumber_full` is saved.
        - **`VerifyProfilePinScreen.tsx`**: Simulates card PIN entry.
        - On completion, user gets a notification: "Profile verification confirmation under process... This process typically takes 1-2 business days."
- `StepIndicator.tsx` component is used to show progress in these multi-step flows.
- Admin can approve/reject these submissions from `AdminUserDetailScreen.tsx`. If an admin rejects a funds release verification, the transaction's `holdReason` is updated to allow the user to retry the verification process, and they are notified accordingly.

### 5.8. Product & Service Exploration
- **`BuyGiftCardScreen.tsx` & `GiftCardDetailScreen.tsx`**: Browse and simulate purchasing gift cards.
- **`ApplyLoanScreen.tsx` & `LoanProductDetailScreen.tsx`**: Explore loan products and simulate submitting an inquiry.
- **`InsuranceProductsScreen.tsx` & `InsuranceProductDetailScreen.tsx`**: Explore insurance products and simulate getting a quote.
- **`MyRewardsScreen.tsx`**: View and simulate redeeming reward points (mocked for "Alex").
- **`CreditScoreScreen.tsx`**: Displays a mock credit score and factors influencing it.
- **`AddAccountOptionsScreen.tsx`**: Options to open a new Apex account or link external ones.
- **`OpenApexAccountScreen.tsx`**: Form to simulate applying for a new Apex bank account.

### 5.9. AI Financial Assistant
- **`AIChatScreen.tsx`**: Interface to chat with "Zen", the AI assistant.
- Uses Google Gemini API (`gemini-2.5-flash-preview-04-17` model) via `@google/genai` SDK.
- API key is expected from `process.env.API_KEY`. If not present, the feature is gracefully disabled.
- System instruction configures the AI's persona and limitations (e.g., cannot access real data, provide financial advice).
- Supports streaming responses for a more interactive experience.
- `AIChatBubble.tsx` renders individual messages.

### 5.10. Notifications
- **`NotificationsScreen.tsx`**: Displays a list of user notifications, allows marking as read, deleting single or all read notifications.
- **`NotificationDetailModal.tsx`**: Modal to view full details of a notification. Handles clickable links if `linkTo` is provided (can be internal app paths or external URLs).
- Notifications are generated by various system actions (e.g., registration, transfers, verification status changes, admin messages).
- Icons change based on notification type (e.g., success, error/rejection, general info).

### 5.11. Admin Panel
- Accessible via `/admin` routes, protected by `AdminRouteGuard.tsx`.
- **`AdminDashboardScreen.tsx`**: Overview of total users, pending verifications, and total accounts. Quick action links.
- **`AdminUserListScreen.tsx`**: Lists all non-admin users with search and filtering capabilities (e.g., filter by pending verification status).
- **`AdminUserDetailScreen.tsx`**: Detailed view of a selected user, including:
    - Profile information.
    - Full 16-digit card numbers for the "Card for Verification" and all other linked cards are **always displayed clearly and directly**. If `cardNumber_full` data is missing for a specific card (e.g., legacy data), a "Full Number Data Missing" message is shown. Toggles are removed for card numbers. Other sensitive data like SSN may still use show/hide toggles.
    - Identity verification submission details (images, data snapshot).
    - Actions to approve/reject verification submissions. Rejection of a funds release verification updates the transaction to allow user retry and triggers a notification. Approval/rejection for profile verification also triggers user notifications.
- **`AdminSendNotificationScreen.tsx`**: Form for admins to send custom notifications to specific users. Admins can specify an optional link that can be an internal application path (e.g., `/profile/settings`) or a full external URL (e.g., `https://www.example.com`).

## 6. Important Services

### 6.1. `userService.ts`
- **User Data Management:** Central point for CRUD operations on user data stored in `localStorage`. Handles initialization of "Alex" and "Admin" users. Ensures Alex's default cards have `cardNumber_full`.
- **Authentication:** `loginUser`, `registerUser`, `logoutUser`, `getCurrentLoggedInUser`.
- **Profile Updates:** `updateUserProfileData`, `changeUserPassword`, `updateUserSecuritySettings`, `updateUserNotificationPreferences`.
- **Linked Accounts/Cards:** `linkExternalBankAccountToUser`, `unlinkExternalBankAccountFromUser`, `linkExternalCardToUser` (ensures `cardNumber_full` is saved), `updateExternalCardInUserList`, `unlinkExternalCardFromUser`.
- **Savings Goals:** `addSavingsGoalToUser`, `updateSavingsGoalForUser`, `deleteSavingsGoalFromUser`.
- **Identity Verification:**
    - `saveUserVerificationIdImages`, `finalizeUserVerificationSubmission`.
    - `markUserAsIdentityVerified`: Handles logic for setting verification status and sending appropriate notifications based on whether it's an admin action or user submission completion, and whether it's for funds or profile.
- **Notifications:** `sendNotificationToUserFromAdmin`, `markNotificationAsRead`, `markAllNotificationsAsRead`, `deleteNotificationFromUser`, `deleteAllReadNotificationsFromUser`.
- **Transaction Management (User Context):** `updateTransactionStatusForUser`, `performInterUserTransfer`.
- **Other:** `addApexAccountToUser` (creates new Apex bank accounts for a user), `addTravelNoticeToUser`, `clearLoginHistory`.

### 6.2. `accountService.ts`
- **ID Generation:** `generateNewId`, `generateRandomAccountNumber`.
- **Initial Account Generation:**
    - `generateInitialAlexAccounts`: Creates a rich set of accounts and transaction history for the "Alex" demo user.
    - `generateInitialAccountsForNewUser`: Creates a basic checking account for newly registered users.
- **Transaction History Simulation:** `generateHistoricalTransactionsForSeed` creates realistic-looking historical transaction data.
- **Balance Calculation:** `recalculateBalancesForAccount` updates account balances and `balanceAfter` for each transaction.
- **Transaction Addition:** `addTransactionToUserAccountList` adds a new transaction to an account and recalculates balances.

## 7. Key UI Components

- **Layouts:**
    - `Header.tsx`: Main application header for logged-in users. Includes bank logo, name, slogan, refresh button, notification bell, and logout button.
    - `BottomNav.tsx`: Primary navigation for mobile-first user interface (Home, Accounts, Transfer, Profile).
    - `AdminHeader.tsx`: Header for the admin panel with admin-specific navigation links.
    - `AdminLayout` & `UserLayout` (defined in `App.tsx`): Structure the overall page layout for user and admin sections using `<Outlet />` for nested routes.
- **Common Elements:**
    - `Button.tsx`: Customizable button component with variants, sizes, icons, and loading state.
    - `Modal.tsx`: Reusable modal component for confirmations, alerts, or displaying detailed content.
    - `AccountCard.tsx`: Displays a summary of a user's bank account on the dashboard and accounts list.
    - `TransactionListItem.tsx`: Renders individual transaction items in lists.
    - `FormRow.tsx`: Standardized input row for forms.
    - `FloatingActionButton.tsx`: A circular button that "floats" above the UI, used for the AI Chat.
- **Specialized UI:**
    - `StepIndicator.tsx`: Visual progress bar for multi-step processes like identity verification.
    - `CircularProgressScore.tsx`: Displays the mock credit score in a circular gauge.
    - `AIChatBubble.tsx`: Renders messages in the AI chat interface.
    - `NotificationDetailModal.tsx`: Specific modal for viewing full notification content.

## 8. Styling & Theming

- **Tailwind CSS:** Utility-first CSS framework used for all styling.
    - Configuration is in `tailwind.config.js` (defining custom primary/accent colors).
    - Global Tailwind setup is in `index.html`.
- **Color Palette:**
    - `primary`: `#004a8c` (Deep Blue) - Main brand color.
    - `accent`: `#0d9488` (Teal) - Secondary/accent color.
- **Icons:** SVG icons (primarily from Heroicons) are embedded as React components in `constants.tsx` for easy reuse and styling.

## 9. API Integration (Gemini API)

- The Google Gemini API is used exclusively in the **`AIChatScreen.tsx`** to power the "Zen" AI Financial Assistant.
- **SDK:** `@google/genai` (imported via ESM).
- **Initialization:** `new GoogleGenAI({ apiKey: process.env.API_KEY })`.
- **Model:** `gemini-2.5-flash-preview-04-17`.
- **Functionality:**
    - Creates a chat instance (`ai.chats.create`).
    - Uses `systemInstruction` to define the AI's persona, capabilities, and limitations (e.g., cannot access real data, provide financial advice).
    - Sends user messages and streams responses (`chat.sendMessageStream`).
- **API Key:** The API key is expected to be available as an environment variable `process.env.API_KEY`. The application does not provide a UI for key input and will gracefully degrade the AI chat feature if the key is missing.

## 10. Data Persistence & Initialization

- All user data, including accounts, transactions, linked external details, notifications, and settings, is stored in **`localStorage`**.
- **`initializeUsers` function in `userService.ts`:**
    - On first load, creates default "Alex" and "Admin" users if no users exist in `localStorage`. Alex's default cards are initialized with `cardNumber_full`.
    - On subsequent loads, it checks if "Alex" and "Admin" users exist. If "Alex" exists, it merges his data with the `alexTemplate` to ensure all new fields from the template are present, and explicitly resets his password to the default "Alex&77". Similarly for the "Admin" user with password "Apex&77".
    - This ensures demo accounts are always functional and updated with new data structures.

## 11. Security Aspects (Simulated)

- **Admin Route Guard (`AdminRouteGuard.tsx`):** Protects admin panel routes by checking a `sessionStorage` flag (`isAdmin`). This flag is set on successful admin login.
- **Password Handling:** Passwords are currently stored in plaintext in `localStorage` for demo purposes (`hashedPassword` field contains the plain password). In a real application, passwords would be securely hashed.
- **Identity Verification:** Multi-step flows are implemented to simulate identity verification, requiring data input, ID image uploads (simulated), and card PIN entry (simulated). This is crucial for KYC/AML compliance simulation and for unlocking certain features or funds. `cardNumber_full` is saved during these flows.
- **Sensitive Data Display:** In the admin panel (`AdminUserDetailScreen.tsx`), full 16-digit card numbers (for linked cards and the verification card) are always displayed clearly and directly. If `cardNumber_full` data is missing for a specific card (e.g., legacy data), a "Full Number Data Missing" message is shown. Toggles are removed for card numbers. Other sensitive information like full SSN and bank account numbers may use a "Show/Hide" toggle to allow admins to reveal or mask them.

This document should provide a solid foundation for understanding the Apex National Bank application's current state. I will refer to this to maintain consistency and better address your future requests.
