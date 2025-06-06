import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
  });

  test('should display admin login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Vietnamese Restaurant/);
    
    // Should redirect to signin if not authenticated
    await expect(page).toHaveURL(/signin/);
    
    // Check for sign-in form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should handle invalid admin login', async ({ page }) => {
    await page.goto('http://localhost:3002/signin');
    
    // Fill invalid credentials
    await page.fill('input[type="email"]', 'invalid@admin.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should stay on signin page or show error
    await expect(page).toHaveURL(/signin/);
  });

  test('should successfully login with valid admin credentials', async ({ page }) => {
    await page.goto('http://localhost:3002/signin');
    
    // Fill valid admin credentials
    await page.fill('input[type="email"]', 'admin@restaurant.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL('http://localhost:3002');
    
    // Should show admin interface elements
    await expect(page.locator('text=Vietnamese Restaurant')).toBeVisible();
  });

  test('should show user menu when authenticated', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3002/signin');
    await page.fill('input[type="email"]', 'admin@restaurant.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Check for user menu
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Click user menu
    await page.click('[data-testid="user-menu"]');
    
    // Should show dropdown with sign out option
    await expect(page.locator('text=Sign Out')).toBeVisible();
    await expect(page.locator('text=Signed in as')).toBeVisible();
  });

  test('should successfully logout', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3002/signin');
    await page.fill('input[type="email"]', 'admin@restaurant.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Open user menu and click sign out
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sign Out');
    
    // Should redirect to signin page
    await expect(page).toHaveURL(/signin/);
  });

  test('should protect admin routes from unauthenticated access', async ({ page }) => {
    // Try to access admin dashboard without authentication
    await page.goto('http://localhost:3002');
    
    // Should redirect to signin
    await expect(page).toHaveURL(/signin/);
    
    // Try to access item creation page
    await page.goto('http://localhost:3002/item/create');
    
    // Should redirect to signin
    await expect(page).toHaveURL(/signin/);
  });

  test('should handle session timeout gracefully', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3002/signin');
    await page.fill('input[type="email"]', 'admin@restaurant.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Clear session storage to simulate timeout
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    
    // Try to perform an admin action
    await page.reload();
    
    // Should redirect to signin due to session timeout
    await expect(page).toHaveURL(/signin/);
  });
});
