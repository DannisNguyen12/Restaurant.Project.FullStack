import { test, expect } from '../helpers';

test.describe('Admin Item Management', () => {
  test('should create a new menu item', async ({ adminPage: page }) => {
    // Go to create page
    await page.goto('/create');
    
    // Fill out the form
    await page.getByLabel('Name').fill('Test Item');
    await page.locator('input[name="description"]').fill('This is a test item created by Playwright');
    await page.getByLabel('Price').fill('12.99');
    await page.locator('input[name="image"]').fill('https://restaurantwebsiteproject.s3.ap-southeast-2.amazonaws.com/e7ddae1f-399d-490a-acff-847131fd5cec.png');
    
    // Submit the form
    const navigationPromise = page.waitForURL('/');
    await page.getByRole('button', { name: 'Create Item' }).click();
    await navigationPromise;
    
    // Verify the new item appears on the dashboard
    const itemTitle = await page.getByRole('link', { name: 'Test Item' }).first();
    expect(itemTitle).toBeVisible();
  });
  
  test('should edit an existing menu item', async ({ adminPage: page }) => {
    // Go to the dashboard
    await page.goto('/');
    
    // Click edit on the first item
    await page.getByRole('link', { name: 'Edit' }).first().click();
    
    // Wait for the "Save Changes" button to be visible, indicating the form is ready
    await page.getByRole('button', { name: 'Save Changes' }).waitFor({ state: 'visible' });

    // Fill in the updated details
    await page.locator('input[name="name"]').first().fill('Updated Pho Bo');
    await page.locator('textarea[name="description"]').first().fill('Updated Test Description');
    await page.locator('input[name="price"]').first().fill('12.99');
    
    // Save changes
    const navigationPromise = page.waitForURL('/');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await navigationPromise;
    
    // Verify the updated item appears on the dashboard
    const updatedItemTitle = await page.getByRole('link', { name: 'Updated Pho Bo' }).first();
    expect(updatedItemTitle).toBeVisible();
  });
});
