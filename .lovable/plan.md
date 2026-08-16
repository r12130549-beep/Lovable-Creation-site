# Plan: Multi-Currency Product Management and Payment Flow

This plan implements a multi-currency system where products are priced in USD (primary) with an optional BDT equivalent for local payment methods like bKash and Nagad.

## User Review Required

> [!IMPORTANT]
> - All products will now have a **USD Price** as the primary field.
> - A new optional field **BDT Price** will be added to products to allow manual overrides for bKash/Nagad payments.
> - If **BDT Price** is not provided for a product, the system will automatically calculate it using the **USDT Rate** from Website Settings.

## Technical Details

### 1. Database Schema Update
- Add `price_usd` (numeric) and `price_bdt` (numeric, nullable) to the `extensions` table.
- Maintain backward compatibility by keeping the existing `price` field (which will now store the primary USD value).

### 2. Admin Dashboard Enhancements (`src/routes/admin.dashboard.tsx`)
- Update the "Add/Edit Product" form:
    - Change "Price" label to "Price (USD)".
    - Add a new "Price (BDT) - Optional" field.
    - Show real-time conversion feedback (e.g., "Calculated BDT: ৳XXX" if BDT field is empty).
- Update the Extensions list to display prices as `$XX / ৳YY`.

### 3. Checkout Flow Updates (`src/routes/checkout.tsx`)
- Detect the selected payment method:
    - **Binance Pay**: Display the **USD Price**.
    - **bKash / Nagad**: Display the **BDT Price** (or calculated BDT if null).
- Update order creation logic to store the correct currency and amount used during checkout.

### 4. Extensions Page Updates (`src/routes/extensions.tsx`)
- Update product cards to show USD as the primary price.
- (Optional) Show BDT equivalent below the USD price for local clarity.

### 5. Backend Logic (`src/lib/extensions.functions.ts` & `src/lib/orders.functions.ts`)
- Update Zod schemas to include `price_usd` and `price_bdt`.
- Ensure server functions handle the new price fields during creation and updates.
