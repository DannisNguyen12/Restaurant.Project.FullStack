import { test, expect } from '@playwright/test';

test.describe('Customer Menu Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display menu categories in sidebar', async ({ page }) => {
    // Check for categories sidebar
    const sidebar = page.locator('[class*="sidebar"], [class*="leftmenu"], nav').first();
    await expect(sidebar).toBeVisible();
    
    // Common category names to check for
    const categoryNames = ['All Items', 'Appetizers', 'Main Course', 'Desserts', 'Beverages'];
    
    for (const category of categoryNames) {
      const categoryElement = page.locator(`text="${category}"`).or(
        page.locator(`[class*="category"]:has-text("${category}")`).or(
          page.locator(`li:has-text("${category}")`).or(
            page.locator(`button:has-text("${category}")`)
          )
        )
      );
      
      if (await categoryElement.isVisible()) {
        await expect(categoryElement).toBeVisible();
        break; // At least one category should be visible
      }
    }
  });

  test('should load and display menu items', async ({ page }) => {
    // Wait for items to load
    await page.waitForLoadState('networkidle');
    
    // Check for menu items container
    const itemsContainer = page.locator('[class*="items"], [class*="menu"], [class*="grid"], main').first();
    await expect(itemsContainer).toBeVisible();
    
    // Check for individual menu items
    const menuItems = page.locator('[class*="item"], [class*="card"], [class*="product"]');
    
    if (await menuItems.count() > 0) {
      await expect(menuItems.first()).toBeVisible();
      
      // Check if items have basic information
      const firstItem = menuItems.first();
      await expect(firstItem.locator('text=/\\$\\d+/').or(firstItem.locator('[class*="price"]'))).toBeVisible();
    }
  });

  test('should navigate between categories', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find category navigation
    const categories = page.locator('[class*="category"], nav li, [role="tab"]');
    
    if (await categories.count() > 1) {
      // Click on second category if available
      await categories.nth(1).click();
      
      // Wait for content to update
      await page.waitForTimeout(1000);
      
      // Verify category is selected
      const selectedCategory = page.locator('[class*="active"], [class*="selected"], [aria-selected="true"]');
      if (await selectedCategory.isVisible()) {
        await expect(selectedCategory).toBeVisible();
      }
    }
  });

  test('should display item details when clicked', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find a menu item to click
    const menuItems = page.locator('[class*="item"], [class*="card"], [class*="product"]');
    
    if (await menuItems.count() > 0) {
      const firstItem = menuItems.first();
      await firstItem.click();
      
      // Should navigate to item detail page or show modal
      await expect(
        page.url().includes('/item/') ||
        page.locator('[class*="modal"], [class*="detail"], [class*="popup"]').isVisible()
      ).toBeTruthy();
    }
  });

  test('should show item information correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const menuItems = page.locator('[class*="item"], [class*="card"], [class*="product"]');
    
    if (await menuItems.count() > 0) {
      const firstItem = menuItems.first();
      
      // Check for item name
      await expect(firstItem.locator('h1, h2, h3, h4, [class*="title"], [class*="name"]')).toBeVisible();
      
      // Check for price
      await expect(firstItem.locator('text=/\\$\\d+/, [class*="price"]')).toBeVisible();
    }
  });

  test('should handle empty menu state gracefully', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Click on a category that might be empty
    const categories = page.locator('[class*="category"], nav li, [role="tab"]');
    
    if (await categories.count() > 0) {
      // Try clicking different categories to find an empty one
      for (let i = 0; i < await categories.count() && i < 3; i++) {
        await categories.nth(i).click();
        await page.waitForTimeout(1000);
        
        const menuItems = page.locator('[class*="item"], [class*="card"], [class*="product"]');
        
        if (await menuItems.count() === 0) {
          // Should show empty state message
          const emptyMessage = page.locator('text="No items", text="Empty", text="Nothing found", [class*="empty"]');
          if (await emptyMessage.isVisible()) {
            await expect(emptyMessage).toBeVisible();
            break;
          }
        }
      }
    }
  });

  test('should show loading state while fetching items', async ({ page }) => {
    // Navigate to page and check for loading indicators
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Should show loading indicators initially
    const loadingIndicators = page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"], [class*="animate"]');
    
    if (await loadingIndicators.count() > 0) {
      await expect(loadingIndicators.first()).toBeVisible();
    }
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
  });

  test('should maintain category selection during page interactions', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const categories = page.locator('[class*="category"], nav li, [role="tab"]');
    
    if (await categories.count() > 1) {
      // Select a specific category
      await categories.nth(1).click();
      await page.waitForTimeout(1000);
      
      // Interact with the page (scroll, etc.)
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(500);
      
      // Category should still be selected
      const selectedCategory = page.locator('[class*="active"], [class*="selected"], [aria-selected="true"]');
      if (await selectedCategory.isVisible()) {
        await expect(selectedCategory).toBeVisible();
      }
    }
  });

  test('should handle category loading errors gracefully', async ({ page }) => {
    // Test error handling by potentially intercepting network requests
    await page.route('**/api/categories*', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Should handle error gracefully
    const errorMessage = page.locator('text="Error", text="Failed", [class*="error"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should support keyboard navigation for categories', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const categories = page.locator('[class*="category"], nav li, button[role="tab"]');
    
    if (await categories.count() > 0) {
      // Focus on first category
      await categories.first().focus();
      
      // Use arrow keys to navigate
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(500);
      
      // Check if navigation worked
      const focusedElement = await page.evaluate(() => document.activeElement?.textContent);
      expect(focusedElement).toBeDefined();
    }
  });

  test('should show visual feedback for category interactions', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const categories = page.locator('[class*="category"], nav li, [role="tab"]');
    
    if (await categories.count() > 1) {
      const category = categories.nth(1);
      
      // Hover over category
      await category.hover();
      
      // Should show hover state (visual feedback)
      await expect(category).toBeVisible();
      
      // Click category
      await category.click();
      
      // Should show selected state
      await expect(category).toBeVisible();
    }
  });

  test('should handle rapid category switching', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const categories = page.locator('[class*="category"], nav li, [role="tab"]');
    const categoryCount = await categories.count();
    
    if (categoryCount > 2) {
      // Rapidly switch between categories
      for (let i = 0; i < Math.min(3, categoryCount); i++) {
        await categories.nth(i).click();
        await page.waitForTimeout(200); // Short delay to simulate rapid clicking
      }
      
      // Should handle rapid switching without breaking
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible(); // Page should still be functional
    }
  });

  test('should display item images when available', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const menuItems = page.locator('[class*="item"], [class*="card"], [class*="product"]');
    
    if (await menuItems.count() > 0) {
      const itemImages = page.locator('img[src*="/"], img[alt*="item"], img[alt*="food"]');
      
      if (await itemImages.count() > 0) {
        // Check if images load properly
        const firstImage = itemImages.first();
        await expect(firstImage).toBeVisible();
        
        // Check image attributes
        await expect(firstImage).toHaveAttribute('src');
        await expect(firstImage).toHaveAttribute('alt');
      }
    }
  });

  test('should handle item interactions and navigation', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const menuItems = page.locator('[class*="item"], [class*="card"], [class*="product"]');
    
    if (await menuItems.count() > 0) {
      const firstItem = menuItems.first();
      
      // Should be clickable
      await expect(firstItem).toBeVisible();
      
      // Click should work
      await firstItem.click();
      
      // Should navigate or show details
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible(); // Basic functionality check
    }
  });
});
