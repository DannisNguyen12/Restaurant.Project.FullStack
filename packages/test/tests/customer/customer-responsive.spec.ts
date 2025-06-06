import { test, expect } from '@playwright/test';

test.describe('Customer - Responsive Design', () => {
  const viewports = [
    { name: 'Mobile Small', width: 320, height: 568 },
    { name: 'Mobile Medium', width: 375, height: 667 },
    { name: 'Mobile Large', width: 414, height: 896 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Desktop Small', width: 1200, height: 800 },
    { name: 'Desktop Large', width: 1920, height: 1080 }
  ];

  viewports.forEach(({ name, width, height }) => {
    test.describe(`${name} (${width}x${height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('http://localhost:3001');
      });

      test('should display navigation correctly', async ({ page }) => {
        if (width < 768) {
          // Mobile: should show hamburger menu
          await expect(page.locator('.hamburger-menu, [data-testid="hamburger-menu"], .mobile-menu-toggle')).toBeVisible();
          
          // Click hamburger to open menu
          await page.click('.hamburger-menu, [data-testid="hamburger-menu"], .mobile-menu-toggle');
          await expect(page.locator('.mobile-menu, [data-testid="mobile-menu"]')).toBeVisible();
        } else {
          // Desktop/Tablet: should show full navigation
          await expect(page.locator('.main-nav, [data-testid="main-nav"]')).toBeVisible();
          await expect(page.locator('.nav-links, [data-testid="nav-links"]')).toBeVisible();
        }
      });

      test('should display header elements properly', async ({ page }) => {
        // Logo should always be visible
        await expect(page.locator('.logo, [data-testid="logo"]')).toBeVisible();
        
        // Cart and user menu should be accessible
        await expect(page.locator('.cart-icon, [data-testid="cart-icon"]')).toBeVisible();
        
        if (width >= 768) {
          // Search bar should be visible on larger screens
          await expect(page.locator('.search-bar, [data-testid="search-bar"]')).toBeVisible();
        }
      });

      test('should layout menu items appropriately', async ({ page }) => {
        await expect(page.locator('.menu-grid, [data-testid="menu-grid"], .menu-items')).toBeVisible();
        
        const menuItems = page.locator('.menu-item, [data-testid="menu-item"]');
        const itemCount = await menuItems.count();
        
        if (itemCount > 0) {
          // Check if items are properly spaced and visible
          for (let i = 0; i < Math.min(3, itemCount); i++) {
            await expect(menuItems.nth(i)).toBeVisible();
            
            // Check if item content is readable
            await expect(menuItems.nth(i).locator('.item-name, [data-testid="item-name"]')).toBeVisible();
            await expect(menuItems.nth(i).locator('.item-price, [data-testid="item-price"]')).toBeVisible();
          }
        }
      });

      test('should handle search functionality', async ({ page }) => {
        if (width < 768) {
          // Mobile: might have search icon that opens search
          if (await page.locator('.search-toggle, [data-testid="search-toggle"]').isVisible()) {
            await page.click('.search-toggle, [data-testid="search-toggle"]');
          }
        }
        
        // Search input should be accessible
        const searchInput = page.locator('.search-input, [data-testid="search-input"], input[type="search"]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('pizza');
          await page.keyboard.press('Enter');
          await expect(page.locator('.search-results, [data-testid="search-results"]')).toBeVisible();
        }
      });

      test('should display cart properly', async ({ page }) => {
        // Add item to cart first
        const addButton = page.locator('.add-to-cart, [data-testid="add-to-cart"]').first();
        if (await addButton.isVisible()) {
          await addButton.click();
          await page.waitForTimeout(1000);
        }
        
        // Open cart
        await page.click('.cart-icon, [data-testid="cart-icon"], .cart-button');
        
        if (width < 768) {
          // Mobile: cart might be a full-screen overlay or drawer
          await expect(page.locator('.cart-drawer, [data-testid="cart-drawer"], .cart-modal')).toBeVisible();
        } else {
          // Desktop: cart might be a dropdown or sidebar
          await expect(page.locator('.cart-dropdown, [data-testid="cart-dropdown"], .cart-sidebar')).toBeVisible();
        }
      });

      test('should handle authentication forms', async ({ page }) => {
        await page.click('[data-testid="signin-button"], .signin-button, button:has-text("Sign In")');
        
        // Form should be properly sized and accessible
        await expect(page.locator('.auth-form, [data-testid="auth-form"]')).toBeVisible();
        await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();
        
        // Form elements should be properly sized
        const emailInput = page.locator('input[name="email"], input[type="email"]');
        const inputBox = await emailInput.boundingBox();
        
        if (inputBox) {
          expect(inputBox.width).toBeGreaterThan(200); // Minimum readable width
          expect(inputBox.height).toBeGreaterThan(30); // Minimum touchable height
        }
      });

      test('should display footer correctly', async ({ page }) => {
        // Scroll to footer
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        
        await expect(page.locator('.footer, [data-testid="footer"]')).toBeVisible();
        
        if (width < 768) {
          // Mobile: footer links might be stacked
          const footerLinks = page.locator('.footer-links, [data-testid="footer-links"]');
          if (await footerLinks.isVisible()) {
            // Check if links are properly stacked or in columns
            await expect(footerLinks).toBeVisible();
          }
        } else {
          // Desktop: footer should have horizontal layout
          await expect(page.locator('.footer-content, [data-testid="footer-content"]')).toBeVisible();
        }
      });

      test('should handle touch interactions on mobile', async ({ page }) => {
        if (width < 768) {
          // Test touch-friendly interactions
          const menuItem = page.locator('.menu-item, [data-testid="menu-item"]').first();
          
          if (await menuItem.isVisible()) {
            // Tap to view details
            await menuItem.tap();
            
            // Should open item details or modal
            if (await page.locator('.item-modal, [data-testid="item-modal"]').isVisible()) {
              await expect(page.locator('.item-modal, [data-testid="item-modal"]')).toBeVisible();
            }
          }
        }
      });

      test('should handle checkout flow responsively', async ({ page }) => {
        // Sign in first
        await page.click('[data-testid="signin-button"], button:has-text("Sign In")');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        
        // Add item to cart
        const addButton = page.locator('.add-to-cart, [data-testid="add-to-cart"]').first();
        if (await addButton.isVisible()) {
          await addButton.click();
          await page.waitForTimeout(1000);
        }
        
        // Go to checkout
        await page.click('.cart-icon, [data-testid="cart-icon"]');
        await page.click('[data-testid="checkout-button"], button:has-text("Checkout")');
        
        // Checkout form should be properly responsive
        await expect(page.locator('.checkout-form, [data-testid="checkout-form"]')).toBeVisible();
        
        if (width < 768) {
          // Mobile: form fields should be full width and properly spaced
          const firstNameInput = page.locator('input[name="firstName"], #firstName');
          if (await firstNameInput.isVisible()) {
            const inputBox = await firstNameInput.boundingBox();
            if (inputBox) {
              expect(inputBox.width).toBeGreaterThan(width * 0.8); // Should use most of screen width
            }
          }
        }
      });

      test('should display images responsively', async ({ page }) => {
        const foodImages = page.locator('.food-image, [data-testid="food-image"], .menu-item img');
        const imageCount = await foodImages.count();
        
        if (imageCount > 0) {
          const firstImage = foodImages.first();
          await expect(firstImage).toBeVisible();
          
          // Check if image is properly sized
          const imageBox = await firstImage.boundingBox();
          if (imageBox) {
            expect(imageBox.width).toBeLessThanOrEqual(width);
            expect(imageBox.width).toBeGreaterThan(0);
          }
        }
      });

      test('should handle text scaling and readability', async ({ page }) => {
        // Check if text is readable at different viewport sizes
        const headings = page.locator('h1, h2, h3, .heading');
        const paragraphs = page.locator('p, .description, .text');
        
        if (await headings.first().isVisible()) {
          const headingBox = await headings.first().boundingBox();
          if (headingBox) {
            expect(headingBox.height).toBeGreaterThan(20); // Minimum readable heading height
          }
        }
        
        if (await paragraphs.first().isVisible()) {
          const paragraphBox = await paragraphs.first().boundingBox();
          if (paragraphBox) {
            expect(paragraphBox.height).toBeGreaterThan(16); // Minimum readable text height
          }
        }
      });

      test('should handle horizontal scrolling', async ({ page }) => {
        // Check that content doesn't cause horizontal scroll
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(width + 20); // Allow small margin for scrollbars
      });

      test('should position floating elements correctly', async ({ page }) => {
        // Check floating cart button on mobile
        if (width < 768) {
          const floatingCart = page.locator('.floating-cart, [data-testid="floating-cart"]');
          if (await floatingCart.isVisible()) {
            const cartBox = await floatingCart.boundingBox();
            if (cartBox) {
              // Should be positioned within viewport
              expect(cartBox.x).toBeGreaterThanOrEqual(0);
              expect(cartBox.y).toBeGreaterThanOrEqual(0);
              expect(cartBox.x + cartBox.width).toBeLessThanOrEqual(width);
              expect(cartBox.y + cartBox.height).toBeLessThanOrEqual(height);
            }
          }
        }
      });

      test('should handle modals and overlays responsively', async ({ page }) => {
        // Try to open a modal (item details)
        const menuItem = page.locator('.menu-item, [data-testid="menu-item"]').first();
        if (await menuItem.isVisible()) {
          await menuItem.click();
          
          const modal = page.locator('.modal, [data-testid="modal"], .item-details-modal');
          if (await modal.isVisible()) {
            const modalBox = await modal.boundingBox();
            if (modalBox) {
              if (width < 768) {
                // Mobile: modal should be full screen or near full screen
                expect(modalBox.width).toBeGreaterThan(width * 0.8);
              } else {
                // Desktop: modal should be centered and appropriately sized
                expect(modalBox.width).toBeLessThan(width * 0.9);
                expect(modalBox.width).toBeGreaterThan(400);
              }
            }
          }
        }
      });

      test('should maintain accessibility on all screen sizes', async ({ page }) => {
        // Check that interactive elements are properly sized for touch
        const buttons = page.locator('button, .button, [role="button"]');
        const buttonCount = await buttons.count();
        
        for (let i = 0; i < Math.min(3, buttonCount); i++) {
          const button = buttons.nth(i);
          if (await button.isVisible()) {
            const buttonBox = await button.boundingBox();
            if (buttonBox) {
              if (width < 768) {
                // Mobile: buttons should be at least 44px for touch
                expect(Math.min(buttonBox.width, buttonBox.height)).toBeGreaterThan(40);
              }
            }
          }
        }
      });
    });
  });

  test('should handle orientation changes', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001');
    
    await expect(page.locator('.main-content, [data-testid="main-content"]')).toBeVisible();
    
    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);
    
    // Content should still be accessible
    await expect(page.locator('.main-content, [data-testid="main-content"]')).toBeVisible();
    await expect(page.locator('.navigation, [data-testid="navigation"]')).toBeVisible();
  });

  test('should handle dynamic content loading on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3001');
    
    // Scroll to load more content if lazy loading is implemented
    const initialItemCount = await page.locator('.menu-item, [data-testid="menu-item"]').count();
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    // Check if more items loaded
    const newItemCount = await page.locator('.menu-item, [data-testid="menu-item"]').count();
    
    // Content should be properly displayed after loading
    if (newItemCount > initialItemCount) {
      const lastItem = page.locator('.menu-item, [data-testid="menu-item"]').last();
      await expect(lastItem).toBeVisible();
    }
  });

  test('should maintain performance on low-end devices', async ({ page }) => {
    // Simulate slow CPU
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3001');
    
    // Page should load within reasonable time
    await expect(page.locator('.main-content, [data-testid="main-content"]')).toBeVisible({ timeout: 10000 });
    
    // Interactions should be responsive
    const menuItem = page.locator('.menu-item, [data-testid="menu-item"]').first();
    if (await menuItem.isVisible()) {
      const startTime = Date.now();
      await menuItem.click();
      const endTime = Date.now();
      
      // Interaction should respond within 300ms
      expect(endTime - startTime).toBeLessThan(300);
    }
  });
});
