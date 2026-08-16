# Coupon System Implementation Plan

We will implement a coupon management system that allows admins to create discount codes and customers to apply them at checkout.

## User Review Required

> [!IMPORTANT]
> The current system uses both BDT and USD. The coupon system will apply a flat discount to both currencies or a percentage, which will work seamlessly with the existing dual-currency product setup.

## Proposed Changes

### Database & Backend
- **Database Migration**: Ensure the `coupons` table is properly configured with RLS policies and grants for anonymous access (read-only for validation).
- **Server Functions**: Update `src/lib/features.functions.ts` to use server-side admin logic for coupon management to avoid permission issues.
- **Server Data Access**: Add coupon management helpers to `src/lib/cloud-data.server.ts`.

### Admin Dashboard
- **New Coupon Tab**: Add a "Coupons" management section in `src/routes/admin.dashboard.tsx` to:
  - List existing coupons.
  - Create new coupons (Code, Type, Value, Expiry, Limit).
  - Delete coupons.

### Checkout Flow
- **Coupon Input**: Add a "Promo Code" input field in the checkout summary step.
- **Real-time Validation**: Validate coupons via a server function and apply discounts immediately to the displayed price.
- **Order Creation**: Update the order submission logic to include the applied discount and coupon code in the order notes/data.

## Technical Details
- **Schema**: `coupons` table with `code`, `discount_type` (fixed/percentage), `discount_value`, `expiry_date`, and `usage_limit`.
- **Validation**: Server-side validation to check expiry, usage limits, and product restrictions.
- **Security**: Admins use `service_role` via server functions; customers have read-only access for valid coupons.
