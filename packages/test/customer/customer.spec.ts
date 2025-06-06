import { test, expect } from '@playwright/test';

test.describe('Customer Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('should allow access to public pages without authentication', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Welcome to Our Restaurant');
    await expect(page.locator('[data-testid="menu-items"]')).toBeVisible();
  });

  test('should show login form when accessing profile', async ({ page }) => {
    await page.click('a[href="/profile"]');
    await expect(page.locator('h1')).toContainText('Login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should login with valid customer credentials', async ({ page }) => {
    await page.click('a[href="/auth/signin"]');
    
    await page.fill('input[type="email"]', 'user@restaurant.test');
    await page.fill('input[type="password"]', 'user123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to home
    await page.waitForURL('**/');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should register new customer account', async ({ page }) => {
    await page.click('a[href="/auth/signup"]');
    
    await page.fill('input[name="name"]', 'Test Customer');
    await page.fill('input[type="email"]', 'testcustomer@restaurant.test');
    await page.fill('input[type="password"]', 'testpass123');
    await page.fill('input[name="confirmPassword"]', 'testpass123');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Account created successfully')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.click('a[href="/auth/signin"]');
    await page.fill('input[type="email"]', 'user@restaurant.test');
    await page.fill('input[type="password"]', 'user123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('button:has-text("Sign Out")');
    
    await expect(page.locator('a[href="/auth/signin"]')).toBeVisible();
  });
});

test.describe('Menu Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('should display menu items', async ({ page }) => {
    await expect(page.locator('[data-testid="menu-items"]')).toBeVisible();
    await expect(page.locator('[data-testid="menu-item"]')).toHaveCount.greaterThan(0);
  });

  test('should show item details', async ({ page }) => {
    await page.click('[data-testid="menu-item"]:first-child');
    
    await expect(page.locator('[data-testid="item-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="item-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="item-price"]')).toBeVisible();
    await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible();
  });

  test('should filter by category', async ({ page }) => {
    await page.click('[data-testid="category-filter"]:has-text("Appetizers")');
    
    const items = page.locator('[data-testid="menu-item"]');
    const itemCount = await items.count();
    
    for (let i = 0; i < itemCount; i++) {
      const category = await items.nth(i).locator('[data-testid="item-category"]').textContent();
      expect(category).toBe('Appetizers');
    }
  });

  test('should search menu items', async ({ page }) => {
    await page.fill('input[placeholder="Search menu..."]', 'pizza');
    
    const items = page.locator('[data-testid="menu-item"]');
    const itemCount = await items.count();
    
    for (let i = 0; i < itemCount; i++) {
      const itemText = await items.nth(i).textContent();
      expect(itemText?.toLowerCase()).toContain('pizza');
    }
  });

  test('should show no results for invalid search', async ({ page }) => {
    await page.fill('input[placeholder="Search menu..."]', 'invalidfooditem123');
    
    await expect(page.locator('text=No items found')).toBeVisible();
  });
});

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('should add item to cart', async ({ page }) => {
    await page.click('[data-testid="menu-item"]:first-child button:has-text("Add to Cart")');
    
    // Check cart counter
    await expect(page.locator('[data-testid="cart-counter"]')).toContainText('1');
    
    // Check cart sidebar
    await page.click('[data-testid="cart-button"]');
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  });

  test('should update item quantity in cart', async ({ page }) => {
    // Add item to cart
    await page.click('[data-testid="menu-item"]:first-child button:has-text("Add to Cart")');
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Increase quantity
    await page.click('[data-testid="increase-quantity"]');
    await expect(page.locator('[data-testid="item-quantity"]')).toContainText('2');
    
    // Decrease quantity
    await page.click('[data-testid="decrease-quantity"]');
    await expect(page.locator('[data-testid="item-quantity"]')).toContainText('1');
  });

  test('should remove item from cart', async ({ page }) => {
    // Add item to cart
    await page.click('[data-testid="menu-item"]:first-child button:has-text("Add to Cart")');
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Remove item
    await page.click('[data-testid="remove-item"]');
    
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
    await expect(page.locator('[data-testid="cart-counter"]')).toContainText('0');
  });

  test('should calculate total correctly', async ({ page }) => {
    // Add multiple items
    await page.click('[data-testid="menu-item"]:first-child button:has-text("Add to Cart")');
    await page.click('[data-testid="menu-item"]:nth-child(2) button:has-text("Add to Cart")');
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Check that total is calculated
    await expect(page.locator('[data-testid="cart-total"]')).toBeVisible();
    
    const total = await page.locator('[data-testid="cart-total"]').textContent();
    expect(total).toMatch(/\$\d+\.\d{2}/);
  });

  test('should persist cart across page reloads', async ({ page }) => {
    // Add item to cart
    await page.click('[data-testid="menu-item"]:first-child button:has-text("Add to Cart")');
    
    // Reload page
    await page.reload();
    
    // Check cart persists
    await expect(page.locator('[data-testid="cart-counter"]')).toContainText('1');
  });
});

