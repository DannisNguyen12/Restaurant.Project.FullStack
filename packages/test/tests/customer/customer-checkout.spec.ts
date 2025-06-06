import { test, expect } from '@playwright/test';

test.describe('Customer - Checkout Process', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to customer app and add items to cart
    await page.goto('http://localhost:3001');
    
    // Sign in first
    await page.click('[data-testid="signin-button"], .signin-button, button:has-text("Sign In")');
    await page.fill('input[name="email"], input[type="email"]', 'test@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'password123');
    await page.click('button[type="submit"], button:has-text("Sign In")');
    
    // Add items to cart
    await page.click('.menu-item:first-child .add-to-cart, [data-testid="add-to-cart"]:first-of-type');
    await page.waitForTimeout(1000);
  });

  test('should navigate to checkout with items in cart', async ({ page }) => {
    await page.click('[data-testid="cart-button"], .cart-button, button:has-text("Cart")');
    await expect(page.locator('.cart-item, [data-testid="cart-item"]')).toBeVisible();
    
    await page.click('[data-testid="checkout-button"], .checkout-button, button:has-text("Checkout")');
    await expect(page).toHaveURL(/.*checkout/);
    await expect(page.locator('h1, h2, .checkout-title')).toContainText(/checkout/i);
  });

  test('should display order summary in checkout', async ({ page }) => {
    await page.goto('http://localhost:3001/checkout');
    
    // Check order summary section
    await expect(page.locator('.order-summary, [data-testid="order-summary"]')).toBeVisible();
    await expect(page.locator('.order-item, [data-testid="order-item"]')).toBeVisible();
    
    // Check totals
    await expect(page.locator('.subtotal, [data-testid="subtotal"]')).toBeVisible();
    await expect(page.locator('.total, [data-testid="total"]')).toBeVisible();
  });

  test('should validate delivery information form', async ({ page }) => {
    await page.goto('http://localhost:3001/checkout');
    
    // Try to proceed without filling required fields
    await page.click('[data-testid="continue-button"], .continue-button, button:has-text("Continue")');
    
    // Check for validation errors
    await expect(page.locator('.error, .validation-error, [data-testid="error"]')).toBeVisible();
  });

  test('should fill and submit delivery information', async ({ page }) => {
    await page.goto('http://localhost:3001/checkout');
    
    // Fill delivery form
    await page.fill('input[name="firstName"], input[placeholder*="First"], #firstName', 'John');
    await page.fill('input[name="lastName"], input[placeholder*="Last"], #lastName', 'Doe');
    await page.fill('input[name="phone"], input[placeholder*="Phone"], #phone', '1234567890');
    await page.fill('input[name="address"], input[placeholder*="Address"], #address', '123 Main St');
    await page.fill('input[name="city"], input[placeholder*="City"], #city', 'New York');
    await page.fill('input[name="zipCode"], input[placeholder*="Zip"], #zipCode', '10001');
    
    // Submit form
    await page.click('[data-testid="continue-button"], .continue-button, button:has-text("Continue")');
    
    // Should proceed to payment
    await expect(page).toHaveURL(/.*payment|.*checkout.*step=2/);
  });

  test('should display payment options', async ({ page }) => {
    await page.goto('http://localhost:3001/checkout');
    
    // Fill required delivery info quickly
    await page.fill('input[name="firstName"], #firstName', 'John');
    await page.fill('input[name="lastName"], #lastName', 'Doe');
    await page.fill('input[name="address"], #address', '123 Main St');
    await page.click('[data-testid="continue-button"], button:has-text("Continue")');
    
    // Check payment options
    await expect(page.locator('[data-testid="payment-method"], .payment-method')).toBeVisible();
    await expect(page.locator('input[type="radio"][value="card"], input[value="credit"]')).toBeVisible();
    await expect(page.locator('input[type="radio"][value="cash"], input[value="cash"]')).toBeVisible();
  });

  test('should validate credit card information', async ({ page }) => {
    await page.goto('http://localhost:3001/payment');
    
    // Select credit card payment
    await page.check('input[type="radio"][value="card"], input[value="credit"]');
    
    // Try to submit without card details
    await page.click('[data-testid="place-order"], .place-order, button:has-text("Place Order")');
    
    // Check for validation errors
    await expect(page.locator('.error, .validation-error')).toBeVisible();
  });

  test('should complete credit card payment flow', async ({ page }) => {
    await page.goto('http://localhost:3001/payment');
    
    // Select and fill credit card
    await page.check('input[type="radio"][value="card"], input[value="credit"]');
    await page.fill('input[name="cardNumber"], #cardNumber', '4111111111111111');
    await page.fill('input[name="expiryDate"], #expiryDate', '12/25');
    await page.fill('input[name="cvv"], #cvv', '123');
    await page.fill('input[name="cardholderName"], #cardholderName', 'John Doe');
    
    // Place order
    await page.click('[data-testid="place-order"], .place-order, button:has-text("Place Order")');
    
    // Should redirect to success page
    await expect(page).toHaveURL(/.*order-success|.*success/);
  });

  test('should complete cash payment flow', async ({ page }) => {
    await page.goto('http://localhost:3001/payment');
    
    // Select cash payment
    await page.check('input[type="radio"][value="cash"], input[value="cash"]');
    
    // Place order
    await page.click('[data-testid="place-order"], .place-order, button:has-text("Place Order")');
    
    // Should redirect to success page
    await expect(page).toHaveURL(/.*order-success|.*success/);
  });

  test('should show order confirmation details', async ({ page }) => {
    // Complete a quick order
    await page.goto('http://localhost:3001/checkout');
    await page.fill('#firstName', 'John');
    await page.fill('#lastName', 'Doe');
    await page.fill('#address', '123 Main St');
    await page.click('button:has-text("Continue")');
    
    await page.check('input[value="cash"]');
    await page.click('button:has-text("Place Order")');
    
    // Check success page
    await expect(page.locator('.success-message, [data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('.order-number, [data-testid="order-number"]')).toBeVisible();
    await expect(page.locator('.order-details, [data-testid="order-details"]')).toBeVisible();
  });

  test('should handle checkout with empty cart', async ({ page }) => {
    // Clear cart first
    await page.click('[data-testid="cart-button"], .cart-button');
    await page.click('[data-testid="clear-cart"], .clear-cart, button:has-text("Clear")');
    
    // Try to access checkout
    await page.goto('http://localhost:3001/checkout');
    
    // Should redirect or show empty cart message
    await expect(page.locator('.empty-cart, [data-testid="empty-cart"]')).toBeVisible();
  });

  test('should calculate correct totals with tax', async ({ page }) => {
    await page.goto('http://localhost:3001/checkout');
    
    // Check that totals are calculated correctly
    const subtotal = await page.locator('[data-testid="subtotal"], .subtotal').textContent();
    const tax = await page.locator('[data-testid="tax"], .tax').textContent();
    const total = await page.locator('[data-testid="total"], .total').textContent();
    
    expect(subtotal).toMatch(/\$\d+\.\d{2}/);
    expect(tax).toMatch(/\$\d+\.\d{2}/);
    expect(total).toMatch(/\$\d+\.\d{2}/);
  });

  test('should update totals when items are modified', async ({ page }) => {
    await page.goto('http://localhost:3001/checkout');
    
    const initialTotal = await page.locator('[data-testid="total"], .total').textContent();
    
    // Modify quantity in checkout
    await page.click('[data-testid="increase-quantity"], .quantity-increase, button:has-text("+")');
    
    // Wait for total to update
    await page.waitForTimeout(1000);
    const newTotal = await page.locator('[data-testid="total"], .total').textContent();
    
    expect(newTotal).not.toBe(initialTotal);
  });

  test('should save order in order history', async ({ page }) => {
    // Complete order
    await page.goto('http://localhost:3001/checkout');
    await page.fill('#firstName', 'John');
    await page.fill('#lastName', 'Doe');
    await page.fill('#address', '123 Main St');
    await page.click('button:has-text("Continue")');
    await page.check('input[value="cash"]');
    await page.click('button:has-text("Place Order")');
    
    // Navigate to profile/orders
    await page.click('[data-testid="profile-menu"], .profile-menu, button:has-text("Profile")');
    await page.click('[data-testid="orders-link"], .orders-link, a:has-text("Orders")');
    
    // Check if order appears in history
    await expect(page.locator('.order-item, [data-testid="order-item"]')).toBeVisible();
  });

  test('should handle payment processing errors', async ({ page }) => {
    await page.goto('http://localhost:3001/payment');
    
    // Use invalid card number
    await page.check('input[value="card"]');
    await page.fill('#cardNumber', '4000000000000002'); // Declined card
    await page.fill('#expiryDate', '12/25');
    await page.fill('#cvv', '123');
    await page.fill('#cardholderName', 'John Doe');
    
    await page.click('button:has-text("Place Order")');
    
    // Should show error message
    await expect(page.locator('.error, .payment-error, [data-testid="payment-error"]')).toBeVisible();
  });

  test('should allow editing delivery info from payment page', async ({ page }) => {
    await page.goto('http://localhost:3001/payment');
    
    // Click edit delivery info
    await page.click('[data-testid="edit-delivery"], .edit-delivery, button:has-text("Edit")');
    
    // Should go back to checkout
    await expect(page).toHaveURL(/.*checkout/);
    await expect(page.locator('input[name="firstName"], #firstName')).toBeVisible();
  });
});
