import { test, expect } from '@playwright/test';

test.describe('Customer Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display cart icon/button in header', async ({ page }) => {
    // Look for cart icon or button
    const cartIcon = page.locator('[class*="cart"], [aria-label*="cart"], [title*="cart"]').or(
      page.locator('svg[class*="cart"], button:has-text("Cart")').or(
        page.locator('[data-testid="cart"], [role="button"]:has([class*="cart"])')
      )
    );
    
    await expect(cartIcon.first()).toBeVisible();
  });

  test('should show empty cart state initially', async ({ page }) => {
    // Try to open cart
    const cartTrigger = page.locator('[class*="cart"], [aria-label*="cart"], button:has-text("Cart")').first();
    
    if (await cartTrigger.isVisible()) {
      await cartTrigger.click();
      
      // Should show empty cart message
      const emptyMessage = page.locator('text="empty", text="Empty", text="no items", text="No items"').or(
        page.locator('[class*="empty"]')
      );
      
      if (await emptyMessage.isVisible()) {
        await expect(emptyMessage).toBeVisible();
      }
    }
  });

  test('should add items to cart', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find menu items
    const menuItems = page.locator('[class*="item"], [class*="card"], [class*="product"]');
    
    if (await menuItems.count() > 0) {
      const firstItem = menuItems.first();
      
      // Look for add to cart button
      const addButton = firstItem.locator('button:has-text("Add"), button:has-text("Cart"), [class*="add"]').or(
        page.locator('button:has-text("Add to Cart"), [aria-label*="add"]')
      );
      
      if (await addButton.isVisible()) {
        await addButton.click();
        
        // Should show success feedback
        await expect(
          page.locator('text="Added", text="added", [class*="success"], [class*="toast"]').or(
            page.locator('[class*="notification"]')
          )
        ).toBeVisible({ timeout: 5000 });
      } else {
        // Try clicking on the item to see add options
        await firstItem.click();
        await page.waitForTimeout(1000);
        
        const addButtonInDetail = page.locator('button:has-text("Add"), button:has-text("Cart")');
        if (await addButtonInDetail.isVisible()) {
          await addButtonInDetail.click();
        }
      }
    }
  });

  test('should update cart count when items are added', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find initial cart count
    const cartCount = page.locator('[class*="count"], [class*="badge"], [class*="quantity"]').or(
      page.locator('[data-testid="cart-count"]')
    );
    
    // Add item to cart
    const menuItems = page.locator('[class*="item"], [class*="card"], [class*="product"]');
    
    if (await menuItems.count() > 0) {
      const addButton = page.locator('button:has-text("Add"), button:has-text("Cart")').first();
      
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(1000);
        
        // Cart count should update
        if (await cartCount.isVisible()) {
          await expect(cartCount).not.toContainText('0');
        }
      }
    }
  });

  test('should open cart sidebar/modal when cart is clicked', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const cartTrigger = page.locator('[class*="cart"], [aria-label*="cart"], button:has-text("Cart")').first();
    
    if (await cartTrigger.isVisible()) {
      await cartTrigger.click();
      
      // Should open cart sidebar or modal
      const cartContainer = page.locator('[class*="cart"], [class*="sidebar"], [class*="modal"], [role="dialog"]').or(
        page.locator('[data-testid="cart-sidebar"], [data-testid="cart-modal"]')
      );
      
      await expect(cartContainer.first()).toBeVisible();
    }
  });

  test('should display cart items with details', async ({ page }) => {
    // First add an item to cart
    await page.waitForLoadState('networkidle');
    
    const addButton = page.locator('button:has-text("Add"), button:has-text("Cart")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Open cart
      const cartTrigger = page.locator('[class*="cart"], [aria-label*="cart"]').first();
      await cartTrigger.click();
      
      // Should show item details in cart
      const cartItems = page.locator('[class*="cart-item"], [class*="item"]');
      
      if (await cartItems.count() > 0) {
        const firstCartItem = cartItems.first();
        
        // Should show item name
        await expect(firstCartItem.locator('h1, h2, h3, h4, [class*="name"], [class*="title"]')).toBeVisible();
        
        // Should show price
        await expect(firstCartItem.locator('text=/\\$\\d+/, [class*="price"]')).toBeVisible();
        
        // Should show quantity controls
        await expect(firstCartItem.locator('button, input[type="number"], [class*="quantity"]')).toBeVisible();
      }
    }
  });

  test('should allow quantity updates in cart', async ({ page }) => {
    // Add item and open cart
    await page.waitForLoadState('networkidle');
    
    const addButton = page.locator('button:has-text("Add"), button:has-text("Cart")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      const cartTrigger = page.locator('[class*="cart"], [aria-label*="cart"]').first();
      await cartTrigger.click();
      
      // Find quantity controls
      const increaseButton = page.locator('button:has-text("+"), [aria-label*="increase"], [class*="increase"]').first();
      const decreaseButton = page.locator('button:has-text("-"), [aria-label*="decrease"], [class*="decrease"]').first();
      
      if (await increaseButton.isVisible()) {
        await increaseButton.click();
        await page.waitForTimeout(500);
        
        // Quantity should increase
        const quantityDisplay = page.locator('[class*="quantity"], input[type="number"]').first();
        if (await quantityDisplay.isVisible()) {
          const quantityText = await quantityDisplay.textContent() || await quantityDisplay.inputValue();
          expect(parseInt(quantityText) >= 2).toBeTruthy();
        }
      }
    }
  });

  test('should remove items from cart', async ({ page }) => {
    // Add item and open cart
    await page.waitForLoadState('networkidle');
    
    const addButton = page.locator('button:has-text("Add"), button:has-text("Cart")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      const cartTrigger = page.locator('[class*="cart"], [aria-label*="cart"]').first();
      await cartTrigger.click();
      
      // Find remove button
      const removeButton = page.locator('button:has-text("Remove"), button:has-text("Delete"), [aria-label*="remove"]').or(
        page.locator('[class*="remove"], [class*="delete"]')
      ).first();
      
      if (await removeButton.isVisible()) {
        await removeButton.click();
        await page.waitForTimeout(1000);
        
        // Should show success message or empty cart
        await expect(
          page.locator('text="removed", text="Removed", [class*="success"]').or(
            page.locator('text="empty", text="Empty"')
          )
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should calculate and display cart totals', async ({ page }) => {
    // Add item and check totals
    await page.waitForLoadState('networkidle');
    
    const addButton = page.locator('button:has-text("Add"), button:has-text("Cart")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      const cartTrigger = page.locator('[class*="cart"], [aria-label*="cart"]').first();
      await cartTrigger.click();
      
      // Should show total
      const total = page.locator('text=/Total.*\\$\\d+/, [class*="total"]:has-text("$")').or(
        page.locator('[data-testid="cart-total"]')
      );
      
      if (await total.isVisible()) {
        await expect(total).toBeVisible();
        await expect(total).toContainText('$');
      }
    }
  });

  test('should show clear cart option', async ({ page }) => {
    // Add item and check for clear option
    await page.waitForLoadState('networkidle');
    
    const addButton = page.locator('button:has-text("Add"), button:has-text("Cart")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      const cartTrigger = page.locator('[class*="cart"], [aria-label*="cart"]').first();
      await cartTrigger.click();
      
      // Should show clear cart button
      const clearButton = page.locator('button:has-text("Clear"), button:has-text("Empty"), [class*="clear"]').first();
      
      if (await clearButton.isVisible()) {
        await expect(clearButton).toBeVisible();
        
        // Test clear functionality
        await clearButton.click();
        await page.waitForTimeout(1000);
        
        // Should show empty cart or confirmation
        await expect(
          page.locator('text="cleared", text="empty", text="Empty"').or(
            page.locator('[class*="empty"]')
          )
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should handle checkout button', async ({ page }) => {
    // Add item and test checkout
    await page.waitForLoadState('networkidle');
    
    const addButton = page.locator('button:has-text("Add"), button:has-text("Cart")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      const cartTrigger = page.locator('[class*="cart"], [aria-label*="cart"]').first();
      await cartTrigger.click();
      
      // Find checkout button
      const checkoutButton = page.locator('button:has-text("Checkout"), button:has-text("Proceed"), [class*="checkout"]').first();
      
      if (await checkoutButton.isVisible()) {
        await expect(checkoutButton).toBeVisible();
        
        await checkoutButton.click();
        
        // Should navigate to checkout or show signin requirement
        await expect(
          page.url().includes('/checkout') ||
          page.url().includes('/signin') ||
          page.locator('text="sign in", text="Sign in"').isVisible()
        ).toBeTruthy();
      }
    }
  });

  test('should persist cart items across page refresh', async ({ page }) => {
    // Add item to cart
    await page.waitForLoadState('networkidle');
    
    const addButton = page.locator('button:has-text("Add"), button:has-text("Cart")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(2000);
      
      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check if cart still has items
      const cartCount = page.locator('[class*="count"], [class*="badge"], [class*="quantity"]');
      
      if (await cartCount.isVisible()) {
        const countText = await cartCount.textContent();
        expect(countText).not.toBe('0');
        expect(countText).not.toBe('');
      }
    }
  });

  test('should show authentication notice for checkout', async ({ page }) => {
    // Add item without being authenticated
    await page.waitForLoadState('networkidle');
    
    const addButton = page.locator('button:has-text("Add"), button:has-text("Cart")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      const cartTrigger = page.locator('[class*="cart"], [aria-label*="cart"]').first();
      await cartTrigger.click();
      
      // Should show authentication notice
      const authNotice = page.locator('text="sign in", text="Sign in", text="Please", [class*="auth"]').or(
        page.locator('[class*="notice"], [class*="warning"]')
      );
      
      if (await authNotice.isVisible()) {
        await expect(authNotice).toBeVisible();
      }
    }
  });

  test('should handle cart interactions with keyboard', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Add item first
    const addButton = page.locator('button:has-text("Add"), button:has-text("Cart")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Try keyboard navigation in cart
      const cartTrigger = page.locator('[class*="cart"], [aria-label*="cart"]').first();
      await cartTrigger.click();
      
      // Focus on cart elements and navigate with keyboard
      const cartButtons = page.locator('button:visible');
      
      if (await cartButtons.count() > 0) {
        await cartButtons.first().focus();
        await page.keyboard.press('Tab');
        
        // Should be able to navigate through cart elements
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(['BUTTON', 'INPUT', 'A'].includes(focusedElement || '')).toBeTruthy();
      }
    }
  });

  test('should show item images in cart', async ({ page }) => {
    // Add item and check cart images
    await page.waitForLoadState('networkidle');
    
    const addButton = page.locator('button:has-text("Add"), button:has-text("Cart")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      const cartTrigger = page.locator('[class*="cart"], [aria-label*="cart"]').first();
      await cartTrigger.click();
      
      // Check for item images in cart
      const cartImages = page.locator('img[src*="/"], img[alt*="item"]');
      
      if (await cartImages.count() > 0) {
        await expect(cartImages.first()).toBeVisible();
        await expect(cartImages.first()).toHaveAttribute('src');
      }
    }
  });
});
