# Plan: Product-Specific Multi-Coupon System

Enhance the coupon system to allow associating coupons with multiple specific products and only showing the coupon input at checkout when applicable.

## Proposed Changes

### Database & Backend Logic
- **Supabase Migration**: Ensure the `coupons` table supports multiple product associations. I will use a `text` column `extension_ids` to store comma-separated IDs for simplicity and compatibility.
- **`src/lib/cloud-data.server.ts`**: Update `validateCouponInCloud` to check if a product ID exists within the `extension_ids` list.
- **`src/lib/features.functions.ts`**: Update `createCoupon` validator to accept `extension_ids`.

### Admin Dashboard (`src/routes/admin.dashboard.tsx`)
- Update the "Add Coupon" UI to allow selecting multiple products from the existing extensions list.
- Display the associated products in the coupon list.

### Checkout (`src/routes/checkout.tsx`)
- Fetch the list of coupons applicable to the current product.
- Conditionally render the "Promo Code" input only if at least one coupon (specific or global) is available for the current product.

## Technical Details
- **Migration**: `ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS extension_ids text;`
- **Validation logic**: `if (coupon.extension_ids && !coupon.extension_ids.split(',').includes(extensionId)) { ... }`
- **UI**: Add a multi-select dropdown or a list of checkboxes in the admin coupon creation prompt/modal.

## User Review Required
- Should "Global" coupons (applicable to all products) still exist? I will assume yes if no specific products are selected.
- The checkout will only show the "Promo Code" field if a coupon is actually usable for that specific product to avoid clutter.
