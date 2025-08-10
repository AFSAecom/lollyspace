import { test, expect } from '@playwright/test';

// Simulates an advisor completing a sale and verifies stock decreases.
test('advisor can complete a sale and reduce stock', async ({ page }, testInfo) => {
  const variantId = 1;
  const baseUrl = process.env.VITE_SUPABASE_URL || '';

  const fetchStock = async () => {
    const res = await page.request.get(
      `${baseUrl}/rest/v1/variant_stocks?variant_id=eq.${variantId}`,
      {
        headers: {
          apikey: process.env.VITE_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || ''}`,
        },
      }
    );
    const data = await res.json();
    return data?.[0]?.stock_current ?? 0;
  };

  try {
    const stockBefore = await fetchStock();

    // Advisor login
    await page.goto('/advisor/login');
    await page.fill('[data-test="advisor-email"]', 'advisor@example.com');
    await page.fill('[data-test="advisor-password"]', 'password');
    await Promise.all([
      page.waitForURL('**/advisor**'),
      page.click('[data-test="advisor-login-submit"]'),
    ]);

    // Start a new service
    await page.click('[data-test="new-service"]');

    // Select or create client
    await page.fill('[data-test="client-search"]', 'Client Test');
    await page.click('[data-test="client-select"]');

    // Add product to cart
    await page.click('[data-test="product-card"]');
    await page.click('[data-test="add-product"]');

    // Finalize sale
    await page.click('[data-test="checkout-button"]');
    await page.click('[data-test="confirm-sale"]');

    // Verify stock decreased
    const stockAfter = await fetchStock();
    expect(stockAfter).toBe(stockBefore - 1);
  } catch (error) {
    await page.screenshot({ path: `advisor-sale-failure-${Date.now()}.png`, fullPage: true });
    throw error;
  }
});
