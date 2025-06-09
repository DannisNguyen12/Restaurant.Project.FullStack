import { test, expect } from '@playwright/test';

test.describe('Admin Category Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate first
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/');
  });

  test('should filter items by category selection', async ({ page }) => {
    // Wait for initial load

    await page.getByTestId('category-appetizer').click();
    await expect(page.getByText('Appetizer')).toBeVisible();    
    await page.waitForTimeout(1000);
    
    await expect(page.getByText('Spring Rolls')).toBeVisible();
  });
});