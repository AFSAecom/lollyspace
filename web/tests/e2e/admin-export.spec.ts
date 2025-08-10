import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import * as XLSX from 'xlsx';

// Logs in as admin and verifies sales and commissions exports have correct headers.
test('admin can export sales and commissions', async ({ page }, testInfo) => {
  const files: string[] = [];
  try {
    // Admin login
    await page.goto('/admin/login');
    await page.fill('[data-test="admin-email"]', 'admin@example.com');
    await page.fill('[data-test="admin-password"]', 'password');
    await Promise.all([
      page.waitForURL('**/admin**'),
      page.click('[data-test="admin-login-submit"]'),
    ]);

    // Export sales
    const [salesDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Export .xlsx'),
    ]);
    const salesPath = testInfo.outputPath('sales.xlsx');
    await salesDownload.saveAs(salesPath);
    files.push(salesPath);
    const salesWorkbook = XLSX.readFile(salesPath);
    const salesSheet = salesWorkbook.Sheets[salesWorkbook.SheetNames[0]];
    const salesHeader = XLSX.utils.sheet_to_json(salesSheet, { header: 1 })[0] as string[];
    expect(salesHeader).toContain('id');
    expect(salesHeader).toContain('total_tnd');
    expect(salesHeader).toContain('created_at');

    // Export commissions
    await page.click('text=Commissions');
    const [commDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Export .xlsx'),
    ]);
    const commPath = testInfo.outputPath('commissions.xlsx');
    await commDownload.saveAs(commPath);
    files.push(commPath);
    const commWorkbook = XLSX.readFile(commPath);
    const commSheet = commWorkbook.Sheets[commWorkbook.SheetNames[0]];
    const commHeader = XLSX.utils.sheet_to_json(commSheet, { header: 1 })[0] as string[];
    expect(commHeader).toContain('referrer_id');
    expect(commHeader).toContain('total_tnd');
  } catch (error) {
    await page.screenshot({ path: `admin-export-failure-${Date.now()}.png`, fullPage: true });
    throw error;
  } finally {
    for (const f of files) {
      await fs.unlink(f).catch(() => {});
    }
  }
});

