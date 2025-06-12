import { test, expect } from '@playwright/test';

test.describe('Customer Payment Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start with a clean state
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Clear any existing localStorage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Payment Processing', () => {
    test.beforeEach(async ({ page }) => {
      // Set up cart with test items
      await page.evaluate(() => {
        const cartItems = [
          {
            id: 1,
            name: 'Test Pizza',
            price: 15.99,
            quantity: 2,
            image: '/test-image.jpg'
          },
          {
            id: 2,
            name: 'Test Burger',
            price: 12.50,
            quantity: 1,
            image: '/test-burger.jpg'
          }
        ];
        localStorage.setItem('cart-items', JSON.stringify(cartItems));
      });

      // Navigate to payment page
      await page.goto('/payment');
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Authentication Required', () => {
    test('should redirect to signin when not authenticated', async ({ page }) => {
      // Set up cart but don't authenticate
      await page.evaluate(() => {
        const cartItems = [
          {
            id: 1,
            name: 'Test Pizza',
            price: 15.99,
            quantity: 1,
            image: '/test-image.jpg'
          }
        ];
        localStorage.setItem('cart-items', JSON.stringify(cartItems));
      });

      // Try to access payment page
      await page.goto('/payment');
      
      // Should redirect to signin with callback URL
      await expect(page).toHaveURL(/.*\/signin.*callbackUrl.*payment/);
    });
  });
});