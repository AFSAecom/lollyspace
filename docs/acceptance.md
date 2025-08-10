# Acceptance Testing Guide

This guide explains how to manually verify key user flows before merging changes.

## Stock Imports
1. Log in as an administrator.
2. Navigate to **Inventory → Stock Import**.
3. Upload a CSV file with sample products.
4. Confirm the preview matches the file contents and submit the import.
5. Verify new inventory entries appear in the product list.

## Promotions
1. Log in as an administrator.
2. Go to **Marketing → Promotions**.
3. Create a new promotion with a discount code and expiry date.
4. Apply the code during checkout to confirm the discount is applied.
5. Ensure the promotion appears in the promotions list and can be toggled on/off.

## Dashboards
1. Sign in to the dashboard as a merchant.
2. Open **Reports → Sales Dashboard**.
3. Confirm charts render for total revenue, top products, and recent orders.
4. Adjust the date range filter and verify the data updates accordingly.
5. Export the report to CSV and confirm the file downloads.

Keep this document updated whenever user flows change.
