import { test, expect } from '@playwright/test';

test.describe('Admin Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate first
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill('admin@restaurant.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/');
  });

  test('should show pho items when searching for "pho"', async ({ page }) => {
    // Find the search input
    const searchInput = page.getByRole('textbox', { name: /search/i });
    await expect(searchInput).toBeVisible();
    
    // Type "pho" in the search input
    await searchInput.fill('pho');

    await expect(page.getByText('Pho')).toBeVisible();
  });
});