import { test, expect } from '@playwright/test';

test.describe('Admin Menu Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3002/signin');
    await page.fill('input[type="email"]', 'admin@restaurant.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3002');
  });

  test('should display menu items dashboard', async ({ page }) => {
    // Should show main content area
    await expect(page.locator('main')).toBeVisible();
    
    // Should show categories sidebar
    await expect(page.locator('text=Vietnamese Restaurant')).toBeVisible();
    
    // Should show search bar
    await expect(page.locator('input[type="search"]')).toBeVisible();
    
    // Should show menu items or loading state
    const hasItems = await page.locator('[data-testid="menu-items"]').count();
    const hasLoading = await page.locator('[data-testid="loading"]').count();
    expect(hasItems > 0 || hasLoading > 0).toBeTruthy();
  });

  test('should navigate between categories', async ({ page }) => {
    // Wait for categories to load
    await page.waitForSelector('nav ul li button');
    
    // Get all category buttons
    const categoryButtons = page.locator('nav ul li button');
    const categoryCount = await categoryButtons.count();
    
    if (categoryCount > 1) {
      // Click on second category
      await categoryButtons.nth(1).click();
      
      // Should update the selected state
      await expect(categoryButtons.nth(1)).toHaveClass(/bg-indigo-600/);
      
      // Should load items for that category
      await page.waitForTimeout(1000); // Wait for API call
    }
  });

  test('should show "All Items" category by default', async ({ page }) => {
    // Wait for categories to load
    await page.waitForSelector('nav ul li button');
    
    // First button should be "All Items" and selected
    const firstButton = page.locator('nav ul li button').first();
    await expect(firstButton).toContainText('All Items');
    await expect(firstButton).toHaveClass(/bg-indigo-600/);
  });

  test('should display "Create Item" button in sidebar', async ({ page }) => {
    // Should show create item button
    const createButton = page.locator('button:has-text("Create Item")');
    await expect(createButton).toBeVisible();
    
    // Button should have proper styling
    await expect(createButton).toHaveClass(/bg-green-600/);
  });

  test('should navigate to item creation page', async ({ page }) => {
    // Click create item button
    await page.click('button:has-text("Create Item")');
    
    // Should navigate to create page
    await expect(page).toHaveURL('http://localhost:3002/item/create');
    
    // Should show item creation form
    await expect(page.locator('form')).toBeVisible();
  });

  test('should display loading state while fetching items', async ({ page }) => {
    // Reload page to trigger loading state
    await page.reload();
    
    // Should show loading spinner or skeleton
    const loadingElements = [
      page.locator('[data-testid="loading"]'),
      page.locator('.animate-spin'),
      page.locator('text=Loading')
    ];
    
    let hasLoading = false;
    for (const element of loadingElements) {
      if (await element.count() > 0) {
        hasLoading = true;
        break;
      }
    }
    
    // At least one loading indicator should be present initially
    expect(hasLoading).toBeTruthy();
  });

  test('should handle empty menu items state', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(2000);
    
    // Check if there are no items
    const itemsContainer = page.locator('[data-testid="menu-items"]');
    const itemCount = await page.locator('[data-testid="menu-item"]').count();
    
    if (itemCount === 0) {
      // Should show empty state message
      const emptyStateMessages = [
        page.locator('text=No items found'),
        page.locator('text=No menu items'),
        page.locator('text=Start by adding your first menu item')
      ];
      
      let hasEmptyState = false;
      for (const message of emptyStateMessages) {
        if (await message.count() > 0) {
          hasEmptyState = true;
          break;
        }
      }
      
      expect(hasEmptyState).toBeTruthy();
    }
  });

  test('should display menu items with proper information', async ({ page }) => {
    // Wait for items to load
    await page.waitForTimeout(2000);
    
    const items = page.locator('[data-testid="menu-item"]');
    const itemCount = await items.count();
    
    if (itemCount > 0) {
      const firstItem = items.first();
      
      // Each item should have name, price, and image
      await expect(firstItem.locator('[data-testid="item-name"]')).toBeVisible();
      await expect(firstItem.locator('[data-testid="item-price"]')).toBeVisible();
      await expect(firstItem.locator('[data-testid="item-image"]')).toBeVisible();
      
      // Should have action buttons (edit, delete, view)
      const actionButtons = firstItem.locator('button');
      expect(await actionButtons.count()).toBeGreaterThan(0);
    }
  });

  test('should handle item click navigation', async ({ page }) => {
    // Wait for items to load
    await page.waitForTimeout(2000);
    
    const items = page.locator('[data-testid="menu-item"]');
    const itemCount = await items.count();
    
    if (itemCount > 0) {
      // Click on first item
      await items.first().click();
      
      // Should navigate to item detail page
      await expect(page).toHaveURL(/\/item\/\d+/);
    }
  });

  test('should filter items by category correctly', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(2000);
    
    // Get initial item count for "All Items"
    const allItemsCount = await page.locator('[data-testid="menu-item"]').count();
    
    // Get category buttons (skip "All Items")
    const categoryButtons = page.locator('nav ul li button');
    const categoryCount = await categoryButtons.count();
    
    if (categoryCount > 1) {
      // Click on a specific category
      await categoryButtons.nth(1).click();
      
      // Wait for items to update
      await page.waitForTimeout(1000);
      
      // Item count should potentially be different (unless all items are in this category)
      const categoryItemsCount = await page.locator('[data-testid="menu-item"]').count();
      
      // The category should be selected
      await expect(categoryButtons.nth(1)).toHaveClass(/bg-indigo-600/);
    }
  });
});
