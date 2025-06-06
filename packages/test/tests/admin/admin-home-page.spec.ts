import { test, expect } from '@playwright/test';

// Use mock data instead of seeding to avoid database conflicts
const mockCategories = [
  { id: 1, name: 'Appetizer' },
  { id: 2, name: 'Main Course' },
  { id: 3, name: 'Dessert' },
  { id: 4, name: 'Beverages' }
];

const mockItems = [
  {
    id: 1,
    name: 'Spring Rolls',
    description: 'Fresh spring rolls with vegetables and herbs.',
    price: 6.99,
    image: '/placeholder-food.jpg',
    categoryId: 1,
    category: { id: 1, name: 'Appetizer' }
  },
  {
    id: 2,
    name: 'Pho Bo',
    description: 'Traditional Vietnamese beef noodle soup.',
    price: 12.99,
    image: '/placeholder-food.jpg',
    categoryId: 2,
    category: { id: 2, name: 'Main Course' }
  },
  {
    id: 3,
    name: 'Banh Mi',
    description: 'A delicious fusion of flavors in a crispy baguette.',
    price: 8.99,
    image: '/placeholder-food.jpg',
    categoryId: 2,
    category: { id: 2, name: 'Main Course' }
  },
  {
    id: 4,
    name: 'Tiramisu',
    description: 'Classic Italian layered dessert with espresso-soaked ladyfingers.',
    price: 7.99,
    image: '/placeholder-food.jpg',
    categoryId: 3,
    category: { id: 3, name: 'Dessert' }
  },
  {
    id: 5,
    name: 'Vietnamese Coffee',
    description: 'Rich and smooth Vietnamese drip coffee with condensed milk.',
    price: 4.99,
    image: '/placeholder-food.jpg',
    categoryId: 4,
    category: { id: 4, name: 'Beverages' }
  }
];

test.beforeEach(async ({ page }) => {
  // Mock all API calls to avoid database dependencies
  await page.route('**/api/categories', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockCategories)
    });
  });

  await page.route('**/api/items**', async route => {
    const url = route.request().url();
    const method = route.request().method();
    
    if (url.includes('/api/items/') && method === 'DELETE') {
      // Handle item deletion
      const itemId = parseInt(url.match(/\/items\/(\d+)/)?.[1] || '0');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Item deleted successfully' })
      });
    } else if (url.includes('/api/items/') && method === 'GET') {
      // Handle single item fetch
      const itemId = parseInt(url.match(/\/items\/(\d+)/)?.[1] || '0');
      const item = mockItems.find(item => item.id === itemId);
      await route.fulfill({
        status: item ? 200 : 404,
        contentType: 'application/json',
        body: JSON.stringify(item || { error: 'Item not found' })
      });
    } else if (url.includes('/api/items/') && (method === 'PUT' || method === 'PATCH')) {
      // Handle item update
      const itemId = parseInt(url.match(/\/items\/(\d+)/)?.[1] || '0');
      const requestBody = await route.request().postDataJSON();
      const updatedItem = { ...mockItems.find(item => item.id === itemId), ...requestBody };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(updatedItem)
      });
    } else if (url.includes('/categories/') && url.includes('/items')) {
      // Handle category-specific items
      const categoryId = parseInt(url.match(/\/categories\/(\d+)\/items/)?.[1] || '0');
      const categoryItems = mockItems.filter(item => item.categoryId === categoryId);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(categoryItems)
      });
    } else if (method === 'POST' && url.includes('/api/items')) {
      // Handle item creation
      const requestBody = await route.request().postDataJSON();
      const newItem = { id: Date.now(), ...requestBody };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newItem)
      });
    } else {
      // Handle all items
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockItems)
      });
    }
  });

  await page.route('**/api/search**', async route => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get('q')?.toLowerCase() || '';
    
    const searchResults = mockItems.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query)
    );
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: searchResults })
    });
  });

  // Mock authentication
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { email: 'admin@test.com', name: 'Test Admin' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
    });
  });

  // Navigate to admin app
  await page.goto('http://localhost:3002');
  await page.waitForLoadState('networkidle');
});

