import { test, expect } from '../helpers';

test.describe('Customer Order Flow', () => {
  test('complete order flow from browsing to checkout', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    
    // Wait for menu items to load
    await page.waitForSelector('[data-testid="menu-item"]');
    
    // Add first item to cart
    await page.getByTestId('add-to-cart-button').first().click();
    
    // Verify cart updated
    await expect(page.getByTestId('cart-count')).toHaveText('1');
    
    // Add a second item
    await page.getByTestId('add-to-cart-button').nth(1).click();
    
    // Verify cart updated
    await expect(page.getByTestId('cart-count')).toHaveText('2');
    
    // Go to checkout
    await page.getByRole('button', { name: /checkout|proceed to payment/i }).click();
    
    // Fill out customer information
    await page.getByLabel('Name').fill('Test Customer');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Phone').fill('1234567890');
    
    // Select delivery option if available
    const deliveryOption = await page.$('input[name="deliveryOption"][value="pickup"]');
    if (deliveryOption) {
      await deliveryOption.click();
    }
    
    // Proceed to payment
    await page.getByRole('button', { name: /continue to payment/i }).click();
    
    // Mock payment completion
    await page.getByLabel('Card Number').fill('4242424242424242');
    await page.getByLabel('Expiry').fill('12/25');
    await page.getByLabel('CVC').fill('123');
    
    // Complete order
    await page.getByRole('button', { name: /complete order|pay now/i }).click();
    
    // Verify success page
    await expect(page.getByText(/order confirmed|thank you for your order/i)).toBeVisible();
  });
  
  test('should filter items by category', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    
    // Wait for menu items to load
    await page.waitForSelector('[data-testid="menu-item"]');
    
    // Get initial count of items
    const initialItemCount = await page.getByTestId('menu-item').count();
    
    // Click on a category (e.g., "Appetizer")
    await page.getByRole('link', { name: 'Appetizer' }).click();
    
    // Wait for filtered items to load
    await page.waitForTimeout(500); // Small delay for UI update
    
    // Get filtered count
    const filteredItemCount = await page.getByTestId('menu-item').count();
    
    // Filtered count should be different from initial count
    expect(filteredItemCount).not.toEqual(initialItemCount);
    
    // Verify that the filtered items belong to the selected category
    // This would need specific data-attributes on the items to verify the category
  });
});
