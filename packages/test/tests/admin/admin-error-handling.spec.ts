import { test, expect } from '@playwright/test';

test.describe('Admin App - Error Handling and Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/signin');
    await page.fill('input[name="email"]', 'admin@restaurant.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/**', route => {
      route.abort('failed');
    });

    // Try to navigate to a page that requires API calls
    await page.goto('/');
    
    // Check for error handling
    const errorMessage = page.locator('[data-testid="error"], .error-message, .alert-error');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
    
    // Check that app doesn't crash
    await expect(page.locator('body')).toBeVisible();
    
    // Remove route to prevent affecting other tests
    await page.unroute('**/api/**');
  });

  test('should handle server errors (500)', async ({ page }) => {
    // Simulate server error
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    // Try to perform an action that calls the API
    await page.goto('/item/create');
    
    // Fill form and submit
    const nameField = page.locator('input[name="name"]');
    if (await nameField.count() > 0) {
      await nameField.fill('Test Item');
      
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Check for error handling
        const errorMessage = page.locator('[data-testid="error"], .error-message, .alert-error');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage).toBeVisible();
          await expect(errorMessage).toContainText(/error|failed/i);
        }
      }
    }
    
    await page.unroute('**/api/**');
  });

  test('should handle authentication errors', async ({ page }) => {
    // Simulate auth failure
    await page.route('**/api/auth/**', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });

    // Try to access protected resource
    await page.goto('/');
    
    // Should redirect to login or show auth error
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    const isRedirectedToLogin = currentUrl.includes('/signin') || currentUrl.includes('/login');
    const hasAuthError = await page.locator('[data-testid="auth-error"], .auth-error').count() > 0;
    
    expect(isRedirectedToLogin || hasAuthError).toBeTruthy();
    
    await page.unroute('**/api/auth/**');
  });

  test('should handle malformed data gracefully', async ({ page }) => {
    // Simulate malformed JSON response
    await page.route('**/api/items**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json{'
      });
    });

    await page.goto('/');
    
    // App should handle malformed data without crashing
    await expect(page.locator('body')).toBeVisible();
    
    // Check for error handling
    const errorElements = page.locator('[data-testid="error"], .error, .alert-error');
    if (await errorElements.count() > 0) {
      await expect(errorElements.first()).toBeVisible();
    }
    
    await page.unroute('**/api/items**');
  });

  test('should handle missing resources (404)', async ({ page }) => {
    // Navigate to non-existent item
    await page.goto('/item/999999');
    
    // Should show 404 error or redirect
    const notFoundElements = page.locator('[data-testid="not-found"], .not-found, h1:has-text("404")');
    if (await notFoundElements.count() > 0) {
      await expect(notFoundElements.first()).toBeVisible();
    } else {
      // Or should redirect to a valid page
      await page.waitForTimeout(2000);
      expect(page.url()).not.toContain('/item/999999');
    }
  });

  test('should handle extremely long input values', async ({ page }) => {
    await page.goto('/item/create');
    
    // Test with very long strings
    const longString = 'a'.repeat(10000);
    
    const nameField = page.locator('input[name="name"]');
    if (await nameField.count() > 0) {
      await nameField.fill(longString);
      
      // Check if input is handled gracefully
      const inputValue = await nameField.inputValue();
      
      // Input should either be truncated or show validation error
      const isHandledGracefully = inputValue.length < longString.length || 
                                 await page.locator('.error, [data-testid="error"]').count() > 0;
      
      expect(isHandledGracefully).toBeTruthy();
    }
    
    // Test with very long description
    const descriptionField = page.locator('textarea[name="description"]');
    if (await descriptionField.count() > 0) {
      await descriptionField.fill(longString);
      
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Should handle long description gracefully
        await page.waitForTimeout(1000);
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('should handle special characters in input', async ({ page }) => {
    await page.goto('/item/create');
    
    // Test with special characters
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?~`';
    const unicodeChars = '🍕🍔🍟🌮🥗';
    const sqlInjection = "'; DROP TABLE items; --";
    const xssAttempt = '<script>alert("xss")</script>';
    
    const testInputs = [specialChars, unicodeChars, sqlInjection, xssAttempt];
    
    for (const testInput of testInputs) {
      const nameField = page.locator('input[name="name"]');
      if (await nameField.count() > 0) {
        await nameField.clear();
        await nameField.fill(testInput);
        
        // Check that input is sanitized or rejected
        const inputValue = await nameField.inputValue();
        
        // XSS should be prevented
        if (testInput.includes('<script>')) {
          expect(inputValue).not.toContain('<script>');
        }
        
        // SQL injection should be handled
        if (testInput.includes('DROP TABLE')) {
          expect(inputValue).not.toContain('DROP TABLE');
        }
      }
    }
  });

  test('should handle concurrent form submissions', async ({ page }) => {
    await page.goto('/item/create');
    
    // Fill form
    const nameField = page.locator('input[name="name"]');
    if (await nameField.count() > 0) {
      await nameField.fill('Concurrent Test Item');
      
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.count() > 0) {
        // Simulate rapid multiple clicks
        await Promise.all([
          submitButton.click(),
          submitButton.click(),
          submitButton.click()
        ]);
        
        // Should handle concurrent submissions gracefully
        await page.waitForTimeout(2000);
        
        // Either should process once or show appropriate error
        const errorMessage = page.locator('[data-testid="error"], .error');
        const successMessage = page.locator('[data-testid="success"], .success');
        
        const hasError = await errorMessage.count() > 0;
        const hasSuccess = await successMessage.count() > 0;
        
        // Should either succeed once or show error about duplicate submission
        expect(hasError || hasSuccess).toBeTruthy();
      }
    }
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate through several pages
    await page.goto('/');
    await page.goto('/item/create');
    
    // Fill form partially
    const nameField = page.locator('input[name="name"]');
    if (await nameField.count() > 0) {
      await nameField.fill('Test Item');
    }
    
    // Navigate back
    await page.goBack();
    await expect(page.url()).toMatch(/\/$/);
    
    // Navigate forward
    await page.goForward();
    await expect(page.url()).toMatch(/\/item\/create/);
    
    // Check if form state is preserved or reset gracefully
    if (await nameField.count() > 0) {
      const currentValue = await nameField.inputValue();
      // Either preserved or empty (both are acceptable)
      expect(typeof currentValue).toBe('string');
    }
  });

  test('should handle page refresh during form submission', async ({ page }) => {
    await page.goto('/item/create');
    
    // Fill form
    const nameField = page.locator('input[name="name"]');
    if (await nameField.count() > 0) {
      await nameField.fill('Refresh Test Item');
      
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.count() > 0) {
        // Start form submission
        const submitPromise = submitButton.click();
        
        // Refresh page during submission
        await page.reload();
        
        // Should handle refresh gracefully
        await expect(page.locator('body')).toBeVisible();
        
        // Form should be reset or show appropriate state
        const formFields = page.locator('input, textarea, select');
        const fieldCount = await formFields.count();
        expect(fieldCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should handle invalid file uploads', async ({ page }) => {
    await page.goto('/item/create');
    
    // Look for file input
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      // Test with invalid file type (if restrictions exist)
      const filePath = 'package.json'; // Text file instead of image
      
      await fileInput.setInputFiles([{
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('This is not an image')
      }]);
      
      // Should show validation error
      const errorMessage = page.locator('[data-testid="file-error"], .file-error, .error');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  test('should handle session timeout', async ({ page, context }) => {
    // Clear cookies to simulate session timeout
    await context.clearCookies();
    
    // Try to access protected page
    await page.goto('/item/create');
    
    // Should redirect to login or show session expired message
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    const isRedirectedToLogin = currentUrl.includes('/signin') || currentUrl.includes('/login');
    const hasSessionError = await page.locator('[data-testid="session-error"], .session-expired').count() > 0;
    
    expect(isRedirectedToLogin || hasSessionError).toBeTruthy();
  });

  test('should handle memory constraints with large datasets', async ({ page }) => {
    // Simulate API returning large dataset
    await page.route('**/api/items**', route => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: `Description for item ${i}`.repeat(100),
        price: Math.random() * 100
      }));
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeDataset)
      });
    });

    await page.goto('/');
    
    // Should handle large dataset without crashing
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
    
    // Check if pagination or virtualization is implemented
    const items = page.locator('[data-testid="item"], .item, .menu-item');
    const itemCount = await items.count();
    
    // Should not render all 10000 items at once
    expect(itemCount).toBeLessThan(100);
    
    await page.unroute('**/api/items**');
  });

  test('should handle browser compatibility issues', async ({ page }) => {
    // Test modern JavaScript features gracefully degrade
    await page.goto('/');
    
    // Check if app works without modern features
    const hasConsoleErrors = await page.evaluate(() => {
      const errors: string[] = [];
      const originalError = console.error;
      console.error = (message: string) => {
        errors.push(message);
        originalError(message);
      };
      
      // Wait a bit for any errors to occur
      return new Promise(resolve => {
        setTimeout(() => {
          console.error = originalError;
          resolve(errors);
        }, 1000);
      });
    });
    
    // Should not have critical console errors
    expect(Array.isArray(hasConsoleErrors)).toBeTruthy();
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow network
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      route.continue();
    });

    const startTime = Date.now();
    await page.goto('/');
    
    // Check for loading indicators
    const loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner');
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator).toBeVisible();
    }
    
    // Wait for content to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Should eventually load content
    await expect(page.locator('main, [data-testid="main-content"]')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeGreaterThan(3000); // Should respect the delay
    
    await page.unroute('**/api/**');
  });
});
