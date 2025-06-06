import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
  });

  test('should display login form when not authenticated', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Admin Login');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should login with valid admin credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@restaurant.test');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@restaurant.test');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'admin@restaurant.test');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Logout
    await page.click('button:has-text("Logout")');
    await expect(page.locator('h1')).toContainText('Admin Login');
  });
});

test.describe('Menu Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
    
    // Login as admin
    await page.fill('input[type="email"]', 'admin@restaurant.test');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Navigate to menu management
    await page.click('a[href="/menu"]');
  });

  test('should display menu items', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Menu Management');
    await expect(page.locator('[data-testid="menu-items"]')).toBeVisible();
  });

  test('should add new menu item', async ({ page }) => {
    await page.click('button:has-text("Add Item")');
    
    await page.fill('input[name="name"]', 'Test Burger');
    await page.fill('textarea[name="description"]', 'A delicious test burger');
    await page.fill('input[name="price"]', '12.99');
    await page.selectOption('select[name="categoryId"]', { label: 'Main Course' });
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Test Burger')).toBeVisible();
    await expect(page.locator('text=$12.99')).toBeVisible();
  });

  test('should edit existing menu item', async ({ page }) => {
    // Click edit on first item
    await page.click('[data-testid="edit-item"]:first-child');
    
    await page.fill('input[name="name"]', 'Updated Burger');
    await page.fill('input[name="price"]', '15.99');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Updated Burger')).toBeVisible();
    await expect(page.locator('text=$15.99')).toBeVisible();
  });

  test('should delete menu item', async ({ page }) => {
    const itemName = await page.locator('[data-testid="item-name"]:first-child').textContent();
    
    await page.click('[data-testid="delete-item"]:first-child');
    await page.click('button:has-text("Confirm")'); // Confirm deletion
    
    await expect(page.locator(`text=${itemName}`)).not.toBeVisible();
  });

  test('should search menu items', async ({ page }) => {
    await page.fill('input[placeholder="Search items..."]', 'burger');
    
    // Check that only burger items are visible
    const items = page.locator('[data-testid="menu-item"]');
    const itemCount = await items.count();
    
    for (let i = 0; i < itemCount; i++) {
      const itemText = await items.nth(i).textContent();
      expect(itemText?.toLowerCase()).toContain('burger');
    }
  });

  test('should filter by category', async ({ page }) => {
    await page.selectOption('select[name="categoryFilter"]', { label: 'Appetizers' });
    
    // Check that only appetizer items are visible
    const items = page.locator('[data-testid="menu-item"]');
    const itemCount = await items.count();
    
    for (let i = 0; i < itemCount; i++) {
      const category = await items.nth(i).locator('[data-testid="item-category"]').textContent();
      expect(category).toBe('Appetizers');
    }
  });

  test('should toggle item availability', async ({ page }) => {
    const availabilityToggle = page.locator('[data-testid="availability-toggle"]:first-child');
    const initialState = await availabilityToggle.isChecked();
    
    await availabilityToggle.click();
    
    const newState = await availabilityToggle.isChecked();
    expect(newState).toBe(!initialState);
  });
});

test.describe('Category Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
    
    // Login as admin
    await page.fill('input[type="email"]', 'admin@restaurant.test');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Navigate to categories
    await page.click('a[href="/categories"]');
  });

  test('should display categories', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Categories');
    await expect(page.locator('[data-testid="categories-list"]')).toBeVisible();
  });

  test('should add new category', async ({ page }) => {
    await page.click('button:has-text("Add Category")');
    
    await page.fill('input[name="name"]', 'Test Category');
    await page.fill('textarea[name="description"]', 'A test category');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Test Category')).toBeVisible();
  });

  test('should edit category', async ({ page }) => {
    await page.click('[data-testid="edit-category"]:first-child');
    
    await page.fill('input[name="name"]', 'Updated Category');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Updated Category')).toBeVisible();
  });

  test('should delete category', async ({ page }) => {
    const categoryName = await page.locator('[data-testid="category-name"]:first-child').textContent();
    
    await page.click('[data-testid="delete-category"]:first-child');
    await page.click('button:has-text("Confirm")');
    
    await expect(page.locator(`text=${categoryName}`)).not.toBeVisible();
  });
});

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
    
    // Login as admin
    await page.fill('input[type="email"]', 'admin@restaurant.test');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should display dashboard metrics', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    await expect(page.locator('[data-testid="total-items"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-categories"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();
  });

  test('should navigate to different sections', async ({ page }) => {
    await page.click('a[href="/menu"]');
    await expect(page.locator('h1')).toContainText('Menu Management');
    
    await page.click('a[href="/categories"]');
    await expect(page.locator('h1')).toContainText('Categories');
    
    await page.click('a[href="/dashboard"]');
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3002');
    
    // Login
    await page.fill('input[type="email"]', 'admin@restaurant.test');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
  });

  test('should work on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3002');
    
    // Login
    await page.fill('input[type="email"]', 'admin@restaurant.test');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  });
});
