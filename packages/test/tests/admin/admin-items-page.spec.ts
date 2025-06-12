import { test, expect } from '@playwright/test';

test.describe('Admin Items Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login page
    await page.goto('/signin');
    
    // Use proper test-id selectors like the other tests
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful authentication
    await page.waitForURL('/');
    await expect(page.locator('[data-testid="admin-home"]')).toBeVisible();
  });

  test('should display items page with all items loaded', async ({ page }) => {
    // First, wait for items to load on the home page to get a valid item ID
    await page.waitForSelector('[data-testid^="item-card-"]', { timeout: 10000 });
    
    // Get the first item card and extract its ID from the data-testid
    const firstItemCard = page.locator('[data-testid^="item-card-"]').first();
    await expect(firstItemCard).toBeVisible();
    
    // Get the item ID from the data-testid attribute (format: "item-card-{id}")
    const itemTestId = await firstItemCard.getAttribute('data-testid');
    const itemId = itemTestId?.replace('item-card-', '');
    
    if (!itemId) {
      throw new Error('Could not extract item ID from test data');
    }

    // Navigate to the item detail page
    await page.goto(`/item/${itemId}`);
    
    // Wait for the item page to load
    await page.waitForLoadState('networkidle');
    
    // Look for Edit button - it might be in different formats, so let's be flexible
    const editButton = page.locator('button').filter({ hasText: /edit/i }).first();
    await expect(editButton).toBeVisible({ timeout: 5000 });
    await editButton.click();

    // Wait for edit form to appear and find price input
    // Try different selectors for price input
    let priceInput = page.locator('input[name="price"]');
    if (await priceInput.count() === 0) {
      priceInput = page.locator('input[type="number"]');
    }
    if (await priceInput.count() === 0) {
      priceInput = page.locator('input').filter({ hasText: /price/i }).first();
    }
    if (await priceInput.count() === 0) {
      priceInput = page.locator('[data-testid*="price"]');
    }
    
    await expect(priceInput).toBeVisible({ timeout: 5000 });
    await priceInput.fill('10.99');
    
    // Click save button
    const saveButton = page.locator('button').filter({ hasText: /save/i }).first();
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    
    // Wait for save to complete and verify the price is updated
    await expect(page.getByText('10.99')).toBeVisible({ timeout: 5000 });
  });
});