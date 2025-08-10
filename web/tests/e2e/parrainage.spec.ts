import { test, expect } from '@playwright/test';

// Simulates referral flow: a client becomes a seed, a referral completes a purchase,
// and admin groups payments to mark commissions as paid.
test('referral purchase generates commissions and admin can pay them', async ({ page }) => {
  const baseUrl = process.env.VITE_SUPABASE_URL || '';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  const fetchCommissions = async (orderId: string) => {
    const res = await page.request.get(
      `${baseUrl}/rest/v1/commissions?order_id=eq.${orderId}`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      }
    );
    return res.json();
  };

  try {
    // Client becomes a seed and obtains referral link
    await page.goto('/');
    await page.click('[data-test="become-seed"]');
    const referralLink = (await page.locator('[data-test="referral-link"]').textContent())?.trim() || '';

    // Referral client completes a purchase
    const referral = await page.context().newPage();
    await referral.goto(referralLink);
    await referral.click('[data-test="product-card"]');
    await referral.click('[data-test="add-to-cart"]');
    await referral.click('[data-test="checkout-button"]');
    await referral.fill('[data-test="customer-name"]', 'Referral User');
    await referral.fill('[data-test="customer-email"]', 'referral@example.com');
    await referral.click('[data-test="confirm-order"]');
    const orderUrl = referral.url();
    const orderId = orderUrl.split('/').find((segment) => /^\d+$/.test(segment)) || '';

    // Verify three commission records were created
    const commissions = await fetchCommissions(orderId);
    expect(commissions).toHaveLength(3);

    // Admin logs in and performs grouped payment
    const admin = await page.context().newPage();
    await admin.goto('/admin/login');
    await admin.fill('[data-test="admin-email"]', 'admin@example.com');
    await admin.fill('[data-test="admin-password"]', 'password');
    await Promise.all([
      admin.waitForURL('**/admin**'),
      admin.click('[data-test="admin-login-submit"]'),
    ]);

    await admin.click('[data-test="grouped-payment"]');

    // Confirm commissions are marked as paid
    const updated = await fetchCommissions(orderId);
    updated.forEach((c: any) => expect(c.paid).toBe(true));
  } catch (error) {
    await page.screenshot({ path: `parrainage-failure-${Date.now()}.png`, fullPage: true });
    throw error;
  }
});
