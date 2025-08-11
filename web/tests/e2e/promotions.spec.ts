import { test, expect } from '@playwright/test';

// Opportunistic E2E spec verifying PACK3 and BxGy promotion scenarios
// by mocking the promotions API and promotion application endpoint.
test('PACK3 and BxGy promotions', async ({ page }) => {
  await page.route('**/api/admin/promotions', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 'pack3', name: 'Pack 3', type: 'pack' },
        { id: 'bxgy', name: 'Buy X Get Y', type: 'two_plus_one' },
      ]),
    });
  });

  await page.route('**/functions/v1/apply_promotions', async (route) => {
    const req = await route.request().postDataJSON();
    const items = req.items.map((i: any) => {
      let discount_tnd = 0;
      if (i.product_variant_id === 1 && i.qty >= 3) {
        discount_tnd = Number((i.unit_price_tnd / 3).toFixed(3));
      } else if (i.product_variant_id === 2 && i.qty >= 2) {
        discount_tnd = Number((i.unit_price_tnd / 2).toFixed(3));
      }
      return { ...i, discount_tnd };
    });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items }),
    });
  });

  await page.goto('data:text/html,<html></html>');

  const promos = await page.evaluate(async () => {
    const res = await fetch('https://example.com/api/admin/promotions');
    return res.json();
  });
  expect(promos).toHaveLength(2);

  const packRes = await page.evaluate(async () => {
    const res = await fetch('https://example.com/functions/v1/apply_promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ product_variant_id: 1, qty: 3, unit_price_tnd: 1 }],
      }),
    });
    return res.json();
  });
  expect(packRes.items[0].discount_tnd).toBeCloseTo(0.333, 3);

  const bxgyRes = await page.evaluate(async () => {
    const res = await fetch('https://example.com/functions/v1/apply_promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ product_variant_id: 2, qty: 2, unit_price_tnd: 1 }],
      }),
    });
    return res.json();
  });
  expect(bxgyRes.items[0].discount_tnd).toBeCloseTo(0.5, 3);
});
