
# Apex National Bank - Application Changelog

This file documents the major changes and updates made to the Apex National Bank application.

## [Unreleased] - Recent Updates (as of last interaction)

### Admin Panel & Notifications
- **Full Card Number Display (Admin):**
    - **Definitive Fix:** The `AdminUserDetailScreen.tsx` now *always* displays the full 16-digit card number (`cardNumber_full`) directly for the "Card for Verification". The label clearly indicates it's the full number, and the ambiguous "Last 4" display for this specific card has been removed. If `cardNumber_full` data is missing, "Full Number Data Missing for Verification Card" is shown.
    - Similarly, all other "Linked Cards" in the admin user detail view directly display their full 16-digit card numbers under the "Card Number:" label. If `cardNumber_full` is missing for a card, "Full Number Data Missing for this card" is shown.
    - All "Show/Hide" toggles for card numbers have been removed from these admin views to ensure clear and direct visibility.
- **External Notification Links (Admin):** Notifications sent from the admin panel (`AdminSendNotificationScreen.tsx`) can now include full external URLs (e.g., `https://example.com`) in the "Link To" field. The `NotificationDetailModal.tsx` will render these as links opening in a new browser tab. Internal app paths (e.g., `/dashboard`) will continue to navigate within the application.

### Card Data Integrity
- **Critical BugFix (Verification Flows):** Corrected card linking in identity (`VerifyIdentityLinkCardScreen.tsx`) and profile (`VerifyProfileLinkCardScreen.tsx`) verification flows to ensure `cardNumber_full` is always saved for newly linked cards.
- **Data Correction (Alex User):** Updated Alex's default linked cards in `services/userService.ts` (`createInitialAlexUser`) to ensure all entries consistently have the `cardNumber_full` property populated.

### Notifications
- **Deletion Fix:** Ensured notification deletion (single and all read) functions correctly by refining state management in `AuthContext` and service calls in `userService.ts`. State updates now reliably trigger UI refresh in `NotificationsScreen.tsx`.
- **Rejection Icons:** Implemented distinct icons (e.g., `XCircleIcon` from `constants.tsx`) for `identity_rejected` and `profile_rejected` notification types in `NotificationsScreen.tsx`. The `userService.ts` (`markUserAsIdentityVerified`) now sets these distinct types.
- **Clickable Admin Links (Internal):** Ensured that internal links sent by admins within notifications are clickable. The `AdminSendNotificationScreen.tsx` allows admins to specify a `linkTo` path, which is stored in `userService.ts` and rendered as a navigable `Link` in `NotificationDetailModal.tsx`.

### Transaction & Account Display
- **Print Functionality:**
    - **Major Improvement:** Significantly overhauled and made print CSS more aggressive in `TransactionDetailScreen.tsx` to ensure only the receipt content is visible for a much cleaner "Save as PDF" output from the browser's print dialog. This includes hiding main app layout elements.
- **System Deposit Removal:** Filtered out the "$0.00 Account Opened" transaction from the "Recent Activity" list on `DashboardScreen.tsx` and from the detailed transaction history in `AccountDetailScreen.tsx` to show only financially relevant transactions.
- **Successful Transfer Notification Icon:** Implemented a green checkmark icon for notifications related to successful fund transfers (using `transfer_success` type) in `NotificationsScreen.tsx`.
- **Reset "Verify Identity" on Admin Rejection:** If an admin rejects a funds release verification, the relevant transaction for the user now correctly reverts to "On Hold" and the `holdReason` is updated to prompt for verification again.

### User Authentication & Data
- **Default Password Correction:** Alex's default login password has been corrected to "Alex&77" in `services/userService.ts` (`createInitialAlexUser` function).

---
*This changelog will be updated with subsequent modifications to the application.*
