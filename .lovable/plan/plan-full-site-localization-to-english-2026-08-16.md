# Plan: Full Site Localization to English

The objective is to remove all Bengali (BN) text and language-switching functionality, making the entire site exclusively English (EN).

## User Review Required

> [!IMPORTANT]
> - All Bengali error messages and UI labels will be replaced with English equivalents.
> - The EN/BN language switcher in the navbar will be removed.

## Proposed Changes

### Core Logic & Hooks
- **src/hooks/use-language.ts**: Remove `language` state logic and `BN` translations. Hardcode everything to English.
- **src/lib/tracking.functions.ts**: Update Bengali error messages to English.
- **src/lib/orders.functions.ts**: (If any Bengali found) Update to English.

### Routes & UI Components
- **src/routes/index.tsx**:
    - Remove the language switcher buttons from the navbar.
    - Remove `useLanguage` usage and hardcode English text.
    - Update metadata and site name to remain consistent.
- **src/routes/track-order.tsx**:
    - Replace all Bengali labels (e.g., "ট্র্যাক করুন", "অর্ডার আইডি") with English.
    - Update status messages and tooltips to English.
- **src/routes/checkout.tsx**:
    - Update all toasts and validation messages to English.
    - Fix the currency symbol logic to favor `$` for Binance and `৳` (or `BDT`) for local, but keep all labels in English.
- **src/routes/admin.tsx** & **src/routes/admin.dashboard.tsx**:
    - Replace login error messages and dashboard labels with English.
- **src/routes/auth.tsx**:
    - Update login success/error toasts to English.

### Backend/Settings
- **src/lib/cloud-data.server.ts**: Check for any hardcoded Bengali response messages.

## Technical Details
- Search for Unicode range `[\u0980-\u09FF]` to ensure no Bengali characters remain.
- Standardize on English terminology for order statuses (e.g., "Pending", "Processing", "Completed").
- Remove `language-storage` from local storage via code if necessary, or simply let the app default to English logic.

## Feedback
- Should I keep the `৳` symbol for local payments (bKash/Nagad) or use "BDT"? (I will assume keeping the symbol is fine as it's currency-specific, not language-specific, but the text around it will be English).
