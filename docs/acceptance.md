# Acceptance Testing Guide

This guide explains how to manually verify key user flows before merging changes.

## Re-running Automated Tests

Run the Playwright suite to verify end-to-end flows:

```bash
cd web
npm run test:e2e
```

On failure, screenshots and videos are saved to `web/test-results/` for inspection.

## Client Flow

1. Log in as a client.
2. Use the search bar to find a product.
3. Add the item to the cart and proceed to checkout.
4. Complete payment and confirm an order confirmation message appears.
5. Verify the order shows in the client's order history.

## Advisor Flow

1. Log in as an advisor.
2. Start a new sale and select a product.
3. Complete the sale and confirm stock levels decrease.
4. Ensure the sale appears under advisor commissions.
5. Verify the client receives a receipt.

## Admin Flows

### Export Sales and Commissions

1. Log in as an administrator.
2. Navigate to **Reports → Export**.
3. Generate the sales and commissions report.
4. Confirm a CSV file downloads and contains expected data.

### Stock Imports
1. Log in as an administrator.
2. Navigate to **Inventory → Stock Import**.
3. Upload a CSV file with sample products.
4. Confirm the preview matches the file contents and submit the import.
5. Verify new inventory entries appear in the product list.

### Promotions
1. Ensure `PROMO_V2_ENABLED` is set to `true`.
2. Log in as an administrator.
3. Go to **Marketing → Promotions** and create an automatic promotion for a product.
4. Add the product to the cart and verify the discount applies without entering a code.
5. Create a second promotion with a larger discount for the same product and confirm the higher discount is applied.
6. Disable the promotions and confirm the discount no longer appears.

### Dashboards
1. Sign in to the dashboard as a merchant.
2. Open **Reports → Sales Dashboard**.
3. Confirm charts render for total revenue, top products, and recent orders.
4. Adjust the date range filter and verify the data updates accordingly.
5. Export the report to CSV and confirm the file downloads.

Keep this document updated whenever user flows change.