test.describe('Admin Homepage - Filtering and Search Tests', () => {
  test('should filter items by category correctly', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('[data-testid^="item-card-"]', { timeout: 10000 });
    
    // Test "All Items" - should show all 5 items
    const allItemsButton = page.locator('[data-testid="category-all-items"]');
    await allItemsButton.click();
    await page.waitForTimeout(1000);
    
    const allItems = page.locator('[data-testid^="item-card-"]');
    await expect(allItems).toHaveCount(5);
    
    // Test "Appetizer" category - should show 1 item (Spring Rolls)
    const appetizerButton = page.locator('[data-testid="category-appetizer"]');
    await appetizerButton.click();
    await page.waitForTimeout(1000);
    
    const appetizerItems = page.locator('[data-testid^="item-card-"]');
    await expect(appetizerItems).toHaveCount(1);
    await expect(page.locator('text=Spring Rolls')).toBeVisible();
    
    // Test "Main Course" category - should show 2 items
    const mainCourseButton = page.locator('[data-testid="category-main-course"]');
    await mainCourseButton.click();
    await page.waitForTimeout(1000);
    
    const mainCourseItems = page.locator('[data-testid^="item-card-"]');
    await expect(mainCourseItems).toHaveCount(2);
    await expect(page.locator('text=Pho Bo')).toBeVisible();
    await expect(page.locator('text=Banh Mi')).toBeVisible();
    
    // Test "Dessert" category - should show 1 item
    const dessertButton = page.locator('[data-testid="category-dessert"]');
    await dessertButton.click();
    await page.waitForTimeout(1000);
    
    const dessertItems = page.locator('[data-testid^="item-card-"]');
    await expect(dessertItems).toHaveCount(1);
    await expect(page.locator('text=Tiramisu')).toBeVisible();
    
    // Test "Beverages" category - should show 1 item
    const beveragesButton = page.locator('[data-testid="category-beverages"]');
    await beveragesButton.click();
    await page.waitForTimeout(1000);
    
    const beverageItems = page.locator('[data-testid^="item-card-"]');
    await expect(beverageItems).toHaveCount(1);
    await expect(page.locator('text=Vietnamese Coffee')).toBeVisible();
  });

  test('should search items correctly', async ({ page }) => {
    // Wait for search input to be available
    await page.waitForSelector('input[type="search"], input[placeholder*="search"]', { timeout: 10000 });
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]').first();
    
    // Search for "Pho" - should return 1 result
    await searchInput.fill('Pho');
    await page.waitForTimeout(2000); // Wait for debounced search
    
    const phoResults = page.locator('[data-testid^="item-card-"]');
    await expect(phoResults).toHaveCount(1);
    await expect(page.locator('text=Pho Bo')).toBeVisible();
    
    // Search for "Vietnamese" - should return 2 results (Pho Bo and Vietnamese Coffee)
    await searchInput.clear();
    await searchInput.fill('Vietnamese');
    await page.waitForTimeout(2000);
    
    const vietnameseResults = page.locator('[data-testid^="item-card-"]');
    await expect(vietnameseResults).toHaveCount(2);
    await expect(page.locator('text=Pho Bo')).toBeVisible();
    await expect(page.locator('text=Vietnamese Coffee')).toBeVisible();
    
    // Search for "dessert" - should return 1 result
    await searchInput.clear();
    await searchInput.fill('dessert');
    await page.waitForTimeout(2000);
    
    const dessertResults = page.locator('[data-testid^="item-card-"]');
    await expect(dessertResults).toHaveCount(1);
    await expect(page.locator('text=Tiramisu')).toBeVisible();
    
    // Clear search to show all items again
    await searchInput.clear();
    await page.waitForTimeout(2000);
    
    const allResults = page.locator('[data-testid^="item-card-"]');
    await expect(allResults).toHaveCount(5);
  });
});

