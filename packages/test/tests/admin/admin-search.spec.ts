import { test, expect } from '@playwright/test';

test.describe('Admin Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin signin page
    await page.goto('/signin');

    // Login with admin credentials
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation and admin dashboard to load
    await page.waitForURL('/');
    await expect(page.locator('[data-testid="admin-home"]')).toBeVisible();
    
    // Wait for items and search functionality to be ready
    await page.waitForSelector('[data-testid^="item-card-"]', { timeout: 10000 });
  });

  test('should show pho items when searching for "pho"', async ({ page }) => {
    // Find the search input using a more specific selector
    const searchInput = page.locator('input[placeholder*="Search for menu items"]');
    await expect(searchInput).toBeVisible();
    
    // Type "pho" in the search input
    await searchInput.fill('pho');

    // Wait for search results to appear and verify Pho Bo is found
    await expect(page.getByText('Pho Bo')).toBeVisible({ timeout: 5000 });
  });
});