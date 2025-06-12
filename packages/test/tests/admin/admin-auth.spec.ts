import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/signin');
    
    // Enter invalid credentials using reliable data-testid selectors
    await page.fill('[data-testid="email-input"]', 'link@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="login-button"]');
    
    // Should show error message and remain on signin page
    await expect(page.url()).toContain('/signin');
  });

  test('should successfully authenticate with valid credentials', async ({ page }) => {
    await page.goto('/signin');
    
    // Enter valid credentials using reliable data-testid selectors
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for navigation to complete
    await page.waitForURL('/');
    
    // Should redirect to home page and show admin dashboard
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('admin-home')).toBeVisible();
  });
});
