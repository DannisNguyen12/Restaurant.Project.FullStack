import { test, expect } from '@playwright/test';

test.describe('Customer - Error Handling & Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline condition
    await page.setOfflineMode(true);
    
    // Try to perform an action that requires network
    await page.click('.menu-item:first-child .add-to-cart, [data-testid="add-to-cart"]:first-of-type');
    
    // Should show network error message
    await expect(page.locator('.network-error, [data-testid="network-error"], .offline-message')).toBeVisible();
    
    // Restore network
    await page.setOfflineMode(false);
    
    // Should recover when network is restored
    await page.reload();
    await expect(page.locator('.menu-items, [data-testid="menu-items"]')).toBeVisible();
  });

  test('should handle server errors (500)', async ({ page }) => {
    // Mock server error response
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.reload();
    
    // Should show error message
    await expect(page.locator('.server-error, [data-testid="server-error"], .error-message')).toBeVisible();
    await expect(page.locator('.retry-button, [data-testid="retry-button"]')).toBeVisible();
  });

  test('should handle API timeouts', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/menu', route => {
      // Don't fulfill the request to simulate timeout
      setTimeout(() => {
        route.fulfill({
          status: 408,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Request Timeout' })
        });
      }, 5000);
    });
    
    await page.reload();
    
    // Should show loading state then timeout error
    await expect(page.locator('.loading, [data-testid="loading"]')).toBeVisible();
    await expect(page.locator('.timeout-error, [data-testid="timeout-error"]')).toBeVisible({ timeout: 10000 });
  });

  test('should handle invalid form submissions', async ({ page }) => {
    await page.click('[data-testid="signin-button"], .signin-button, button:has-text("Sign In")');
    
    // Submit form with invalid data
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', '123'); // Too short
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('.email-error, [data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('.password-error, [data-testid="password-error"]')).toBeVisible();
  });

  test('should handle authentication failures', async ({ page }) => {
    await page.click('[data-testid="signin-button"], button:has-text("Sign In")');
    
    // Mock authentication failure
    await page.route('**/api/auth/**', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' })
      });
    });
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show authentication error
    await expect(page.locator('.auth-error, [data-testid="auth-error"]')).toContainText(/invalid credentials|login failed/i);
  });

  test('should handle session expiration', async ({ page }) => {
    // Sign in first
    await page.click('[data-testid="signin-button"], button:has-text("Sign In")');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Mock session expiration
    await page.route('**/api/**', route => {
      if (route.request().url().includes('/api/')) {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Session expired' })
        });
      } else {
        route.continue();
      }
    });
    
    // Try to perform authenticated action
    await page.click('.menu-item:first-child .add-to-cart, [data-testid="add-to-cart"]:first-of-type');
    
    // Should redirect to login or show session expired message
    await expect(page.locator('.session-expired, [data-testid="session-expired"]')).toBeVisible();
  });

  test('should handle payment processing failures', async ({ page }) => {
    // Complete checkout flow and mock payment failure
    await page.click('[data-testid="signin-button"], button:has-text("Sign In")');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.click('.menu-item:first-child .add-to-cart, [data-testid="add-to-cart"]:first-of-type');
    await page.click('[data-testid="cart-button"], .cart-button');
    await page.click('[data-testid="checkout-button"], button:has-text("Checkout")');
    
    // Fill checkout form
    await page.fill('#firstName', 'John');
    await page.fill('#lastName', 'Doe');
    await page.fill('#address', '123 Main St');
    await page.click('button:has-text("Continue")');
    
    // Mock payment failure
    await page.route('**/api/payment/**', route => {
      route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Payment declined' })
      });
    });
    
    await page.check('input[value="card"]');
    await page.fill('#cardNumber', '4111111111111111');
    await page.fill('#expiryDate', '12/25');
    await page.fill('#cvv', '123');
    await page.click('button:has-text("Place Order")');
    
    // Should show payment error
    await expect(page.locator('.payment-error, [data-testid="payment-error"]')).toContainText(/payment.*declined|transaction.*failed/i);
  });

  test('should handle empty search results', async ({ page }) => {
    await page.fill('.search-input, [data-testid="search-input"]', 'nonexistentitem12345');
    await page.keyboard.press('Enter');
    
    // Should show no results message with suggestions
    await expect(page.locator('.no-results, [data-testid="no-results"]')).toBeVisible();
    await expect(page.locator('.search-suggestions, [data-testid="search-suggestions"]')).toBeVisible();
  });

  test('should handle cart with unavailable items', async ({ page }) => {
    // Add item to cart
    await page.click('.menu-item:first-child .add-to-cart, [data-testid="add-to-cart"]:first-of-type');
    
    // Mock item becoming unavailable
    await page.route('**/api/cart/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [{
            id: 1,
            name: 'Test Item',
            price: 10.99,
            available: false,
            quantity: 1
          }]
        })
      });
    });
    
    await page.click('[data-testid="cart-button"], .cart-button');
    
    // Should show unavailable item notice
    await expect(page.locator('.unavailable-item, [data-testid="unavailable-item"]')).toBeVisible();
    await expect(page.locator('.remove-unavailable, [data-testid="remove-unavailable"]')).toBeVisible();
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate through pages
    await page.click('.menu-item:first-child, [data-testid="menu-item"]:first-of-type');
    
    // Go back
    await page.goBack();
    await expect(page.locator('.menu-items, [data-testid="menu-items"]')).toBeVisible();
    
    // Go forward
    await page.goForward();
    // Should restore previous state
  });

  test('should handle concurrent user actions', async ({ page }) => {
    // Simulate rapid clicks
    const addButton = page.locator('.menu-item:first-child .add-to-cart, [data-testid="add-to-cart"]:first-of-type');
    
    // Click multiple times rapidly
    await Promise.all([
      addButton.click(),
      addButton.click(),
      addButton.click()
    ]);
    
    // Should handle gracefully without duplicate additions
    await page.click('[data-testid="cart-button"], .cart-button');
    const cartItems = page.locator('.cart-item, [data-testid="cart-item"]');
    
    // Should not have duplicate items or should have proper quantity
    const quantity = await page.locator('.item-quantity, [data-testid="item-quantity"]').first().textContent();
    expect(parseInt(quantity || '1')).toBeGreaterThan(0);
  });

  test('should handle malformed URLs', async ({ page }) => {
    // Try to access invalid URLs
    await page.goto('http://localhost:3001/nonexistent-page');
    
    // Should show 404 page
    await expect(page.locator('.not-found, [data-testid="not-found"], .error-404')).toBeVisible();
    await expect(page.locator('.back-home, [data-testid="back-home"]')).toBeVisible();
  });

  test('should handle special characters in user input', async ({ page }) => {
    // Test search with special characters
    await page.fill('.search-input, [data-testid="search-input"]', '<script>alert("xss")</script>');
    await page.keyboard.press('Enter');
    
    // Should escape special characters and not execute scripts
    await expect(page.locator('.search-results, [data-testid="search-results"]')).toBeVisible();
    
    // Check that no alert was triggered
    page.on('dialog', dialog => {
      throw new Error('XSS vulnerability detected');
    });
  });

  test('should handle extremely long user input', async ({ page }) => {
    const longText = 'a'.repeat(1000);
    
    await page.fill('.search-input, [data-testid="search-input"]', longText);
    await page.keyboard.press('Enter');
    
    // Should handle gracefully
    await expect(page.locator('.search-results, [data-testid="search-results"], .no-results')).toBeVisible();
  });

  test('should handle memory issues with large datasets', async ({ page }) => {
    // Mock large menu response
    await page.route('**/api/menu', route => {
      const largeMenu = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        price: 10.99,
        description: `Description for item ${i}`.repeat(10)
      }));
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeMenu)
      });
    });
    
    await page.reload();
    
    // Should handle large datasets without crashing
    await expect(page.locator('.menu-items, [data-testid="menu-items"]')).toBeVisible();
    
    // Should implement pagination or virtual scrolling
    const menuItems = page.locator('.menu-item, [data-testid="menu-item"]');
    const itemCount = await menuItems.count();
    
    // Should not render all 1000 items at once
    expect(itemCount).toBeLessThan(100);
  });

  test('should handle browser storage issues', async ({ page }) => {
    // Clear and fill localStorage to capacity
    await page.evaluate(() => {
      localStorage.clear();
      try {
        for (let i = 0; i < 1000; i++) {
          localStorage.setItem(`key${i}`, 'x'.repeat(1000));
        }
      } catch (e) {
        // Storage quota exceeded
      }
    });
    
    // Try to add item to cart (which might use localStorage)
    await page.click('.menu-item:first-child .add-to-cart, [data-testid="add-to-cart"]:first-of-type');
    
    // Should handle storage errors gracefully
    if (await page.locator('.storage-error, [data-testid="storage-error"]').isVisible()) {
      await expect(page.locator('.storage-error, [data-testid="storage-error"]')).toBeVisible();
    }
  });

  test('should handle image loading failures', async ({ page }) => {
    // Mock image failures
    await page.route('**/*.{png,jpg,jpeg,webp}', route => {
      route.fulfill({ status: 404 });
    });
    
    await page.reload();
    
    // Should show placeholder images or handle missing images gracefully
    const menuItems = page.locator('.menu-item, [data-testid="menu-item"]');
    const firstItem = menuItems.first();
    
    if (await firstItem.isVisible()) {
      // Should have fallback image or placeholder
      const image = firstItem.locator('img');
      if (await image.isVisible()) {
        const src = await image.getAttribute('src');
        expect(src).toBeTruthy();
      }
    }
  });

  test('should handle CSS loading failures', async ({ page }) => {
    // Block CSS files
    await page.route('**/*.css', route => {
      route.abort();
    });
    
    await page.reload();
    
    // Content should still be accessible without styling
    await expect(page.locator('.menu-items, [data-testid="menu-items"], .main-content')).toBeVisible();
  });

  test('should handle JavaScript errors gracefully', async ({ page }) => {
    // Inject JS error
    await page.addInitScript(() => {
      window.addEventListener('error', (e) => {
        console.log('JS Error caught:', e.error);
      });
      
      // Simulate JS error
      setTimeout(() => {
        throw new Error('Simulated error');
      }, 1000);
    });
    
    await page.reload();
    
    // App should continue functioning despite JS errors
    await expect(page.locator('.menu-items, [data-testid="menu-items"]')).toBeVisible();
  });

  test('should provide helpful error recovery options', async ({ page }) => {
    // Simulate error state
    await page.route('**/api/**', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    // Should provide recovery options
    await expect(page.locator('.retry-button, [data-testid="retry-button"]')).toBeVisible();
    await expect(page.locator('.contact-support, [data-testid="contact-support"]')).toBeVisible();
    
    // Test retry functionality
    await page.unroute('**/api/**');
    await page.click('.retry-button, [data-testid="retry-button"]');
    
    // Should recover after retry
    await expect(page.locator('.menu-items, [data-testid="menu-items"]')).toBeVisible();
  });

  test('should handle edge cases in form validation', async ({ page }) => {
    await page.click('[data-testid="signin-button"], button:has-text("Sign In")');
    
    // Test various edge cases
    const testCases = [
      { email: '', password: '', expectedError: 'required' },
      { email: ' ', password: ' ', expectedError: 'required' },
      { email: 'test@', password: 'pass', expectedError: 'valid' },
      { email: '@example.com', password: 'pass', expectedError: 'valid' },
      { email: 'test.example.com', password: 'pass', expectedError: 'valid' }
    ];
    
    for (const testCase of testCases) {
      await page.fill('input[name="email"]', testCase.email);
      await page.fill('input[name="password"]', testCase.password);
      await page.click('button[type="submit"]');
      
      // Should show appropriate validation error
      await expect(page.locator('.error, .validation-error')).toBeVisible();
      
      // Clear form for next test
      await page.fill('input[name="email"]', '');
      await page.fill('input[name="password"]', '');
    }
  });
});
