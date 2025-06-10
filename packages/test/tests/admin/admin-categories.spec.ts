import { test, expect } from '@playwright/test';

test.describe('Admin Category Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signin page first
    await page.goto('/signin');

    // Login with admin credentials
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation to home page and ensure admin dashboard is loaded
    await page.waitForURL('/');
    await expect(page.locator('[data-testid="admin-home"]')).toBeVisible();
    
    // Wait for both items and categories to load
    await page.waitForSelector('[data-testid^="item-card-"]', { timeout: 10000 });
    await page.waitForSelector('[data-testid="category-all-items"]', { timeout: 10000 });
    
    // Wait for categories to be loaded and the loading spinner to disappear
    await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 });
    
    // Wait for categories to be loaded by checking for category names
    await page.waitForSelector('button:has-text("Appetizer")', { timeout: 10000 });
    await page.waitForSelector('button:has-text("Main Course")', { timeout: 10000 });
    await page.waitForSelector('button:has-text("Dessert")', { timeout: 10000 });
  });

  test('should filter items by category selection', async ({ page }) => {
    // Initially all items should be visible (Pho Bo, Banh Mi, Spring Rolls, Tiramisu)
    await expect(page.locator('[data-testid^="item-card-"]')).toHaveCount(4);

    // Click on Appetizer category using text content
    await page.click('button:has-text("Appetizer")');

    // Wait for filter to apply and check that spring roll items are visible
    await expect(page.locator('[data-testid^="item-card-"]')).toHaveCount(1); // Should show only spring rolls
    
    // Verify spring rolls is visible (should contain "Spring Rolls" text)
    await expect(page.locator('text=Spring Rolls')).toBeVisible();

    // Verify the appetizer category shows as selected (should have active styling)
    await expect(page.locator('button:has-text("Appetizer")')).toHaveClass(/bg-indigo-600/);

    // Click on Main Course category using text content
    await page.click('button:has-text("Main Course")');

    // Wait for filter to apply
    await expect(page.locator('[data-testid^="item-card-"]')).toHaveCount(2); // Should show Pho Bo and Banh Mi
  });

  test('should display category names correctly', async ({ page }) => {
    // Check that all categories are visible with correct names
    await expect(page.locator('[data-testid="category-all-items"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-all-items"]')).toContainText('All Items');
    
    // Use text-based selectors instead of hardcoded IDs for categories
    await expect(page.locator('button:has-text("Appetizer")')).toBeVisible();
    await expect(page.locator('button:has-text("Appetizer")')).toContainText('Appetizer');
    
    await expect(page.locator('button:has-text("Main Course")')).toBeVisible();
    await expect(page.locator('button:has-text("Main Course")')).toContainText('Main Course');
    
    await expect(page.locator('button:has-text("Dessert")')).toBeVisible();
    await expect(page.locator('button:has-text("Dessert")')).toContainText('Dessert');
  });
});