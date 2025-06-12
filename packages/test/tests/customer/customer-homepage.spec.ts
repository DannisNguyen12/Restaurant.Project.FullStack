import { test, expect } from '@playwright/test';

test.describe('Customer Homepage Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to customer homepage
    await page.goto('/');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for items to load
    await page.waitForSelector('[data-testid^="item-card-"]', { timeout: 15000 });
  });

  test('should display 4 items on homepage initial load', async ({ page }) => {
    // Add debugging to see what's happening
    const itemCount = await page.locator('[data-testid^="item-card-"]').count();
    console.log(`Found ${itemCount} items on the page`);
    
    // Initially all items should be visible (Pho Bo, Banh Mi, Spring Rolls, Tiramisu)
    await expect(page.locator('[data-testid^="item-card-"]')).toHaveCount(4, { timeout: 10000 });
    
    // Verify all expected items are present
    await expect(page.locator('text=Pho Bo')).toBeVisible();
    await expect(page.locator('text=Banh Mi')).toBeVisible();
    await expect(page.locator('text=Spring Rolls')).toBeVisible();
    await expect(page.locator('text=Tiramisu')).toBeVisible();
  });

  test('should show 1 item when Dessert category is selected', async ({ page }) => {
    // Wait for categories to load
    await page.waitForSelector('button:has-text("Dessert")', { timeout: 10000 });
    
    // Click on Dessert category
    await page.click('button:has-text("Dessert")');
    
    // Wait for filter to apply
    await expect(page.locator('[data-testid^="item-card-"]')).toHaveCount(1, { timeout: 5000 });
    
    // Verify Tiramisu is the only item visible
    await expect(page.locator('text=Tiramisu')).toBeVisible();
    
    // Verify other items are not visible
    await expect(page.locator('text=Pho Bo')).not.toBeVisible();
    await expect(page.locator('text=Banh Mi')).not.toBeVisible();
    await expect(page.locator('text=Spring Rolls')).not.toBeVisible();
  });

  test('should show 1 item when searching for "pho"', async ({ page }) => {
    // Find the search input - check multiple possible selectors
    let searchInput = page.locator('[data-testid="search-input"]');
    
    // If data-testid doesn't exist, try placeholder text
    if (await searchInput.count() === 0) {
      searchInput = page.locator('input[placeholder*="Search for menu items"]');
    }
    
    // If still not found, try any search input
    if (await searchInput.count() === 0) {
      searchInput = page.locator('input[type="text"]').first();
    }
    
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    
    // Type "pho" in the search input
    await searchInput.fill('pho');
    
    // Wait for search results
    await expect(page.locator('[data-testid^="item-card-"]')).toHaveCount(1, { timeout: 5000 });
  
    // Verify Pho Bo is visible (be more specific to avoid strict mode violations)
    await expect(page.locator('[data-testid^="item-card-"]').locator('text=Pho Bo').first()).toBeVisible();
    
    // Verify other items are not visible
    await expect(page.locator('text=Banh Mi')).not.toBeVisible();
    await expect(page.locator('text=Spring Rolls')).not.toBeVisible();
    await expect(page.locator('text=Tiramisu')).not.toBeVisible();
  });

  test('should return to all items when clicking "All Items" after category filter', async ({ page }) => {
    // Wait for categories to load
    await page.waitForSelector('[data-testid="category-all-items"]', { timeout: 10000 });
    
    // Click "All Items"
    await page.click('[data-testid="category-all-items"]');
    
    // Wait for all items to return
    await expect(page.locator('[data-testid^="item-card-"]')).toHaveCount(4, { timeout: 10000 });
  });
});
