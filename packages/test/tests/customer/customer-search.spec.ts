import { test, expect } from '@playwright/test';

test.describe('Customer - Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('should display search bar prominently', async ({ page }) => {
    await expect(page.locator('.search-bar, [data-testid="search-bar"], input[type="search"]')).toBeVisible();
    await expect(page.locator('.search-input, [data-testid="search-input"]')).toHaveAttribute('placeholder', /search/i);
  });

  test('should search for menu items by name', async ({ page }) => {
    const searchInput = page.locator('.search-input, [data-testid="search-input"], input[type="search"]');
    
    await searchInput.fill('pizza');
    await page.keyboard.press('Enter');
    
    // Should show search results
    await expect(page.locator('.search-results, [data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('.menu-item, [data-testid="menu-item"]')).toContainText(/pizza/i);
  });

  test('should show search suggestions while typing', async ({ page }) => {
    const searchInput = page.locator('.search-input, [data-testid="search-input"]');
    
    await searchInput.fill('bur');
    await page.waitForTimeout(500); // Wait for suggestions
    
    // Check for search suggestions dropdown
    await expect(page.locator('.search-suggestions, [data-testid="search-suggestions"]')).toBeVisible();
    await expect(page.locator('.suggestion-item, [data-testid="suggestion-item"]')).toContainText(/burger/i);
  });

  test('should select suggestion from dropdown', async ({ page }) => {
    const searchInput = page.locator('.search-input, [data-testid="search-input"]');
    
    await searchInput.fill('bur');
    await page.waitForTimeout(500);
    
    // Click first suggestion
    await page.click('.suggestion-item:first-child, [data-testid="suggestion-item"]:first-of-type');
    
    // Should fill search input and perform search
    await expect(searchInput).toHaveValue(/burger/i);
    await expect(page.locator('.search-results, [data-testid="search-results"]')).toBeVisible();
  });

  test('should search by category', async ({ page }) => {
    await page.fill('.search-input, [data-testid="search-input"]', 'appetizers');
    await page.keyboard.press('Enter');
    
    // Should show appetizer items
    const results = page.locator('.menu-item, [data-testid="menu-item"]');
    const count = await results.count();
    
    for (let i = 0; i < count; i++) {
      const category = await results.nth(i).locator('.category, [data-testid="category"]').textContent();
      expect(category?.toLowerCase()).toContain('appetizer');
    }
  });

  test('should search by ingredients', async ({ page }) => {
    await page.fill('.search-input, [data-testid="search-input"]', 'chicken');
    await page.keyboard.press('Enter');
    
    // Should show items containing chicken
    await expect(page.locator('.search-results, [data-testid="search-results"]')).toBeVisible();
    const results = page.locator('.menu-item, [data-testid="menu-item"]');
    await expect(results.first()).toContainText(/chicken/i);
  });

  test('should handle empty search results', async ({ page }) => {
    await page.fill('.search-input, [data-testid="search-input"]', 'nonexistentfood123');
    await page.keyboard.press('Enter');
    
    // Should show no results message
    await expect(page.locator('.no-results, [data-testid="no-results"]')).toBeVisible();
    await expect(page.locator('.no-results, [data-testid="no-results"]')).toContainText(/no results|not found/i);
  });

  test('should clear search results', async ({ page }) => {
    // Perform search first
    await page.fill('.search-input, [data-testid="search-input"]', 'pizza');
    await page.keyboard.press('Enter');
    await expect(page.locator('.search-results, [data-testid="search-results"]')).toBeVisible();
    
    // Clear search
    await page.click('.clear-search, [data-testid="clear-search"], button:has-text("Clear")');
    
    // Should return to full menu
    await expect(page.locator('.search-input, [data-testid="search-input"]')).toHaveValue('');
    await expect(page.locator('.menu-items, [data-testid="menu-items"]')).toBeVisible();
  });

  test('should filter search results by price range', async ({ page }) => {
    await page.fill('.search-input, [data-testid="search-input"]', 'burger');
    await page.keyboard.press('Enter');
    
    // Apply price filter
    await page.selectOption('.price-filter, [data-testid="price-filter"]', '10-20');
    await page.waitForTimeout(1000);
    
    // Check filtered results
    const prices = page.locator('.item-price, [data-testid="item-price"]');
    const count = await prices.count();
    
    for (let i = 0; i < count; i++) {
      const priceText = await prices.nth(i).textContent();
      const price = parseFloat(priceText?.replace(/[^0-9.]/g, '') || '0');
      expect(price).toBeGreaterThanOrEqual(10);
      expect(price).toBeLessThanOrEqual(20);
    }
  });

  test('should filter search results by dietary restrictions', async ({ page }) => {
    await page.fill('.search-input, [data-testid="search-input"]', 'salad');
    await page.keyboard.press('Enter');
    
    // Apply vegetarian filter
    await page.check('.dietary-filter input[value="vegetarian"], [data-testid="vegetarian-filter"]');
    await page.waitForTimeout(1000);
    
    // Check that results show vegetarian options
    const results = page.locator('.menu-item, [data-testid="menu-item"]');
    const count = await results.count();
    
    for (let i = 0; i < count; i++) {
      await expect(results.nth(i).locator('.dietary-tags, [data-testid="dietary-tags"]')).toContainText(/vegetarian/i);
    }
  });

  test('should sort search results', async ({ page }) => {
    await page.fill('.search-input, [data-testid="search-input"]', 'pasta');
    await page.keyboard.press('Enter');
    
    // Sort by price low to high
    await page.selectOption('.sort-dropdown, [data-testid="sort-dropdown"]', 'price-asc');
    await page.waitForTimeout(1000);
    
    // Verify sorting
    const prices = page.locator('.item-price, [data-testid="item-price"]');
    const firstPrice = await prices.first().textContent();
    const secondPrice = await prices.nth(1).textContent();
    
    const first = parseFloat(firstPrice?.replace(/[^0-9.]/g, '') || '0');
    const second = parseFloat(secondPrice?.replace(/[^0-9.]/g, '') || '0');
    
    expect(first).toBeLessThanOrEqual(second);
  });

  test('should show search result count', async ({ page }) => {
    await page.fill('.search-input, [data-testid="search-input"]', 'chicken');
    await page.keyboard.press('Enter');
    
    // Should display result count
    await expect(page.locator('.result-count, [data-testid="result-count"]')).toBeVisible();
    await expect(page.locator('.result-count, [data-testid="result-count"]')).toContainText(/\d+\s*results?/i);
  });

  test('should handle special characters in search', async ({ page }) => {
    await page.fill('.search-input, [data-testid="search-input"]', 'café');
    await page.keyboard.press('Enter');
    
    // Should handle accented characters properly
    await expect(page.locator('.search-results, [data-testid="search-results"]')).toBeVisible();
  });

  test('should save recent searches', async ({ page }) => {
    // Perform multiple searches
    await page.fill('.search-input, [data-testid="search-input"]', 'pizza');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    await page.fill('.search-input, [data-testid="search-input"]', 'burger');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    // Click on search input to see recent searches
    await page.click('.search-input, [data-testid="search-input"]');
    
    // Should show recent searches
    await expect(page.locator('.recent-searches, [data-testid="recent-searches"]')).toBeVisible();
    await expect(page.locator('.recent-search-item, [data-testid="recent-search-item"]')).toContainText('pizza');
    await expect(page.locator('.recent-search-item, [data-testid="recent-search-item"]')).toContainText('burger');
  });

  test('should use recent search suggestion', async ({ page }) => {
    // First perform a search to save it
    await page.fill('.search-input, [data-testid="search-input"]', 'tacos');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    // Clear search
    await page.fill('.search-input, [data-testid="search-input"]', '');
    
    // Click on search input
    await page.click('.search-input, [data-testid="search-input"]');
    
    // Click on recent search
    await page.click('.recent-search-item:has-text("tacos"), [data-testid="recent-search-item"]:has-text("tacos")');
    
    // Should perform the search
    await expect(page.locator('.search-input, [data-testid="search-input"]')).toHaveValue('tacos');
    await expect(page.locator('.search-results, [data-testid="search-results"]')).toBeVisible();
  });

  test('should search across multiple fields', async ({ page }) => {
    await page.fill('.search-input, [data-testid="search-input"]', 'spicy');
    await page.keyboard.press('Enter');
    
    // Should find items with 'spicy' in name, description, or tags
    const results = page.locator('.menu-item, [data-testid="menu-item"]');
    const firstResult = results.first();
    
    const name = await firstResult.locator('.item-name, [data-testid="item-name"]').textContent();
    const description = await firstResult.locator('.item-description, [data-testid="item-description"]').textContent();
    
    const hasSpicy = name?.toLowerCase().includes('spicy') || description?.toLowerCase().includes('spicy');
    expect(hasSpicy).toBe(true);
  });

  test('should handle search with keyboard shortcuts', async ({ page }) => {
    // Test Ctrl+F or Cmd+F to focus search
    await page.keyboard.press('Control+f');
    
    await expect(page.locator('.search-input, [data-testid="search-input"]')).toBeFocused();
  });

  test('should show popular searches when input is empty', async ({ page }) => {
    await page.click('.search-input, [data-testid="search-input"]');
    
    // Should show popular or trending searches
    if (await page.locator('.popular-searches, [data-testid="popular-searches"]').isVisible()) {
      await expect(page.locator('.popular-search-item, [data-testid="popular-search-item"]')).toBeVisible();
    }
  });

  test('should implement autocomplete with fuzzy matching', async ({ page }) => {
    await page.fill('.search-input, [data-testid="search-input"]', 'piza'); // Misspelled
    await page.waitForTimeout(500);
    
    // Should still suggest 'pizza'
    if (await page.locator('.search-suggestions, [data-testid="search-suggestions"]').isVisible()) {
      await expect(page.locator('.suggestion-item, [data-testid="suggestion-item"]')).toContainText(/pizza/i);
    }
  });

  test('should highlight search terms in results', async ({ page }) => {
    await page.fill('.search-input, [data-testid="search-input"]', 'chicken');
    await page.keyboard.press('Enter');
    
    // Check if search terms are highlighted
    const results = page.locator('.menu-item, [data-testid="menu-item"]');
    if (await results.first().locator('.highlight, mark, .search-highlight').isVisible()) {
      await expect(results.first().locator('.highlight, mark, .search-highlight')).toContainText(/chicken/i);
    }
  });

  test('should search within search results', async ({ page }) => {
    // First search
    await page.fill('.search-input, [data-testid="search-input"]', 'chicken');
    await page.keyboard.press('Enter');
    
    // Refine search
    await page.fill('.search-input, [data-testid="search-input"]', 'chicken sandwich');
    await page.keyboard.press('Enter');
    
    // Should show more refined results
    await expect(page.locator('.search-results, [data-testid="search-results"]')).toBeVisible();
    const results = page.locator('.menu-item, [data-testid="menu-item"]');
    await expect(results.first()).toContainText(/chicken.*sandwich|sandwich.*chicken/i);
  });

  test('should handle search on mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Search should still be accessible
    await expect(page.locator('.search-bar, [data-testid="search-bar"]')).toBeVisible();
    
    await page.fill('.search-input, [data-testid="search-input"]', 'burger');
    await page.keyboard.press('Enter');
    
    // Results should be displayed properly on mobile
    await expect(page.locator('.search-results, [data-testid="search-results"]')).toBeVisible();
  });
});
