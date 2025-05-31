import { test, expect } from '@playwright/test';

test.describe('Customer Homepage', () => {
  test('should load menu items from the database', async ({ page }) => {
    // Go to the customer homepage
    await page.goto('/');
    
    // Wait for items to load (this verifies that data fetching works)
    await page.waitForSelector('div[data-testid="menu-item"]', { timeout: 10000 });
    
    // Check if at least one menu item is present
    const menuItems = await page.$$('div[data-testid="menu-item"]');
    expect(menuItems.length).toBeGreaterThan(0);
    
    // Check if item details are visible
    const firstItemTitle = await menuItems[0].$('h3, h4');
    expect(await firstItemTitle?.innerText()).toBeTruthy();
    
    // Check if the search box is present
    const searchBox = await page.getByPlaceholder('Search...');
    expect(searchBox).toBeVisible();
  });

  test('adding items to cart should work', async ({ page }) => {
    // Go to the homepage
    await page.goto('/');
    
    // Wait for items to load
    await page.waitForSelector('div[data-testid="menu-item"]');
    
    // Click the "Add to Cart" button on the first item
    await page.getByRole('button', { name: /add to cart/i }).first().click();
    
    // Verify that the cart updates (cart icon shows 1 item)
    const cartCount = await page.getByTestId('cart-count');
    await expect(cartCount).toHaveText('1');
    
    // Open the cart
    await page.getByTestId('cart-icon').click();
    
    // Verify item is in the cart
    const cartItems = await page.$$('div[data-testid="cart-item"]');
    expect(cartItems.length).toBe(1);
  });
});
