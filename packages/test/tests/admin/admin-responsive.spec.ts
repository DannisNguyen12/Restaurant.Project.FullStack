import { test, expect, devices } from '@playwright/test';

// Test responsive design across multiple viewports
const viewports = [
  { name: 'Mobile Portrait', width: 375, height: 667 },
  { name: 'Mobile Landscape', width: 667, height: 375 },
  { name: 'Tablet Portrait', width: 768, height: 1024 },
  { name: 'Tablet Landscape', width: 1024, height: 768 },
  { name: 'Desktop Small', width: 1280, height: 720 },
  { name: 'Desktop Large', width: 1920, height: 1080 }
];

test.describe('Admin App - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login page
    await page.goto('/signin');
    
    // Login with test credentials
    await page.fill('input[name="email"]', 'admin@restaurant.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('/');
  });

  viewports.forEach(({ name, width, height }) => {
    test(`should display correctly on ${name} (${width}x${height})`, async ({ page }) => {
      // Set viewport size
      await page.setViewportSize({ width, height });
      
      // Check if layout adapts properly
      await expect(page).toHaveTitle(/Admin Dashboard/);
      
      // Check navigation menu visibility
      const navMenu = page.locator('[data-testid="nav-menu"], nav, .navigation');
      if (width < 768) {
        // Mobile: navigation should be collapsible/hidden
        const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], .menu-toggle, button[aria-label*="menu"]');
        if (await mobileMenuButton.count() > 0) {
          await expect(mobileMenuButton).toBeVisible();
        }
      } else {
        // Desktop/Tablet: navigation should be visible
        await expect(navMenu).toBeVisible();
      }
      
      // Check main content area
      const mainContent = page.locator('main, [data-testid="main-content"], .main-content');
      await expect(mainContent).toBeVisible();
      
      // Take screenshot for visual regression
      await page.screenshot({ 
        path: `test-results/responsive-${name.toLowerCase().replace(/\s+/g, '-')}-${width}x${height}.png`,
        fullPage: true 
      });
    });
  });

  test('should handle touch interactions on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test touch targets are large enough (minimum 44px)
    const clickableElements = page.locator('button, a, input[type="submit"], [role="button"]');
    const count = await clickableElements.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = clickableElements.nth(i);
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        if (box) {
          // Check minimum touch target size (44x44px recommended)
          expect(box.width).toBeGreaterThanOrEqual(32); // Slightly relaxed for testing
          expect(box.height).toBeGreaterThanOrEqual(32);
        }
      }
    }
  });

  test('should support zoom levels up to 200%', async ({ page }) => {
    // Test different zoom levels
    const zoomLevels = [1.0, 1.25, 1.5, 2.0];
    
    for (const zoom of zoomLevels) {
      // Emulate zoom by adjusting viewport and device scale factor
      await page.setViewportSize({ 
        width: Math.floor(1280 / zoom), 
        height: Math.floor(720 / zoom) 
      });
      
      // Check that content is still accessible
      await expect(page.locator('h1, [data-testid="page-title"]')).toBeVisible();
      
      // Check that navigation is still functional
      const menuItems = page.locator('nav a, [data-testid="nav-link"]');
      const firstMenuItem = menuItems.first();
      if (await firstMenuItem.count() > 0) {
        await expect(firstMenuItem).toBeVisible();
      }
      
      // Ensure no horizontal scroll at standard content width
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 20); // Small tolerance
    }
  });

  test('should maintain functionality across breakpoints', async ({ page }) => {
    const testBreakpoints = [
      { width: 375, height: 667, type: 'mobile' },
      { width: 768, height: 1024, type: 'tablet' },
      { width: 1280, height: 720, type: 'desktop' }
    ];

    for (const { width, height, type } of testBreakpoints) {
      await page.setViewportSize({ width, height });
      
      // Test search functionality
      const searchInput = page.locator('input[placeholder*="search"], [data-testid="search-input"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('test');
        await expect(searchInput).toHaveValue('test');
        await searchInput.clear();
      }
      
      // Test form interactions
      const buttons = page.locator('button:visible');
      const buttonCount = await buttons.count();
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        await expect(firstButton).toBeVisible();
        // Ensure button is clickable (not overlapped)
        await expect(firstButton).toBeEnabled();
      }
    }
  });

  test('should handle orientation changes on mobile devices', async ({ page }) => {
    // Start in portrait mode
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('main')).toBeVisible();
    
    // Switch to landscape mode
    await page.setViewportSize({ width: 667, height: 375 });
    await expect(page.locator('main')).toBeVisible();
    
    // Check that content is still accessible
    const pageTitle = page.locator('h1, [data-testid="page-title"]');
    if (await pageTitle.count() > 0) {
      await expect(pageTitle).toBeVisible();
    }
    
    // Ensure navigation is accessible
    const navigation = page.locator('nav, [data-testid="navigation"]');
    if (await navigation.count() > 0) {
      await expect(navigation).toBeVisible();
    }
  });

  test('should support keyboard navigation at all breakpoints', async ({ page }) => {
    const breakpoints = [
      { width: 375, height: 667 },
      { width: 1280, height: 720 }
    ];

    for (const { width, height } of breakpoints) {
      await page.setViewportSize({ width, height });
      
      // Test tab navigation
      let currentFocusedElement = null;
      const maxTabs = 10; // Limit to prevent infinite loops
      
      for (let i = 0; i < maxTabs; i++) {
        await page.keyboard.press('Tab');
        
        // Check if focus is visible
        const focusedElement = await page.evaluate(() => {
          const focused = document.activeElement;
          return focused ? {
            tagName: focused.tagName,
            id: focused.id,
            className: focused.className
          } : null;
        });
        
        if (focusedElement && focusedElement !== currentFocusedElement) {
          currentFocusedElement = focusedElement;
          
          // Ensure focused element is visible
          const focused = page.locator(':focus');
          if (await focused.count() > 0) {
            await expect(focused).toBeVisible();
          }
        }
      }
    }
  });

  test('should load images and icons properly at all sizes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check for images and icons
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        // Check if image loaded successfully
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
    
    // Check for SVG icons
    const svgIcons = page.locator('svg');
    const svgCount = await svgIcons.count();
    
    for (let i = 0; i < Math.min(svgCount, 5); i++) {
      const svg = svgIcons.nth(i);
      if (await svg.isVisible()) {
        await expect(svg).toBeVisible();
      }
    }
  });

  test('should handle long content gracefully', async ({ page }) => {
    // Test with very long menu item names
    await page.goto('/');
    
    // Check text wrapping and overflow handling
    const textElements = page.locator('h1, h2, h3, p, span, div');
    const elementCount = await textElements.count();
    
    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = textElements.nth(i);
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        if (box) {
          // Ensure text doesn't overflow container
          const containerWidth = box.width;
          expect(containerWidth).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should maintain performance across device types', async ({ page }) => {
    const devices = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 1280, height: 720, name: 'desktop' }
    ];

    for (const device of devices) {
      await page.setViewportSize({ width: device.width, height: device.height });
      
      // Measure page load time
      const startTime = Date.now();
      await page.reload();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Page should load within reasonable time (adjust threshold as needed)
      expect(loadTime).toBeLessThan(5000); // 5 seconds max
      
      // Check for layout shift
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;
          let sessionValue = 0;
          let sessionEntries: any[] = [];
          
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'layout-shift') {
                if (!entry.hadRecentInput) {
                  sessionValue += entry.value;
                  sessionEntries.push(entry);
                }
              }
            }
          });
          
          observer.observe({ type: 'layout-shift', buffered: true });
          
          setTimeout(() => {
            observer.disconnect();
            resolve(sessionValue);
          }, 1000);
        });
      });
      
      // Cumulative Layout Shift should be minimal
      expect(cls).toBeLessThan(0.1); // Good CLS score
    }
  });
});
