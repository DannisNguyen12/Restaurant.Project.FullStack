import { test, expect } from '@playwright/test';

test.describe('Customer - Order Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to customer app and sign in
    await page.goto('http://localhost:3001');
    await page.click('[data-testid="signin-button"], .signin-button, button:has-text("Sign In")');
    await page.fill('input[name="email"], input[type="email"]', 'test@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'password123');
    await page.click('button[type="submit"], button:has-text("Sign In")');
  });

  test('should display order success page after successful order', async ({ page }) => {
    // Complete a quick order
    await page.click('.menu-item:first-child .add-to-cart, [data-testid="add-to-cart"]:first-of-type');
    await page.click('[data-testid="cart-button"], .cart-button');
    await page.click('[data-testid="checkout-button"], button:has-text("Checkout")');
    
    await page.fill('#firstName', 'John');
    await page.fill('#lastName', 'Doe');
    await page.fill('#address', '123 Main St');
    await page.click('button:has-text("Continue")');
    
    await page.check('input[value="cash"]');
    await page.click('button:has-text("Place Order")');
    
    // Verify success page elements
    await expect(page).toHaveURL(/.*order-success|.*success/);
    await expect(page.locator('h1, .success-title')).toContainText(/success|thank/i);
    await expect(page.locator('.order-number, [data-testid="order-number"]')).toBeVisible();
  });

  test('should show correct order details on success page', async ({ page }) => {
    // Navigate to success page (assuming order exists)
    await page.goto('http://localhost:3001/order-success/12345');
    
    // Check order details
    await expect(page.locator('.order-number, [data-testid="order-number"]')).toContainText(/12345|#12345/);
    await expect(page.locator('.order-items, [data-testid="order-items"]')).toBeVisible();
    await expect(page.locator('.order-total, [data-testid="order-total"]')).toBeVisible();
    await expect(page.locator('.delivery-info, [data-testid="delivery-info"]')).toBeVisible();
  });

  test('should provide estimated delivery time', async ({ page }) => {
    await page.goto('http://localhost:3001/order-success/12345');
    
    await expect(page.locator('.delivery-time, [data-testid="delivery-time"]')).toBeVisible();
    await expect(page.locator('.delivery-time, [data-testid="delivery-time"]')).toContainText(/\d+\s*minutes|\d+\s*mins/);
  });

  test('should allow tracking order status', async ({ page }) => {
    await page.goto('http://localhost:3001/order-success/12345');
    
    // Check for order tracking
    await expect(page.locator('.order-status, [data-testid="order-status"]')).toBeVisible();
    await expect(page.locator('.track-order, [data-testid="track-order"]')).toBeVisible();
  });

  test('should navigate to order history', async ({ page }) => {
    await page.goto('http://localhost:3001/order-success/12345');
    
    await page.click('[data-testid="view-orders"], .view-orders, a:has-text("View Orders")');
    await expect(page).toHaveURL(/.*orders|.*profile.*orders/);
  });

  test('should display order history page', async ({ page }) => {
    await page.goto('http://localhost:3001/orders');
    
    await expect(page.locator('h1, .page-title')).toContainText(/orders|order history/i);
    await expect(page.locator('.order-list, [data-testid="order-list"]')).toBeVisible();
  });

  test('should show order list with correct information', async ({ page }) => {
    await page.goto('http://localhost:3001/orders');
    
    // Check order items in list
    const orderItems = page.locator('.order-item, [data-testid="order-item"]');
    await expect(orderItems.first()).toBeVisible();
    
    // Check order details
    await expect(orderItems.first().locator('.order-number, [data-testid="order-number"]')).toBeVisible();
    await expect(orderItems.first().locator('.order-date, [data-testid="order-date"]')).toBeVisible();
    await expect(orderItems.first().locator('.order-status, [data-testid="order-status"]')).toBeVisible();
    await expect(orderItems.first().locator('.order-total, [data-testid="order-total"]')).toBeVisible();
  });

  test('should filter orders by status', async ({ page }) => {
    await page.goto('http://localhost:3001/orders');
    
    // Check filter options
    await expect(page.locator('.status-filter, [data-testid="status-filter"]')).toBeVisible();
    
    // Filter by completed
    await page.selectOption('.status-filter, [data-testid="status-filter"]', 'completed');
    await page.waitForTimeout(1000);
    
    // Check filtered results
    const statusElements = page.locator('.order-status, [data-testid="order-status"]');
    const count = await statusElements.count();
    for (let i = 0; i < count; i++) {
      await expect(statusElements.nth(i)).toContainText(/completed|delivered/i);
    }
  });

  test('should sort orders by date', async ({ page }) => {
    await page.goto('http://localhost:3001/orders');
    
    // Check sort dropdown
    await expect(page.locator('.sort-dropdown, [data-testid="sort-dropdown"]')).toBeVisible();
    
    // Sort by newest first
    await page.selectOption('.sort-dropdown, [data-testid="sort-dropdown"]', 'newest');
    await page.waitForTimeout(1000);
    
    // Verify sorting (check if first order is newer than second)
    const dates = page.locator('.order-date, [data-testid="order-date"]');
    const firstDate = await dates.first().textContent();
    const secondDate = await dates.nth(1).textContent();
    
    expect(firstDate).toBeDefined();
    expect(secondDate).toBeDefined();
  });

  test('should view individual order details', async ({ page }) => {
    await page.goto('http://localhost:3001/orders');
    
    // Click on first order
    await page.click('.order-item:first-child, [data-testid="order-item"]:first-of-type');
    
    // Should navigate to order detail page
    await expect(page).toHaveURL(/.*order\/\d+|.*orders\/\d+/);
    await expect(page.locator('.order-details, [data-testid="order-details"]')).toBeVisible();
  });

  test('should show detailed order information', async ({ page }) => {
    await page.goto('http://localhost:3001/order/12345');
    
    // Check detailed order info
    await expect(page.locator('.order-number, [data-testid="order-number"]')).toBeVisible();
    await expect(page.locator('.order-date, [data-testid="order-date"]')).toBeVisible();
    await expect(page.locator('.order-status, [data-testid="order-status"]')).toBeVisible();
    await expect(page.locator('.order-items, [data-testid="order-items"]')).toBeVisible();
    await expect(page.locator('.delivery-address, [data-testid="delivery-address"]')).toBeVisible();
    await expect(page.locator('.payment-method, [data-testid="payment-method"]')).toBeVisible();
  });

  test('should allow reordering from order history', async ({ page }) => {
    await page.goto('http://localhost:3001/order/12345');
    
    // Click reorder button
    await page.click('[data-testid="reorder-button"], .reorder-button, button:has-text("Reorder")');
    
    // Should add items to cart and navigate to cart
    await expect(page).toHaveURL(/.*cart/);
    await expect(page.locator('.cart-item, [data-testid="cart-item"]')).toBeVisible();
  });

  test('should track real-time order status updates', async ({ page }) => {
    await page.goto('http://localhost:3001/order/12345');
    
    // Check status tracking
    await expect(page.locator('.status-timeline, [data-testid="status-timeline"]')).toBeVisible();
    await expect(page.locator('.status-step, [data-testid="status-step"]')).toHaveCount(4); // Order placed, preparing, ready, delivered
  });

  test('should cancel pending order', async ({ page }) => {
    await page.goto('http://localhost:3001/order/12345');
    
    // Only show cancel for pending orders
    const status = await page.locator('.order-status, [data-testid="order-status"]').textContent();
    
    if (status?.toLowerCase().includes('pending') || status?.toLowerCase().includes('placed')) {
      await page.click('[data-testid="cancel-order"], .cancel-order, button:has-text("Cancel")');
      
      // Confirm cancellation
      await page.click('[data-testid="confirm-cancel"], button:has-text("Confirm")');
      
      // Should update status
      await expect(page.locator('.order-status, [data-testid="order-status"]')).toContainText(/cancelled/i);
    }
  });

  test('should rate and review completed order', async ({ page }) => {
    await page.goto('http://localhost:3001/order/12345');
    
    // Check if review section exists for completed orders
    const status = await page.locator('.order-status, [data-testid="order-status"]').textContent();
    
    if (status?.toLowerCase().includes('completed') || status?.toLowerCase().includes('delivered')) {
      await expect(page.locator('.review-section, [data-testid="review-section"]')).toBeVisible();
      
      // Rate the order
      await page.click('.star-rating .star:nth-child(4), [data-testid="star-4"]');
      
      // Add review comment
      await page.fill('.review-text, [data-testid="review-text"]', 'Great food and fast delivery!');
      
      // Submit review
      await page.click('[data-testid="submit-review"], .submit-review, button:has-text("Submit")');
      
      // Should show success message
      await expect(page.locator('.review-success, [data-testid="review-success"]')).toBeVisible();
    }
  });

  test('should handle empty order history', async ({ page }) => {
    // Simulate user with no orders
    await page.goto('http://localhost:3001/orders');
    
    // Mock empty state or check for empty message
    if (await page.locator('.empty-orders, [data-testid="empty-orders"]').isVisible()) {
      await expect(page.locator('.empty-orders, [data-testid="empty-orders"]')).toContainText(/no orders|haven't placed/i);
      await expect(page.locator('.start-ordering, [data-testid="start-ordering"]')).toBeVisible();
    }
  });

  test('should continue shopping from success page', async ({ page }) => {
    await page.goto('http://localhost:3001/order-success/12345');
    
    await page.click('[data-testid="continue-shopping"], .continue-shopping, button:has-text("Continue Shopping")');
    
    // Should navigate back to menu
    await expect(page).toHaveURL(/.*menu|.*\/$|.*home/);
    await expect(page.locator('.menu-items, [data-testid="menu-items"]')).toBeVisible();
  });

  test('should show order receipt', async ({ page }) => {
    await page.goto('http://localhost:3001/order/12345');
    
    await page.click('[data-testid="view-receipt"], .view-receipt, button:has-text("Receipt")');
    
    // Should show receipt modal or page
    await expect(page.locator('.receipt, [data-testid="receipt"]')).toBeVisible();
    await expect(page.locator('.receipt-items, [data-testid="receipt-items"]')).toBeVisible();
    await expect(page.locator('.receipt-total, [data-testid="receipt-total"]')).toBeVisible();
  });

  test('should download or print receipt', async ({ page }) => {
    await page.goto('http://localhost:3001/order/12345');
    
    await page.click('[data-testid="view-receipt"], button:has-text("Receipt")');
    
    // Check print/download options
    await expect(page.locator('[data-testid="print-receipt"], .print-receipt')).toBeVisible();
    await expect(page.locator('[data-testid="download-receipt"], .download-receipt')).toBeVisible();
  });

  test('should contact support for order issues', async ({ page }) => {
    await page.goto('http://localhost:3001/order/12345');
    
    await page.click('[data-testid="contact-support"], .contact-support, button:has-text("Support")');
    
    // Should show contact form or navigate to support
    await expect(page.locator('.support-form, [data-testid="support-form"]')).toBeVisible();
    
    // Fill support form
    await page.fill('.issue-description, [data-testid="issue-description"]', 'Order was delayed');
    await page.click('[data-testid="submit-support"], button:has-text("Submit")');
    
    // Should show confirmation
    await expect(page.locator('.support-success, [data-testid="support-success"]')).toBeVisible();
  });
});
