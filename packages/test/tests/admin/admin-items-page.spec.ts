import { test, expect } from '@playwright/test';

test.describe('Admin Items Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login page
    await page.goto('/signin');
    
    // Assume admin credentials exist for testing
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');
  });

  test('should display items page with all items loaded', async ({ page }) => {
    await page.goto('/item/417');

    await expect(page.getByTitle('Edit').isVisible();
    await page.click('button:has-text("Edit")');

    await page.getByText('Price').click();
    await page.getByLabel('Price').fill('10.99');
    await page.click('button:has-text("Save")');
    await expect(page.getByText('10.99')).toBeVisible();
  });
});