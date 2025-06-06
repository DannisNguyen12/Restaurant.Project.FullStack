import { test, expect } from '@playwright/test';
import { main } from '../../../database/src/seed';

test.describe('Admin Homepage', () => {
  test.beforeEach(async ({ page }) => {
    // Reset database to fresh seeded state before each test
    console.log('🌱 Seeding database with fresh data...');
    await main();
    console.log('✅ Database seeded successfully');

    // Navigate to admin homepage
    await page.goto('http://localhost:3002');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  // Test 1: Category filtering verification
  test('Test 1: Category filtering - All Items=4, Appetizer=1, Dessert=1, Main Course=2', async ({ page }) => {
    // Wait for page to load with items
    await page.waitForSelector('text=Pho Bo', { timeout: 10000 });
    
    // Click on "All Items" and verify 4 items
    const allItemsButton = page.locator('[data-testid="category-all-items"]');
    await allItemsButton.click();
    await page.waitForTimeout(500);
    
    const allItems = page.locator('[data-testid^="item-card-"]');
    await expect(allItems).toHaveCount(4);
    
    // Click on "Appetizer" and expect 1 item
    const appetizerButton = page.locator('[data-testid="category-appetizer"]');
    await appetizerButton.click();
    await page.waitForTimeout(500);
    
    const appetizerItems = page.locator('[data-testid^="item-card-"]');
    await expect(appetizerItems).toHaveCount(1);
    await expect(page.locator('text=Spring Rolls')).toBeVisible();
    
    // Click on "Dessert" and expect 1 item
    const dessertButton = page.locator('[data-testid="category-dessert"]');
    await dessertButton.click();
    await page.waitForTimeout(500);
    
    const dessertItems = page.locator('[data-testid^="item-card-"]');
    await expect(dessertItems).toHaveCount(1);
    await expect(page.locator('text=Tiramisu')).toBeVisible();
    
    // Click on "Main Course" and expect 2 items
    const mainCourseButton = page.locator('[data-testid="category-main-course"]');
    await mainCourseButton.click();
    await page.waitForTimeout(500);
    
    const mainCourseItems = page.locator('[data-testid^="item-card-"]');
    await expect(mainCourseItems).toHaveCount(2);
    await expect(page.locator('text=Pho Bo')).toBeVisible();
    await expect(page.locator('text=Banh Mi')).toBeVisible();
  });

  // Test 2: Item deletion workflow (real database operations with fresh data)
  test('Test 2: Delete item and verify removal', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('text=Pho Bo', { timeout: 10000 });
    
    // Count initial items (should be 4)
    const initialItems = page.locator('[data-testid^="item-card-"]');
    await expect(initialItems).toHaveCount(4);
    
    // Find the Spring Rolls item and its delete button
    const springRollsCard = page.locator('[data-testid^="item-card-"]:has(text("Spring Rolls"))');
    const deleteButton = springRollsCard.locator('button:has-text("Delete")');
    
    // Set up dialog handler to confirm deletion
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Are you sure you want to delete');
      await dialog.accept();
    });
    
    // Click delete button
    await deleteButton.click();
    
    // Wait for deletion to complete and page to refresh
    await page.waitForTimeout(2000);
    
    // Verify item count reduced to 3
    const remainingItems = page.locator('[data-testid^="item-card-"]');
    await expect(remainingItems).toHaveCount(3);
    
    // Verify Spring Rolls is no longer visible
    await expect(page.locator('text=Spring Rolls')).not.toBeVisible();
  });

  // Test 3: Item editing workflow (real database operations)
  test('Test 3: Edit item price and verify changes', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('text=Pho Bo', { timeout: 10000 });
    
    // Click on Pho Bo item to view details
    const phoBoCard = page.locator('[data-testid^="item-card-"]:has(text("Pho Bo"))');
    const itemLink = phoBoCard.locator('a').first();
    await itemLink.click();
    
    // Wait for item detail page to load and find edit button
    await page.waitForSelector('button:has-text("Edit"), a:has-text("Edit")', { timeout: 10000 });
    const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")');
    await editButton.click();
    
    // Wait for edit form to load
    await page.waitForSelector('input[name="price"], input[type="number"]', { timeout: 10000 });
    
    // Change the price from 12.99 to 15.99
    const priceInput = page.locator('input[name="price"], input[type="number"]').first();
    await priceInput.clear();
    await priceInput.fill('15.99');
    
    // Verify the input value changed
    await expect(priceInput).toHaveValue('15.99');
    
    // Save the changes
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")');
    await saveButton.click();
    
    // Wait for save completion and navigation back
    await page.waitForTimeout(2000);
    
    // Verify we're back on the home page or detail page shows updated price
    const updatedPrice = page.locator('text=15.99, text=$15.99');
    await expect(updatedPrice).toBeVisible({ timeout: 5000 });
  });

  // Test 4: New item creation workflow (real database operations)
  test('Test 4: Create new item and verify it appears', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('[data-testid="create-item-button"]', { timeout: 10000 });
    
    // Count initial items (should be 4)
    const initialItems = page.locator('[data-testid^="item-card-"]');
    await expect(initialItems).toHaveCount(4);
    
    // Click Create Item button
    const createButton = page.locator('[data-testid="create-item-button"]');
    await createButton.click();
    
    // Wait for create form to load
    await page.waitForSelector('input[name="name"], input[placeholder*="name"]', { timeout: 10000 });
    
    // Fill in the form with test data
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    await nameInput.fill('Test Automation Item');
    
    const descriptionInput = page.locator('textarea[name="description"], input[name="description"]');
    if (await descriptionInput.count() > 0) {
      await descriptionInput.fill('This is a test item created by automation testing');
    }
    
    const priceInput = page.locator('input[name="price"], input[type="number"]');
    await priceInput.fill('19.99');
    
    // Select Appetizer category if dropdown exists
    const categorySelect = page.locator('select[name="categoryId"], select[name="category"]');
    if (await categorySelect.count() > 0) {
      // Find and select "Appetizer" option
      await categorySelect.selectOption({ label: 'Appetizer' });
    }
    
    // Verify form values
    await expect(nameInput).toHaveValue('Test Automation Item');
    await expect(priceInput).toHaveValue('19.99');
    
    // Save the new item
    const saveButton = page.locator('button:has-text("Create"), button:has-text("Save")');
    await saveButton.click();
    
    // Wait for creation completion and navigation back to home
    await page.waitForTimeout(3000);
    
    // Navigate back to home if not already there
    await page.goto('http://localhost:3002');
    await page.waitForSelector('text=Pho Bo', { timeout: 10000 });
    
    // Verify item count increased to 5
    const updatedItems = page.locator('[data-testid^="item-card-"]');
    await expect(updatedItems).toHaveCount(5);
    
    // Verify new item is visible
    await expect(page.locator('text=Test Automation Item')).toBeVisible();
    await expect(page.locator('text=19.99, text=$19.99')).toBeVisible();
  });
});

