import { test, expect } from '@playwright/test';

test.describe('Customer Homepage', () => {
    test('should load menu items from the database', async ({ page }) => {
        // Go to the customer homepage
        await page.goto('/');

        // Wait for items to load
        await page.waitForSelector('div[data-testid="menu-item"]', { timeout: 10000 });

        // Check if at least one menu item is present
        const menuItemCount = await page.locator('div[data-testid="menu-item"]').count();
        expect(menuItemCount).toBeGreaterThan(0);
        
        // Check if the search box is present - using the correct placeholder text
        const searchBox = await page.getByPlaceholder('Search by title, description, or recommendation...');
        expect(searchBox).toBeVisible();
    });

    test('adding items to cart should work', async ({ page }) => {
        // Go to the homepage
        await page.goto('/');

        // Wait for items to load
        await page.waitForSelector('div[data-testid="menu-item"]');

        // Get the name of the first item for later verification
        const firstItemName = await page.locator('div[data-testid="menu-item"]').first().locator('h2').textContent();
        
        // Click the "Add to Cart" button on the first item
        await page.getByTestId('add-to-cart-button').first().click();

        // Verify that the cart updates (cart count shows 1 item)
        const cartCount = await page.getByTestId('cart-count');
        await expect(cartCount).toHaveText('1');

        // Verify the cart modal is visible
        const cartModal = page.getByTestId('cart-modal');
        await expect(cartModal).toBeVisible();
        
        // Verify item is in the cart
        const cartItems = await page.locator('div[data-testid="cart-item"], li[data-testid="cart-item"]').count();
        expect(cartItems).toBe(1);
        
        // Verify the item in the cart is the one we added
        if (firstItemName) {
            const cartItemText = await page.locator('div[data-testid="cart-item"], li[data-testid="cart-item"]').textContent();
            expect(cartItemText).toContain(firstItemName);
        }
    });
});
