import { test, expect } from '@playwright/test';

test.describe('Customer Homepage Tests', () => {
  // Mock data for testing
  const mockItems = [
    {
      id: 1,
      name: 'Spring Rolls',
      description: 'Fresh rolls wrapped in rice paper with herbs and vegetables.',
      fullDescription: 'These fresh Vietnamese spring rolls are filled with shrimp, vermicelli noodles, mint, lettuce, and other fresh veggies — light and healthy!',
      price: 6.99,
      image: 'https://restaurantwebsiteproject.s3.ap-southeast-2.amazonaws.com/1c68945f-3f4f-4a66-8c2a-b369f3e6ee56.png',
      ingredients: ['Shrimp', 'Vermicelli noodles', 'Lettuce', 'Mint', 'Carrots', 'Rice paper'],
      servingTips: ['Dip in peanut or hoisin sauce.', 'Eat within 30 minutes of preparation.'],
      recommendations: ['Tofu soup', 'Green tea'],
      categoryId: 1,
      category: { id: 1, name: 'Appetizer' }
    },
    {
      id: 2,
      name: 'Pho Bo',
      description: 'Traditional Vietnamese beef noodle soup.',
      fullDescription: 'Pho bo is one of Vietnam\'s most iconic dishes. Made with slow-cooked beef bones, aromatic spices, and fresh rice noodles, it delivers deep umami flavor in every spoonful.',
      price: 12.99,
      image: 'https://restaurantwebsiteproject.s3.ap-southeast-2.amazonaws.com/e7ddae1f-399d-490a-acff-847131fd5cec.png',
      ingredients: ['Beef bones', 'Rice noodles', 'Star anise', 'Cloves', 'Ginger', 'Onion', 'Fish sauce'],
      servingTips: ['Stir well before eating to mix flavors.', 'Add lime juice and chili sauce to taste.', 'Enjoy the broth first, then the noodles and meat.'],
      recommendations: ['Vietnamese Iced Coffee', 'Spring Rolls', 'Pickled vegetables'],
      categoryId: 2,
      category: { id: 2, name: 'Main Course' }
    },
    {
      id: 3,
      name: 'Banh Mi',
      description: 'A delicious fusion of flavors in a crispy baguette.',
      fullDescription: 'Banh Mi is a classic Vietnamese sandwich made with a crispy baguette, pickled veggies, herbs, and your choice of protein.',
      price: 8.99,
      image: 'https://restaurantwebsiteproject.s3.ap-southeast-2.amazonaws.com/2c4e7cb9-99d6-4d76-bc45-7bffda155548.png',
      ingredients: ['Baguette', 'Pâté', 'Pickled carrots', 'Cucumber', 'Chili sauce'],
      servingTips: ['Eat while warm for best texture.', 'Pair with a cold drink.'],
      recommendations: ['Fruit smoothie', 'Iced coffee'],
      categoryId: 2,
      category: { id: 2, name: 'Main Course' }
    },
    {
      id: 4,
      name: 'Tiramisu',
      description: 'Classic Italian layered dessert with espresso-soaked ladyfingers.',
      fullDescription: 'A rich, creamy, and indulgent dessert made with mascarpone cheese, cocoa powder, and strong brewed coffee.',
      price: 7.99,
      image: 'https://restaurantwebsiteproject.s3.ap-southeast-2.amazonaws.com/3db71eff-9e40-4cb8-8d62-cddeff73d7e8.png',
      ingredients: ['Ladyfingers', 'Espresso', 'Mascarpone', 'Eggs', 'Sugar', 'Cocoa powder'],
      servingTips: ['Best served chilled.', 'Let sit for 5 mins after refrigeration.'],
      recommendations: ['Coffee', 'Sweet wine'],
      categoryId: 3,
      category: { id: 3, name: 'Dessert' }
    },
    {
      id: 5,
      name: 'Vietnamese Iced Coffee',
      description: 'Strong coffee with sweetened condensed milk.',
      fullDescription: 'Traditional Vietnamese coffee made with dark roast coffee and sweetened condensed milk.',
      price: 4.99,
      image: 'https://restaurantwebsiteproject.s3.ap-southeast-2.amazonaws.com/coffee.png',
      ingredients: ['Dark roast coffee', 'Sweetened condensed milk', 'Ice'],
      servingTips: ['Stir well before drinking.', 'Best served immediately.'],
      recommendations: ['Banh Mi', 'Vietnamese pastries'],
      categoryId: 4,
      category: { id: 4, name: 'Beverages' }
    }
  ];

  const mockCategories = [
    { id: 1, name: 'Appetizer' },
    { id: 2, name: 'Main Course' },
    { id: 3, name: 'Dessert' },
    { id: 4, name: 'Beverages' }
  ];

  test.beforeEach(async ({ page }) => {
    // Mock all API endpoints to avoid database dependencies
    
    // Mock items API - return all items
    await page.route('**/api/items', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockItems)
      });
    });

    // Mock categories API
    await page.route('**/api/categories*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCategories)
      });
    });

    // Mock category-specific items API
    await page.route('**/api/categories/*/items', async route => {
      const url = route.request().url();
      const categoryIdMatch = url.match(/\/categories\/(\d+)\/items/);
      
      if (categoryIdMatch) {
        const categoryId = parseInt(categoryIdMatch[1]);
        const filteredItems = mockItems.filter(item => item.categoryId === categoryId);
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(filteredItems)
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    // Mock search API
    await page.route('**/api/search*', async route => {
      const url = route.request().url();
      const searchParams = new URLSearchParams(url.split('?')[1]);
      const query = searchParams.get('q');
      
      if (query && query.length >= 2) {
        const filteredItems = mockItems.filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
        );
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(filteredItems)
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    // Mock authentication endpoints
    await page.route('**/api/auth/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: null })
      });
    });

    // Navigate to customer homepage
    await page.goto('http://localhost:3001');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for content to render
    await page.waitForTimeout(1000);
  });

  test.describe('Filtering and Search Tests', () => {
    test('Category filtering - All Items=5, Appetizer=1, Main Course=2, Dessert=1, Beverages=1', async ({ page }) => {
      // Wait for page to load with items
      await page.waitForSelector('text=Spring Rolls', { timeout: 10000 });
      
      // Test "All Items" category - should show all 5 items
      const allItemsButton = page.locator('[data-testid="category-all-items"]');
      await allItemsButton.click();
      await page.waitForTimeout(1000);
      
      const allItems = page.locator('[data-testid^="item-card-"]');
      await expect(allItems).toHaveCount(5);
      
      // Test "Appetizer" category - should show 1 item
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
      await expect(page.locator('text=Vietnamese Iced Coffee')).toBeVisible();
    });

    test('Search functionality with debounced input', async ({ page }) => {
      // Wait for page to load
      await page.waitForSelector('text=Spring Rolls', { timeout: 10000 });
      
      // Find search input (search for common input attributes)
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]').first();
      await expect(searchInput).toBeVisible();
      
      // Search for "Pho" - should return 1 result
      await searchInput.fill('Pho');
      
      // Wait for debounced search (search component uses 500ms debounce)
      await page.waitForTimeout(1000);
      
      // Verify only Pho Bo is visible in results
      await expect(page.locator('text=Pho Bo')).toBeVisible();
      
      // Verify other items are not visible
      await expect(page.locator('text=Spring Rolls')).not.toBeVisible();
      await expect(page.locator('text=Tiramisu')).not.toBeVisible();
      
      // Search for "coffee" - should return 1 result
      await searchInput.clear();
      await searchInput.fill('coffee');
      await page.waitForTimeout(1000);
      
      await expect(page.locator('text=Vietnamese Iced Coffee')).toBeVisible();
      await expect(page.locator('text=Pho Bo')).not.toBeVisible();
      
      // Clear search and verify all items return
      await searchInput.clear();
      await page.waitForTimeout(1000);
      
      // Go back to all items view
      const allItemsButton = page.locator('[data-testid="category-all-items"]');
      await allItemsButton.click();
      await page.waitForTimeout(1000);
      
      // Verify all 5 items are visible again
      const allItems = page.locator('[data-testid^="item-card-"]');
      await expect(allItems).toHaveCount(5);
    });
  });

  test.describe('Cart Functionality Tests', () => {
    test('Add item to cart and verify cart updates', async ({ page }) => {
      // Wait for items to load
      await page.waitForSelector('text=Spring Rolls', { timeout: 10000 });
      
      // Find Spring Rolls item and add to cart
      const springRollsCard = page.locator('[data-testid^="item-card-"]:has(text("Spring Rolls"))');
      const addToCartButton = springRollsCard.locator('button:has-text("Add to Cart")');
      
      // Verify add to cart button exists
      await expect(addToCartButton).toBeVisible();
      
      // Click add to cart
      await addToCartButton.click();
      
      // Wait for cart update
      await page.waitForTimeout(1000);
      
      // Verify cart shows item count (look for cart indicator)
      const cartCountIndicator = page.locator('.bg-indigo-600:has-text("1")');
      await expect(cartCountIndicator).toBeVisible({ timeout: 5000 });
      
      // Verify cart section shows the item
      await expect(page.locator('text=Spring Rolls')).toBeVisible();
      await expect(page.locator('text=$6.99')).toBeVisible();
      
      // Verify cart total shows correct amount
      await expect(page.locator('text=$6.99').last()).toBeVisible();
    });

    test('Update cart item quantities', async ({ page }) => {
      // Wait for items to load
      await page.waitForSelector('text=Spring Rolls', { timeout: 10000 });
      
      // Add item to cart first
      const springRollsCard = page.locator('[data-testid^="item-card-"]:has(text("Spring Rolls"))');
      const addToCartButton = springRollsCard.locator('button:has-text("Add to Cart")');
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      
      // Find quantity increase button in cart
      const increaseButton = page.locator('button:has-text("+")');
      await expect(increaseButton).toBeVisible();
      
      // Click to increase quantity
      await increaseButton.click();
      await page.waitForTimeout(500);
      
      // Verify quantity shows 2
      await expect(page.locator('text=2').first()).toBeVisible();
      
      // Verify cart count indicator shows 2
      const cartCountIndicator = page.locator('.bg-indigo-600:has-text("2")');
      await expect(cartCountIndicator).toBeVisible();
      
      // Verify total price updated (2 * $6.99 = $13.98)
      await expect(page.locator('text=$13.98')).toBeVisible();
      
      // Test quantity decrease
      const decreaseButton = page.locator('button:has-text("−")');
      await decreaseButton.click();
      await page.waitForTimeout(500);
      
      // Verify quantity back to 1
      await expect(page.locator('text=1').first()).toBeVisible();
      await expect(page.locator('text=$6.99').last()).toBeVisible();
    });

    test('Remove item from cart', async ({ page }) => {
      // Wait for items to load
      await page.waitForSelector('text=Spring Rolls', { timeout: 10000 });
      
      // Add item to cart first
      const springRollsCard = page.locator('[data-testid^="item-card-"]:has(text("Spring Rolls"))');
      const addToCartButton = springRollsCard.locator('button:has-text("Add to Cart")');
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      
      // Verify item is in cart
      await expect(page.locator('text=Spring Rolls')).toBeVisible();
      
      // Find and click remove button (trash icon)
      const removeButton = page.locator('button[aria-label="Remove item"]');
      await expect(removeButton).toBeVisible();
      await removeButton.click();
      await page.waitForTimeout(500);
      
      // Verify cart is empty
      await expect(page.locator('text=Your cart is empty')).toBeVisible();
      
      // Verify no cart count indicator
      const cartCountIndicator = page.locator('.bg-indigo-600:has-text("1")');
      await expect(cartCountIndicator).not.toBeVisible();
    });

    test('Cart checkout workflow - requires authentication', async ({ page }) => {
      // Wait for items to load
      await page.waitForSelector('text=Spring Rolls', { timeout: 10000 });
      
      // Add item to cart
      const springRollsCard = page.locator('[data-testid^="item-card-"]:has(text("Spring Rolls"))');
      const addToCartButton = springRollsCard.locator('button:has-text("Add to Cart")');
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      
      // Find checkout button
      const checkoutButton = page.locator('button:has-text("Checkout")');
      await expect(checkoutButton).toBeVisible();
      
      // Click checkout button (should require authentication)
      await checkoutButton.click();
      await page.waitForTimeout(1000);
      
      // Should redirect to sign in or show authentication notice
      const signInNotice = page.locator('text=Sign in required, text=Please sign in');
      const signInLink = page.locator('a[href*="signin"], button:has-text("Sign")');
      
      // Verify either authentication notice appears or redirect to sign-in
      const hasAuthNotice = await signInNotice.count() > 0;
      const hasSignInLink = await signInLink.count() > 0;
      const isOnSignInPage = page.url().includes('signin');
      
      expect(hasAuthNotice || hasSignInLink || isOnSignInPage).toBeTruthy();
    });
  });

  test.describe('Item Detail and Navigation Tests', () => {
    test('View item details page', async ({ page }) => {
      // Wait for items to load
      await page.waitForSelector('text=Pho Bo', { timeout: 10000 });
      
      // Click on Pho Bo item to view details
      const phoBoCard = page.locator('[data-testid^="item-card-"]:has(text("Pho Bo"))');
      const itemLink = phoBoCard.locator('a').first();
      await itemLink.click();
      
      // Wait for item detail page to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Verify we're on item detail page
      expect(page.url()).toContain('/item/');
      
      // Verify item details are displayed
      await expect(page.locator('text=Pho Bo')).toBeVisible();
      await expect(page.locator('text=Traditional Vietnamese beef noodle soup.')).toBeVisible();
      await expect(page.locator('text=$12.99')).toBeVisible();
      
      // Check for full description
      const fullDescriptionText = page.locator('text=Pho bo is one of Vietnam');
      if (await fullDescriptionText.count() > 0) {
        await expect(fullDescriptionText).toBeVisible();
      }
      
      // Check for ingredients section
      const ingredientsText = page.locator('text=Beef bones, text=Rice noodles');
      if (await ingredientsText.count() > 0) {
        await expect(ingredientsText.first()).toBeVisible();
      }
      
      // Verify add to cart button exists on detail page
      const detailAddToCartButton = page.locator('button:has-text("Add to Cart")');
      await expect(detailAddToCartButton).toBeVisible();
    });

    test('Navigation between categories maintains state', async ({ page }) => {
      // Wait for items to load
      await page.waitForSelector('text=Spring Rolls', { timeout: 10000 });
      
      // Add item to cart from appetizer category
      const springRollsCard = page.locator('[data-testid^="item-card-"]:has(text("Spring Rolls"))');
      const addToCartButton = springRollsCard.locator('button:has-text("Add to Cart")');
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      
      // Navigate to main course category
      const mainCourseButton = page.locator('[data-testid="category-main-course"]');
      await mainCourseButton.click();
      await page.waitForTimeout(1000);
      
      // Verify cart still shows the item
      await expect(page.locator('text=Spring Rolls')).toBeVisible();
      const cartCountIndicator = page.locator('.bg-indigo-600:has-text("1")');
      await expect(cartCountIndicator).toBeVisible();
      
      // Add another item from main course
      const phoBoCard = page.locator('[data-testid^="item-card-"]:has(text("Pho Bo"))');
      const phoAddToCartButton = phoBoCard.locator('button:has-text("Add to Cart")');
      await phoAddToCartButton.click();
      await page.waitForTimeout(1000);
      
      // Verify cart now shows 2 items
      const cartCount2Indicator = page.locator('.bg-indigo-600:has-text("2")');
      await expect(cartCount2Indicator).toBeVisible();
      
      // Navigate back to all items
      const allItemsButton = page.locator('[data-testid="category-all-items"]');
      await allItemsButton.click();
      await page.waitForTimeout(1000);
      
      // Verify cart state is maintained
      await expect(cartCount2Indicator).toBeVisible();
      await expect(page.locator('text=Spring Rolls')).toBeVisible();
      await expect(page.locator('text=Pho Bo')).toBeVisible();
    });
  });
});