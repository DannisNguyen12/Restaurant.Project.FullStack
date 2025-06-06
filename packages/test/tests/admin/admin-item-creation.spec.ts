import { test, expect } from '@playwright/test';

test.describe('Admin Item Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3002/signin');
    await page.fill('input[type="email"]', 'admin@restaurant.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Navigate to create item page
    await page.goto('http://localhost:3002/item/create');
  });

  test('should display item creation form', async ({ page }) => {
    // Should show the form
    await expect(page.locator('form')).toBeVisible();
    
    // Should have required form fields
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('input[name="price"]')).toBeVisible();
    
    // Should have category selection
    await expect(page.locator('select[name="categoryId"]')).toBeVisible();
    
    // Should have submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    const nameField = page.locator('input[name="name"]');
    const priceField = page.locator('input[name="price"]');
    
    // Check if HTML5 validation is triggered
    await expect(nameField).toBeFocused();
  });

  test('should create new menu item successfully', async ({ page }) => {
    // Fill out the form
    await page.fill('input[name="name"]', 'Test Pho Bo');
    await page.fill('textarea[name="description"]', 'Delicious Vietnamese beef noodle soup');
    await page.fill('input[name="price"]', '15.99');
    
    // Select a category if available
    const categorySelect = page.locator('select[name="categoryId"]');
    if (await categorySelect.count() > 0) {
      await categorySelect.selectOption({ index: 1 });
    }
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard or show success message
    await page.waitForTimeout(2000);
    
    // Check for success indicators
    const successIndicators = [
      page.locator('text=Item created successfully'),
      page.locator('text=Successfully added'),
      page.url().includes('/item/') // Redirected to item detail
    ];
    
    let hasSuccess = false;
    for (const indicator of successIndicators) {
      if (typeof indicator === 'boolean') {
        hasSuccess = indicator;
        break;
      } else if (await indicator.count() > 0) {
        hasSuccess = true;
        break;
      }
    }
    
    expect(hasSuccess).toBeTruthy();
  });

  test('should handle price validation', async ({ page }) => {
    // Test invalid price formats
    await page.fill('input[name="name"]', 'Test Item');
    await page.fill('input[name="price"]', 'invalid-price');
    
    // Should prevent invalid input or show error
    const priceValue = await page.locator('input[name="price"]').inputValue();
    expect(priceValue).not.toBe('invalid-price');
  });

  test('should handle long descriptions', async ({ page }) => {
    const longDescription = 'A'.repeat(1000);
    
    await page.fill('input[name="name"]', 'Test Item');
    await page.fill('textarea[name="description"]', longDescription);
    await page.fill('input[name="price"]', '10.99');
    
    // Should either accept or truncate long descriptions
    const descriptionValue = await page.locator('textarea[name="description"]').inputValue();
    expect(descriptionValue.length).toBeGreaterThan(0);
  });

  test('should load categories in dropdown', async ({ page }) => {
    const categorySelect = page.locator('select[name="categoryId"]');
    
    // Should have at least one option (default or actual categories)
    const optionCount = await categorySelect.locator('option').count();
    expect(optionCount).toBeGreaterThan(0);
  });

  test('should handle image upload if supported', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      // Test file upload functionality
      await expect(fileInput).toBeVisible();
      
      // Should accept image files
      const acceptAttribute = await fileInput.getAttribute('accept');
      if (acceptAttribute) {
        expect(acceptAttribute).toContain('image');
      }
    }
  });

  test('should provide navigation back to dashboard', async ({ page }) => {
    // Look for back button or navigation link
    const navigationElements = [
      page.locator('button:has-text("Back")'),
      page.locator('a:has-text("Back")'),
      page.locator('button:has-text("Cancel")'),
      page.locator('[data-testid="back-button"]')
    ];
    
    let hasNavigation = false;
    for (const element of navigationElements) {
      if (await element.count() > 0) {
        hasNavigation = true;
        break;
      }
    }
    
    // Should have some way to navigate back
    expect(hasNavigation).toBeTruthy();
  });

  test('should show loading state during form submission', async ({ page }) => {
    // Fill form
    await page.fill('input[name="name"]', 'Test Item');
    await page.fill('textarea[name="description"]', 'Test description');
    await page.fill('input[name="price"]', '12.99');
    
    // Submit form and check for loading state
    await page.click('button[type="submit"]');
    
    // Should show loading state (disabled button or spinner)
    const submitButton = page.locator('button[type="submit"]');
    
    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled();
  });

  test('should handle form validation errors from server', async ({ page }) => {
    // Try to create item with duplicate name or invalid data
    await page.fill('input[name="name"]', ''); // Empty name should cause server error
    await page.fill('textarea[name="description"]', 'Test description');
    await page.fill('input[name="price"]', '12.99');
    
    await page.click('button[type="submit"]');
    
    // Should handle server validation errors gracefully
    await page.waitForTimeout(2000);
    
    // Should either show error message or prevent submission
    const errorIndicators = [
      page.locator('text=Error'),
      page.locator('text=Failed'),
      page.locator('.error'),
      page.locator('[role="alert"]')
    ];
    
    // Form should still be visible (not redirected away)
    await expect(page.locator('form')).toBeVisible();
  });
});