test.describe('Checkout Process', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Login as customer
    await page.click('a[href="/auth/signin"]');
    await page.fill('input[type="email"]', 'user@restaurant.test');
    await page.fill('input[type="password"]', 'user123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
    
    // Add item to cart
    await page.click('[data-testid="menu-item"]:first-child button:has-text("Add to Cart")');
  });

  test('should require authentication for checkout', async ({ page }) => {
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('button:has-text("Sign Out")');
    
    // Try to checkout
    await page.click('[data-testid="cart-button"]');
    await page.click('button:has-text("Checkout")');
    
    await expect(page.locator('h1')).toContainText('Login');
  });

  test('should proceed to checkout when authenticated', async ({ page }) => {
    await page.click('[data-testid="cart-button"]');
    await page.click('button:has-text("Checkout")');
    
    await page.waitForURL('**/checkout');
    await expect(page.locator('h1')).toContainText('Checkout');
  });

  test('should complete order with valid information', async ({ page }) => {
    await page.click('[data-testid="cart-button"]');
    await page.click('button:has-text("Checkout")');
    await page.waitForURL('**/checkout');
    
    // Fill delivery information
    await page.fill('input[name="address"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="zipCode"]', '12345');
    await page.fill('input[name="phone"]', '555-0123');
    
    // Fill payment information (mock)
    await page.fill('input[name="cardNumber"]', '4242424242424242');
    await page.fill('input[name="expiryDate"]', '12/25');
    await page.fill('input[name="cvv"]', '123');
    
    await page.click('button[type="submit"]:has-text("Place Order")');
    
    await page.waitForURL('**/order-confirmation');
    await expect(page.locator('h1')).toContainText('Order Confirmed');
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  });

  test('should show validation errors for incomplete information', async ({ page }) => {
    await page.click('[data-testid="cart-button"]');
    await page.click('button:has-text("Checkout")');
    await page.waitForURL('**/checkout');
    
    // Submit without filling required fields
    await page.click('button[type="submit"]:has-text("Place Order")');
    
    await expect(page.locator('text=Address is required')).toBeVisible();
    await expect(page.locator('text=Phone number is required')).toBeVisible();
  });
});

test.describe('Order History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Login as customer
    await page.click('a[href="/auth/signin"]');
    await page.fill('input[type="email"]', 'user@restaurant.test');
    await page.fill('input[type="password"]', 'user123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
  });

  test('should display order history', async ({ page }) => {
    await page.click('a[href="/orders"]');
    
    await expect(page.locator('h1')).toContainText('Order History');
    await expect(page.locator('[data-testid="order-list"]')).toBeVisible();
  });

  test('should show order details', async ({ page }) => {
    await page.click('a[href="/orders"]');
    
    // Click on first order
    await page.click('[data-testid="order-item"]:first-child');
    
    await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-total"]')).toBeVisible();
  });

  test('should show empty state when no orders', async ({ page }) => {
    // This would need a test user with no orders
    await page.goto('http://localhost:3001/orders');
    
    // Assuming new user with no orders
    await expect(page.locator('text=No orders found')).toBeVisible();
  });
});

test.describe('User Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Login as customer
    await page.click('a[href="/auth/signin"]');
    await page.fill('input[type="email"]', 'user@restaurant.test');
    await page.fill('input[type="password"]', 'user123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
  });

  test('should display user profile', async ({ page }) => {
    await page.click('a[href="/profile"]');
    
    await expect(page.locator('h1')).toContainText('Profile');
    await expect(page.locator('input[name="name"]')).toHaveValue('Test User');
    await expect(page.locator('input[name="email"]')).toHaveValue('user@restaurant.test');
  });

  test('should update profile information', async ({ page }) => {
    await page.click('a[href="/profile"]');
    
    await page.fill('input[name="name"]', 'Updated Test User');
    await page.fill('input[name="phone"]', '555-0123');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
  });

  test('should change password', async ({ page }) => {
    await page.click('a[href="/profile"]');
    
    await page.fill('input[name="currentPassword"]', 'user123');
    await page.fill('input[name="newPassword"]', 'newpassword123');
    await page.fill('input[name="confirmPassword"]', 'newpassword123');
    
    await page.click('button:has-text("Change Password")');
    
    await expect(page.locator('text=Password changed successfully')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001');
    
    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    
    // Check cart on mobile
    await page.click('[data-testid="menu-item"]:first-child button:has-text("Add to Cart")');
    await page.click('[data-testid="cart-button"]');
    await expect(page.locator('[data-testid="mobile-cart"]')).toBeVisible();
  });

  test('should work on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3001');
    
    await expect(page.locator('[data-testid="menu-items"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar-cart"]')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load homepage quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
  });

  test('should handle many items in cart', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Add multiple items to cart
    const menuItems = page.locator('[data-testid="menu-item"] button:has-text("Add to Cart")');
    const count = await menuItems.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      await menuItems.nth(i).click();
    }
    
    // Open cart and check it still responds quickly
    const startTime = Date.now();
    await page.click('[data-testid="cart-button"]');
    await page.waitForSelector('[data-testid="cart-item"]');
    const responseTime = Date.now() - startTime;
    
    expect(responseTime).toBeLessThan(1000); // Should respond in under 1 second
  });
});
