import { test, expect } from '@playwright/test';

test.describe('Admin Category Navigation', () => {
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

  test('should filter items by category selection', async ({ page }) => {
    // Initially all items should be visible (Pho Bo, Banh Mi, Spring Rolls, Tiramisu)
    await expect(page.locator('[data-testid^="item-card-"]')).toHaveCount(4);

    // Click on Appetizer category (should find category with ID 1)
    await page.click('[data-testid="category-1"]');

    // Wait for filter to apply and check that spring roll items are visible
    await page.waitForTimeout(1000);
    const appetizers = page.locator('[data-testid^="item-card-"]');
    await expect(appetizers).toHaveCount(1); // Should show only spring rolls
    
    // Verify spring rolls is visible (should contain "Spring Rolls" text)
    await expect(page.locator('text=Spring Rolls')).toBeVisible();

    // Verify the category shows as selected (should have active styling)
    await expect(page.locator('[data-testid="category-1"]')).toHaveClass(/bg-indigo-600/);

    // Click on Main Course category (should find category with ID 2)
    await page.click('[data-testid="category-2"]');

    // Wait for filter to apply
    await page.waitForTimeout(1000);
    const mainCourses = page.locator('[data-testid^="item-card-"]');
    await expect(mainCourses).toHaveCount(2); // Should show Pho Bo and Banh Mi
    
    // Verify main course items are visible
    await expect(page.locator('text=Pho Bo')).toBeVisible();
    await expect(page.locator('text=Banh Mi')).toBeVisible();

    // Click "All Items" to show all items again
    await page.click('[data-testid="category-all-items"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid^="item-card-"]')).toHaveCount(4);
    
    // Verify all items are visible again
    await expect(page.locator('text=Pho Bo')).toBeVisible();
    await expect(page.locator('text=Banh Mi')).toBeVisible();
    await expect(page.locator('text=Spring Rolls')).toBeVisible();
    await expect(page.locator('text=Tiramisu')).toBeVisible();
  });

  test('should show correct category highlighting', async ({ page }) => {
    // All Items should be selected by default
    await expect(page.locator('[data-testid="category-all-items"]')).toHaveClass(/bg-indigo-600/);

    // Click Appetizer category
    await page.click('[data-testid="category-1"]');
    await expect(page.locator('[data-testid="category-1"]')).toHaveClass(/bg-indigo-600/);
    await expect(page.locator('[data-testid="category-all-items"]')).not.toHaveClass(/bg-indigo-600/);

    // Click Main Course category  
    await page.click('[data-testid="category-2"]');
    await expect(page.locator('[data-testid="category-2"]')).toHaveClass(/bg-indigo-600/);
    await expect(page.locator('[data-testid="category-1"]')).not.toHaveClass(/bg-indigo-600/);

    // Click back to All Items
    await page.click('[data-testid="category-all-items"]');
    await expect(page.locator('[data-testid="category-all-items"]')).toHaveClass(/bg-indigo-600/);
    await expect(page.locator('[data-testid="category-2"]')).not.toHaveClass(/bg-indigo-600/);
  });

  test('should display category names correctly', async ({ page }) => {
    // Check that all categories are visible with correct names
    await expect(page.locator('[data-testid="category-all-items"]')).toContainText('All Items');
    await expect(page.locator('[data-testid="category-1"]')).toContainText('Appetizer');
    await expect(page.locator('[data-testid="category-2"]')).toContainText('Main Course');  
    await expect(page.locator('[data-testid="category-3"]')).toContainText('Dessert');
  });
});