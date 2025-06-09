import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await page.goto('/');
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/signin');
    
    // Enter invalid credentials
    await page.getByLabel(/email/i).fill('link@example.com');
    await page.getByLabel(/password/i).fill('123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show error message
    await expect(page.url()).toContain('/signin');
  });

  test('should successfully authenticate with valid credentials', async ({ page }) => {
    await page.goto('/signin');
    
    // Enter valid credentials (these would need to be set up in test data)
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to home page
    await expect(page).toHaveURL('/');
  });
});
