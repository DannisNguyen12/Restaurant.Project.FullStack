import { test, expect } from '@playwright/test';

test.describe('Admin Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin home page
    await page.goto('/admin');

    // Login with admin credentials
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="login-button"]');

    // Wait for home page to load
    await expect(page.locator('[data-testid="admin-home"]')).toBeVisible();
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