# Plan - Payment UI Updates & Coupon System Enhancements

I will update the payment instructions in the checkout flow to be simpler and more visually appealing as requested. I will also refine the coupon system in the Admin Dashboard to allow setting expiry dates and ensure they are enforced during checkout.

## User Review Required

> [!IMPORTANT]
> - The payment instruction text will be changed to: **Amount: ৳[Price] | Personal** (replacing the "Cash-in / Send Money" part).
> - The new text will have a lighter font weight for better readability as requested.

## Proposed Changes

### Checkout & Payment UI
- **Refine Instructions**: Update `src/routes/checkout.tsx` to simplify the bKash/Nagad instruction text.
  - Current: `Amount: ৳230 | Send as "Personal" Cash-in / Send Money`
  - New: `Amount: ৳[Price] | Personal`
- **Styling**: Apply a lighter font weight (`font-medium` instead of `font-black`) to this specific instruction line.

### Coupon System Enhancements
- **Admin Dashboard UI**: Update the "Coupons" tab in `src/routes/admin.dashboard.tsx` to include an **Expiry Date** picker in the coupon creation form.
- **Backend Validation**: Ensure `src/lib/cloud-data.server.ts` correctly validates the `expiry_date` during the coupon validation process (this logic is partially there but needs verification against the UI changes).
- **Checkout Enforcement**: Verify that `src/routes/checkout.tsx` handles expired coupon errors gracefully and informs the user.

## Technical Details

### `src/routes/checkout.tsx`
- Locate the payment instruction block for `bkash` and `nagad`.
- Change the template literal for the amount display.
- Adjust Tailwind classes for font weight.

### `src/routes/admin.dashboard.tsx`
- Add an `<input type="date" />` to the coupon creation section.
- Map this new field to the `createCoupon` server function call.
- Ensure the table display shows the expiry date if set.

### `src/lib/cloud-data.server.ts`
- Double-check `validateCouponInCloud` to ensure it compares the current date correctly with `coupon.expiry_date`.
