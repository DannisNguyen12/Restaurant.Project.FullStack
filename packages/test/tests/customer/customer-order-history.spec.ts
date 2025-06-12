import { test, expect } from '@playwright/test';

test.describe('Customer Order History Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start with a clean state
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Clear any existing localStorage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Authentication Required', () => {
    test('should redirect to signin when not authenticated', async ({ page }) => {
      // Try to access order history page without authentication
      await page.goto('/order-history');
      
      // Should redirect to signin with callback URL
      await expect(page).toHaveURL(/.*\/signin.*callbackUrl.*order-history/);
    });
  });

  test.describe('Empty Order History', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authenticated user with no orders
      await page.route('/api/orders', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      });
    });
  });
});
