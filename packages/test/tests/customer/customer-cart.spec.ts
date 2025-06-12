import { test, expect } from '@playwright/test';

test.describe('Customer Cart Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to customer homepage
    await page.goto('/');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for items to load
    await page.waitForSelector('[data-testid^="item-card-"]', { timeout: 15000 });
    
    // Clear any existing cart data from localStorage
    await page.evaluate(() => {
      localStorage.removeItem('restaurant-cart');
    });
    
    // Refresh to ensure clean cart state
    await page.reload();
    await page.waitForSelector('[data-testid^="item-card-"]', { timeout: 15000 });
  });

  test.describe('Add to Cart Functionality', () => {

    test('should add multiple different items to cart', async ({ page }) => {
      // Add first item
      const firstAddButton = page.locator('[data-testid^="add-to-cart-button-"]').first();
      await firstAddButton.click();
      await page.waitForTimeout(500); // Wait for cart update
      
      // Add second item  
      const secondAddButton = page.locator('[data-testid^="add-to-cart-button-"]').nth(1);
      await secondAddButton.click();
      await page.waitForTimeout(500); // Wait for cart update
      
      // Add third item
      const thirdAddButton = page.locator('[data-testid^="add-to-cart-button-"]').nth(2);
      await thirdAddButton.click();
      await page.waitForTimeout(500); // Wait for cart update
      
      // Verify cart count shows 3 items
      await expect(page.locator('[data-testid="cart-item-count"]').or(page.locator('.bg-indigo-600.text-white.text-xs.font-bold'))).toContainText('3');
    });

    test('should increase quantity when adding same item multiple times', async ({ page }) => {
      const firstAddButton = page.locator('[data-testid^="add-to-cart-button-"]').first();
      
      // Add same item twice
      await firstAddButton.click();
      await page.waitForTimeout(500);
      await firstAddButton.click();
      await page.waitForTimeout(500);
      
      // Should show quantity 2 for the item in cart
      await expect(page.locator('text=2').first()).toBeVisible();
      
      // Cart count should show 2
      await expect(page.locator('[data-testid="cart-item-count"]').or(page.locator('.bg-indigo-600.text-white.text-xs.font-bold'))).toContainText('2');
    });
  });

  test.describe('Cart Quantity Controls', () => {
    
    test.beforeEach(async ({ page }) => {
      // Add an item to cart for quantity tests
      const firstAddButton = page.locator('[data-testid^="add-to-cart-button-"]').first();
      await firstAddButton.click();
      await page.waitForTimeout(1000); // Wait for cart to update
    });

    test('should increase item quantity using + button', async ({ page }) => {
      // Find the + button in cart
      const increaseButton = page.locator('button:has-text("+")').first();
      await expect(increaseButton).toBeVisible();
      
      // Click + button
      await increaseButton.click();
      await page.waitForTimeout(500);
      
      // Verify quantity increased to 2
      await expect(page.locator('text=2').first()).toBeVisible();
      
      // Verify cart count updated
      await expect(page.locator('[data-testid="cart-item-count"]').or(page.locator('.bg-indigo-600.text-white.text-xs.font-bold'))).toContainText('2');
      
      // Click + again
      await increaseButton.click();
      await page.waitForTimeout(500);
      
      // Verify quantity increased to 3
      await expect(page.locator('text=3').first()).toBeVisible();
      await expect(page.locator('[data-testid="cart-item-count"]').or(page.locator('.bg-indigo-600.text-white.text-xs.font-bold'))).toContainText('3');
    });

    test('should decrease item quantity using - button', async ({ page }) => {
      // First increase quantity to 3
      const increaseButton = page.locator('button:has-text("+")').first();
      await increaseButton.click();
      await page.waitForTimeout(500);
      await increaseButton.click();
      await page.waitForTimeout(500);
      
      // Now test decrease
      const decreaseButton = page.locator('button:has-text("−")').first();
      await expect(decreaseButton).toBeVisible();
      
      // Click - button
      await decreaseButton.click();
      await page.waitForTimeout(500);
      
      // Verify quantity decreased to 2
      await expect(page.locator('text=2').first()).toBeVisible();
      await expect(page.locator('[data-testid="cart-item-count"]').or(page.locator('.bg-indigo-600.text-white.text-xs.font-bold'))).toContainText('2');
      
      // Click - again
      await decreaseButton.click();
      await page.waitForTimeout(500);
      
      // Verify quantity decreased to 1
      await expect(page.locator('text=1').first()).toBeVisible();
      await expect(page.locator('[data-testid="cart-item-count"]').or(page.locator('.bg-indigo-600.text-white.text-xs.font-bold'))).toContainText('1');
    });

    test('should prevent decreasing quantity below 1', async ({ page }) => {
      const decreaseButton = page.locator('button:has-text("−")').first();
      
      // Button should be disabled when quantity is 1
      await expect(decreaseButton).toBeDisabled();
    });
  });

  test.describe('Remove Items from Cart', () => {
    
    test.beforeEach(async ({ page }) => {
      // Add multiple items to cart
      const firstAddButton = page.locator('[data-testid^="add-to-cart-button-"]').first();
      const secondAddButton = page.locator('[data-testid^="add-to-cart-button-"]').nth(1);
      
      await firstAddButton.click();
      await page.waitForTimeout(500);
      await secondAddButton.click();
      await page.waitForTimeout(1000);
    });

    test('should remove individual item using trash/delete button', async ({ page }) => {
      // Find remove/delete button (trash icon)
      const removeButton = page.locator('button[aria-label="Remove item"]').first();
      await expect(removeButton).toBeVisible();
      
      // Click remove button
      await removeButton.click();
      await page.waitForTimeout(500);
      
      // Verify cart count decreased from 2 to 1
      await expect(page.locator('[data-testid="cart-item-count"]').or(page.locator('.bg-indigo-600.text-white.text-xs.font-bold'))).toContainText('1');
      
      // Verify success toast
      await expect(page.locator('text=Item removed from cart')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Clear Cart Functionality', () => {
    
    test.beforeEach(async ({ page }) => {
      // Add multiple items to cart
      const addButtons = page.locator('[data-testid^="add-to-cart-button-"]');
      
      // Add first 3 items
      for (let i = 0; i < 3; i++) {
        await addButtons.nth(i).click();
        await page.waitForTimeout(500);
      }
      
      // Verify cart has items
      await expect(page.locator('[data-testid="cart-item-count"]').or(page.locator('.bg-indigo-600.text-white.text-xs.font-bold'))).toContainText('3');
    });

    test('should clear all items from cart using Clear Cart button', async ({ page }) => {
      // Find and click Clear Cart button
      const clearCartButton = page.locator('button:has-text("Clear Cart")');
      await expect(clearCartButton).toBeVisible();
      await clearCartButton.click();
      
      // Wait for cart to clear
      await page.waitForTimeout(1000);
      
      // Verify cart is empty
      await expect(page.locator('text=Your cart is empty')).toBeVisible();
      
      // Verify cart count badge disappears
      const cartBadge = page.locator('[data-testid="cart-item-count"]').or(page.locator('.bg-indigo-600.text-white.text-xs.font-bold'));
      await expect(cartBadge).not.toBeVisible();
      
      // Verify success toast
      await expect(page.locator('text=Cart cleared')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Cart Persistence', () => {
    
    test('should maintain cart contents after page refresh', async ({ page }) => {
      // Add items to cart
      const firstAddButton = page.locator('[data-testid^="add-to-cart-button-"]').first();
      const secondAddButton = page.locator('[data-testid^="add-to-cart-button-"]').nth(1);
      
      await firstAddButton.click();
      await page.waitForTimeout(500);
      await secondAddButton.click();
      await page.waitForTimeout(1000);
      
      // Get item names before refresh
      const itemNames = await page.locator('.cart-summary h3, [class*="cart"] h3, [class*="cart"] p.font-medium').allTextContents();
      
      // Verify cart has 2 items
      await expect(page.locator('[data-testid="cart-item-count"]').or(page.locator('.bg-indigo-600.text-white.text-xs.font-bold'))).toContainText('2');
      
      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('[data-testid^="item-card-"]', { timeout: 15000 });
      
      // Wait for cart to load from localStorage
      await page.waitForTimeout(2000);
      
      // Verify cart still contains items after refresh
      await expect(page.locator('[data-testid="cart-item-count"]').or(page.locator('.bg-indigo-600.text-white.text-xs.font-bold'))).toContainText('2');
      
      // Verify cart is not empty
      await expect(page.locator('text=Your cart is empty')).not.toBeVisible();
      
      // Verify items are still in cart (check for at least one item name)
      if (itemNames.length > 0) {
        const firstItemName = itemNames[0]?.trim();
        if (firstItemName) {
          await expect(page.locator(`text=${firstItemName}`).first()).toBeVisible();
        }
      }
    });

    test('should maintain cart quantities after page refresh', async ({ page }) => {
      // Add item and increase quantity
      const firstAddButton = page.locator('[data-testid^="add-to-cart-button-"]').first();
      await firstAddButton.click();
      await page.waitForTimeout(500);
      
      // Increase quantity using + button
      const increaseButton = page.locator('button:has-text("+")').first();
      await increaseButton.click();
      await page.waitForTimeout(500);
      await increaseButton.click();
      await page.waitForTimeout(500);
      
      // Verify quantity is 3
      await expect(page.locator('text=3').first()).toBeVisible();
      await expect(page.locator('[data-testid="cart-item-count"]').or(page.locator('.bg-indigo-600.text-white.text-xs.font-bold'))).toContainText('3');
      
      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('[data-testid^="item-card-"]', { timeout: 15000 });
      
      // Wait for cart to load
      await page.waitForTimeout(2000);
      
      // Verify quantity is still 3 after refresh
      await expect(page.locator('text=3').first()).toBeVisible();
      await expect(page.locator('[data-testid="cart-item-count"]').or(page.locator('.bg-indigo-600.text-white.text-xs.font-bold'))).toContainText('3');
    });

    test('should persist empty cart state after clearing and refreshing', async ({ page }) => {
      // Add items to cart
      const firstAddButton = page.locator('[data-testid^="add-to-cart-button-"]').first();
      await firstAddButton.click();
      await page.waitForTimeout(500);
      
      // Clear cart
      const clearCartButton = page.locator('button:has-text("Clear Cart")');
      await clearCartButton.click();
      await page.waitForTimeout(1000);
      
      // Verify cart is empty
      await expect(page.locator('text=Your cart is empty')).toBeVisible();
      
      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('[data-testid^="item-card-"]', { timeout: 15000 });
      
      // Wait for cart to load
      await page.waitForTimeout(2000);
      
      // Verify cart is still empty after refresh
      await expect(page.locator('text=Your cart is empty')).toBeVisible();
      
      // Verify no cart count badge
      const cartBadge = page.locator('[data-testid="cart-item-count"]').or(page.locator('.bg-indigo-600.text-white.text-xs.font-bold'));
      await expect(cartBadge).not.toBeVisible();
    });
  });
});