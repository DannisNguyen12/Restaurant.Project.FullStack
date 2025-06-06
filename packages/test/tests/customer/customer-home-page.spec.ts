import { test, expect } from '@playwright/test';
import { main } from '../../../database/src/seed';

test.describe('Customer Homepage', () => {
  test.beforeEach(async ({ page }) => {
    // Reset database to fresh seeded state before each test
    console.log('🌱 Seeding database with fresh data...');
    await main();
    console.log('✅ Database seeded successfully');

    // Navigate to customer homepage
    await page.goto('http://localhost:3001');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  // Test 1: Category filtering verification
  test('Test 1: Category filtering - All Items=4, Appetizer=1, Dessert=1, Main Course=2', async ({ page }) => {
    // Wait for page to load with items
    await page.waitForSelector('text=Pho Bo', { timeout: 10000 });
    
    // Click on "All Items" and verify 4 items
    const allItemsButton = page.locator('[data-testid="category-all-items"]');
    await allItemsButton.click();
    await page.waitForTimeout(500);
    
    const allItems = page.locator('[data-testid^="item-card-"]');
    await expect(allItems).toHaveCount(4);
    
    // Click on "Appetizer" and expect 1 item
    const appetizerButton = page.locator('[data-testid="category-appetizer"]');
    await appetizerButton.click();
    await page.waitForTimeout(500);
    
    const appetizerItems = page.locator('[data-testid^="item-card-"]');
    await expect(appetizerItems).toHaveCount(1);
    await expect(page.locator('text=Spring Rolls')).toBeVisible();
    
    // Click on "Dessert" and expect 1 item
    const dessertButton = page.locator('[data-testid="category-dessert"]');
    await dessertButton.click();
    await page.waitForTimeout(500);
    
    const dessertItems = page.locator('[data-testid^="item-card-"]');
    await expect(dessertItems).toHaveCount(1);
    await expect(page.locator('text=Tiramisu')).toBeVisible();
    
    // Click on "Main Course" and expect 2 items
    const mainCourseButton = page.locator('[data-testid="category-main-course"]');
    await mainCourseButton.click();
    await page.waitForTimeout(500);
    
    const mainCourseItems = page.locator('[data-testid^="item-card-"]');
    await expect(mainCourseItems).toHaveCount(2);
    await expect(page.locator('text=Pho Bo')).toBeVisible();
    await expect(page.locator('text=Banh Mi')).toBeVisible();
  });

  // Test 2: Item detail view and interaction
  test('Test 2: View item details and verify information display', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('text=Pho Bo', { timeout: 10000 });
    
    // Click on Pho Bo item to view details
    const phoBoCard = page.locator('[data-testid^="item-card-"]:has(text("Pho Bo"))');
    const itemLink = phoBoCard.locator('a').first();
    await itemLink.click();
    
    // Wait for item detail page to load
    await page.waitForSelector('text=Pho Bo', { timeout: 10000 });
    
    // Verify item details are displayed
    await expect(page.locator('text=Pho Bo')).toBeVisible();
    await expect(page.locator('text=Traditional Vietnamese beef noodle soup.')).toBeVisible();
    await expect(page.locator('text=12.99, text=$12.99')).toBeVisible();
    
    // Verify full description is visible
    await expect(page.locator('text=Pho bo is one of Vietnam')).toBeVisible();
    
    // Verify ingredients section if present
    const ingredientsSection = page.locator('text=Ingredients, text=ingredients');
    if (await ingredientsSection.count() > 0) {
      await expect(ingredientsSection).toBeVisible();
      await expect(page.locator('text=Beef bones')).toBeVisible();
      await expect(page.locator('text=Rice noodles')).toBeVisible();
    }
    
    // Verify serving tips section if present
    const servingTipsSection = page.locator('text=Serving Tips, text=serving tips');
    if (await servingTipsSection.count() > 0) {
      await expect(servingTipsSection).toBeVisible();
    }
  });

  // Test 3: Cart interaction (add to cart functionality)
  test('Test 3: Add item to cart and verify cart update', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('text=Spring Rolls', { timeout: 10000 });
    
    // Find Spring Rolls item and add to cart
    const springRollsCard = page.locator('[data-testid^="item-card-"]:has(text("Spring Rolls"))');
    const addToCartButton = springRollsCard.locator('button:has-text("Add to Cart"), button:has-text("Add to cart")');
    
    // Verify add to cart button exists
    await expect(addToCartButton).toBeVisible();
    
    // Click add to cart
    await addToCartButton.click();
    
    // Wait for cart update
    await page.waitForTimeout(1000);
    
    // Verify cart indicator shows item added (look for cart count or notification)
    const cartIndicator = page.locator('[data-testid="cart-count"], .cart-count, text=1');
    await expect(cartIndicator.first()).toBeVisible({ timeout: 5000 });
    
    // Try to find cart icon or cart button and verify it shows items
    const cartButton = page.locator('[data-testid="cart-button"], button:has-text("Cart"), a:has-text("Cart")');
    if (await cartButton.count() > 0) {
      await cartButton.click();
      
      // Verify Spring Rolls appears in cart
      await expect(page.locator('text=Spring Rolls')).toBeVisible();
      await expect(page.locator('text=6.99, text=$6.99')).toBeVisible();
    }
  });

  // Test 4: Search functionality
  test('Test 4: Search for items and verify filtered results', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('text=Pho Bo', { timeout: 10000 });
    
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[name="search"]');
    await expect(searchInput).toBeVisible();
    
    // Search for "Pho"
    await searchInput.fill('Pho');
    await page.keyboard.press('Enter');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Verify only Pho Bo is visible
    await expect(page.locator('text=Pho Bo')).toBeVisible();
    
    // Verify other items are not visible
    await expect(page.locator('text=Spring Rolls')).not.toBeVisible();
    await expect(page.locator('text=Banh Mi')).not.toBeVisible();
    await expect(page.locator('text=Tiramisu')).not.toBeVisible();
    
    // Clear search and verify all items return
    await searchInput.clear();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    // Verify all 4 items are visible again
    const allItems = page.locator('[data-testid^="item-card-"]');
    await expect(allItems).toHaveCount(4);
    await expect(page.locator('text=Pho Bo')).toBeVisible();
    await expect(page.locator('text=Spring Rolls')).toBeVisible();
    await expect(page.locator('text=Banh Mi')).toBeVisible();
    await expect(page.locator('text=Tiramisu')).toBeVisible();
  });
});