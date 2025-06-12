import { test, expect } from '@playwright/test';

test.describe('Admin Create Item Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin signin
    await page.goto('/signin');

    // Sign in as admin
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="login-button"]');

    // Wait for navigation to home and admin dashboard to be visible
    await page.waitForURL('/');
    await expect(page.locator('[data-testid="admin-home"]')).toBeVisible();
    
    // Wait for the page to fully load and any initial API calls to complete
    await page.waitForLoadState('networkidle');
    
    // Wait for any loading spinners to disappear
    await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 });
  });

  test('should create and delete item successfully with valid data', async ({ page }) => {
    // Ensure we can see the create button
    await expect(page.locator('[data-testid="create-item-button"]')).toBeVisible();
    
    // Click the create item button to navigate to create page
    await page.click('[data-testid="create-item-button"]');
    
    // Wait for navigation to create page
    await page.waitForURL('/item/create');
    await page.waitForLoadState('networkidle');
    
    // Wait for categories to load and page to be ready
    await page.waitForSelector('select', { timeout: 10000 });
    
    // Fill form with valid data
    const itemName = `Test Item`;
    
    // Item Name
    await page.fill('input[placeholder="Enter item name"]', itemName);
    
    // Price
    await page.fill('input[placeholder="0.00"]', '12.50');
    
    // Description
    await page.fill('textarea[placeholder="Enter item description..."]', 'This is a test item description');
    
    // Ingredients
    await page.fill('textarea[placeholder="Enter each ingredient on a new line..."]', 'Ingredient 1\nIngredient 2\nIngredient 3');
    
    // Serving Tips
    await page.fill('textarea[placeholder="Enter each serving tip on a new line..."]', 'Serve hot\nServe with salad');
    
    // Recommendations
    await page.fill('textarea[placeholder="Enter each recommendation on a new line..."]', 'Pairs well with wine\nGreat for dinner');
    
    // Image URL
    await page.fill('input[placeholder="https://example.com/image.jpg"]', 'https://restaurantwebsiteproject.s3.ap-southeast-2.amazonaws.com/2c4e7cb9-99d6-4d76-bc45-7bffda155548.png');
    
    // Select a category (select the first available category after default)
    await page.selectOption('select', { index: 1 });
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for navigation or success indication (should redirect to item detail page)
    await page.waitForURL('**/item/**', { timeout: 15000 });
    
    // Navigate back to home to verify item was created
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for items to load
    await page.waitForSelector('[data-testid^="item-card-"]', { timeout: 10000 });
    
    // Verify item appears in the list (search for the item name)
    await expect(page.locator(`text=${itemName}`).first()).toBeVisible({ timeout: 10000 });

    await page.locator(`text=${itemName}`).first().click();
    await page.waitForURL('/item/**', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Set up dialog handler to accept the confirmation
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Are you sure you want to delete');
      expect(dialog.message()).toContain(itemName);
      await dialog.accept();
    });
    
    // Click delete button which will trigger the confirmation dialog
    await page.locator('button:has-text("delete")').first().click();
    
    // Wait for navigation back to home after successful deletion
    await page.waitForURL('/', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Verify item has been deleted by checking it's no longer in the list
    await page.waitForSelector('[data-testid^="item-card-"]', { timeout: 10000 });
    await expect(page.locator(`text=${itemName}`)).not.toBeVisible();

  });
});