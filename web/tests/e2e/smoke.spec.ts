import { test, expect } from '@playwright/test';

test('homepage loads and shows app name', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveTitle(/Compas|Lolly/i);
  await expect(page.locator('text=Le Compas Olfactif')).toHaveCount(1);
});
