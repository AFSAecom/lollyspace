import { test, expect } from '@playwright/test';

// Basic smoke test verifying cart badge increments when adding a product from the home page.
test('adding first product increments cart badge', async ({ page }) => {
  try {
    // Visit home page and record initial cart badge value
    await page.goto('/');
    const badge = page.locator('[data-test="cart-badge"]');
    const initial = parseInt((await badge.textContent()) || '0', 10);

    // Open first product and add to cart
    await page.locator('[data-test="product-card"]').first().click();
    await expect(page).toHaveURL(/products\/\d+/);
    await page.click('[data-test="add-to-cart"]');

    // Ensure cart badge incremented
    await expect(badge).toHaveText(String(initial + 1));
  } catch (error) {
    await page.screenshot({ path: `smoke-failure-${Date.now()}.png`, fullPage: true });
    throw error;
  }
});
