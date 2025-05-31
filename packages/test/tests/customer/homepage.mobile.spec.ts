import { test, expect } from '@playwright/test';

test.describe('Mobile Customer Experience', () => {
  test('should show responsive layout on mobile', async ({ page }) => {
    // Go to the customer homepage
    await page.goto('/');
    
    // Wait for the initial loading to complete by targeting the specific loading div
    await expect(page.locator('div.flex.justify-center.items-center.h-full.text-gray-500:has-text("Loading...")')).toBeHidden({ timeout: 15000 });

    // Wait for items to load, or for an error message if loading failed
    await page.waitForSelector('div[data-testid="menu-item"], text=/Failed to fetch items/i, text=/No items found/i', { timeout: 10000 });

    // Check if there was an error fetching items
    const errorMessage = await page.locator('text=/Failed to fetch items/i, text=/No items found/i').count();
    if (errorMessage > 0) {
      console.error("Error message found on page:", await page.locator('text=/Failed to fetch items/i, text=/No items found/i').textContent());
      // Optionally, fail the test explicitly or add more detailed logging
      // await page.pause(); // Pause for inspection if an error is found
    }
    
    // Check if the mobile menu button is visible (usually a hamburger icon)
    const mobileMenuButton = await page.getByRole('button', { name: /menu/i });
    expect(mobileMenuButton).toBeVisible();
    
    // Mobile view should hide the left category menu by default
    const leftMenu = await page.$('div.md\\:block');
    expect(await leftMenu?.isHidden()).toBeTruthy();
    
    // Search should still be visible on mobile
    const searchBox = await page.getByPlaceholder('Search...');
    expect(searchBox).toBeVisible();
  });

  test('should allow adding items to cart on mobile', async ({ page }) => {
    // Go to the homepage
    await page.goto('/');
    
    // Wait for items to load
    await page.waitForSelector('div[data-testid="menu-item"]');
    
    // Click the "Add to Cart" button on the first item
    await page.getByRole('button', { name: /add to cart/i }).first().click();
    
    // Open the cart
    await page.getByTestId('cart-icon').click();
    
    // Verify the cart modal opens and contains the item
    const cartModal = await page.getByTestId('cart-modal');
    expect(cartModal).toBeVisible();
    
    // Verify item is in the cart
    const cartItems = await page.$$('div[data-testid="cart-item"]');
    expect(cartItems.length).toBe(1);
  });
});