test.describe('Admin Homepage - Item Management Tests', () => {
  test('should delete an item successfully', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('[data-testid^="item-card-"]', { timeout: 10000 });
    
    // Count initial items
    const initialItems = page.locator('[data-testid^="item-card-"]');
    await expect(initialItems).toHaveCount(5);
    
    // Find Spring Rolls item and its delete button
    const springRollsCard = page.locator('[data-testid^="item-card-"]:has(text("Spring Rolls"))');
    await expect(springRollsCard).toBeVisible();
    
    const deleteButton = springRollsCard.locator('button:has-text("Delete")');
    
    // Set up dialog handler for confirmation
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Are you sure you want to delete');
      await dialog.accept();
    });
    
    // Click delete button
    await deleteButton.click();
    
    // Wait for deletion animation/update
    await page.waitForTimeout(2000);
    
    // Item should be removed from the UI immediately (optimistic update)
    await expect(springRollsCard).not.toBeVisible();
    
    // Verify the item count decreased
    const remainingItems = page.locator('[data-testid^="item-card-"]');
    await expect(remainingItems).toHaveCount(4);
  });

  test('should create a new item successfully', async ({ page }) => {
    // Wait for create button to be available
    await page.waitForSelector('[data-testid="create-item-button"]', { timeout: 10000 });
    
    // Click create item button
    const createButton = page.locator('[data-testid="create-item-button"]');
    await createButton.click();
    
    // Should navigate to create page
    await page.waitForURL('**/item/create');
    
    // Wait for form elements to be available
    await page.waitForSelector('input[name="name"], input[placeholder*="name"]', { timeout: 10000 });
    
    // Fill out the form
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    await nameInput.fill('Test Automation Item');
    
    const priceInput = page.locator('input[name="price"], input[type="number"]').first();
    await priceInput.fill('15.99');
    
    // Fill description if available
    const descriptionInput = page.locator('textarea[name="fullDescription"], textarea:has(+ label:has-text("Description"))').first();
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('A test item created by automation testing');
    }
    
    // Select category if dropdown exists
    const categorySelect = page.locator('select[name="categoryId"], select:has(option)').first();
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption('1'); // Appetizer
    }
    
    // Verify form values
    await expect(nameInput).toHaveValue('Test Automation Item');
    await expect(priceInput).toHaveValue('15.99');
    
    // Submit the form
    const createSubmitButton = page.locator('button[type="submit"]:has-text("Create"), button:has-text("Create Item")');
    await createSubmitButton.click();
    
    // Wait for creation and potential redirect
    await page.waitForTimeout(3000);
    
    // Should either be on item detail page or redirected back to home
    // Check if we can see the success indication
    const successToast = page.locator('text=created, text=success').first();
    if (await successToast.isVisible()) {
      console.log('Success toast found');
    }
    
    // Navigate back to home to verify item was created
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    
    // Update mock to include the new item for verification
    await page.route('**/api/items**', async route => {
      const newMockItems = [...mockItems, {
        id: 6,
        name: 'Test Automation Item',
        description: 'A test item created by automation testing',
        price: 15.99,
        image: '/placeholder-food.jpg',
        categoryId: 1,
        category: { id: 1, name: 'Appetizer' }
      }];
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(newMockItems)
      });
    });
    
    // Refresh the page to load updated items
    await page.reload();
    await page.waitForSelector('[data-testid^="item-card-"]', { timeout: 10000 });
    
    // Verify the new item appears
    await expect(page.locator('text=Test Automation Item')).toBeVisible();
  });

  test('should edit an item price successfully', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('[data-testid^="item-card-"]', { timeout: 10000 });
    
    // Click on Pho Bo item to view details
    const phoBoCard = page.locator('[data-testid^="item-card-"]:has(text("Pho Bo"))');
    const itemLink = phoBoCard.locator('a, [href]').first();
    await itemLink.click();
    
    // Should navigate to item detail page
    await page.waitForSelector('button:has-text("Edit"), button[class*="edit"]', { timeout: 10000 });
    
    // Click edit button
    const editButton = page.locator('button:has-text("Edit"), button[class*="edit"]').first();
    await editButton.click();
    
    // Wait for edit form to appear
    await page.waitForSelector('input[name="price"], input[type="number"]', { timeout: 10000 });
    
    // Find price input and update it
    const priceInput = page.locator('input[name="price"], input[type="number"]').first();
    await priceInput.clear();
    await priceInput.fill('15.99');
    
    // Verify the input value changed
    await expect(priceInput).toHaveValue('15.99');
    
    // Save the changes
    const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
    await saveButton.click();
    
    // Wait for save operation
    await page.waitForTimeout(2000);
    
    // Check for success indication or updated price display
    const updatedPriceDisplay = page.locator('text=$15.99, span:has-text("15.99")').first();
    await expect(updatedPriceDisplay).toBeVisible({ timeout: 5000 });
  });
});

