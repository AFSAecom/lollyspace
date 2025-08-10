import { test, expect } from '@playwright/test';

// Simulates a full purchase flow from search to checkout confirmation.
test('client can search and purchase a product', async ({ page }, testInfo) => {
  try {
    // Visit home page and perform dual search
    await page.goto('/');
    await page.fill('[data-test="search-origin"]', 'alpha');
    await page.fill('[data-test="search-destination"]', 'beta');
    await Promise.all([
      page.waitForURL('**/search**'),
      page.click('[data-test="search-submit"]'),
    ]);

    // Navigate to product detail
    await page.locator('[data-test="product-card"]').first().click();
    await expect(page).toHaveURL(/products\/\d+/);

    // Choose volume and add to cart
    await page.selectOption('[data-test="volume-selector"]', '500');
    await page.click('[data-test="add-to-cart"]');

    // Navigate to cart and validate contents
    await page.click('[data-test="cart-link"]');
    await expect(page).toHaveURL(/cart/);
    await expect(page.locator('[data-test="cart-item"]').first()).toBeVisible();

    // Proceed through checkout
    await page.click('[data-test="checkout-button"]');
    await expect(page).toHaveURL(/checkout/);
    await page.fill('[data-test="customer-name"]', 'Test User');
    await page.fill('[data-test="customer-email"]', 'test@example.com');
    await page.click('[data-test="confirm-order"]');

    // Assert confirmation screen
    await expect(page).toHaveURL(/confirmation/);
    await expect(page.locator('[data-test="confirmation-message"]')).toBeVisible();
  } catch (error) {
    await page.screenshot({ path: `client-purchase-failure-${Date.now()}.png`, fullPage: true });
    throw error;
  }
});
