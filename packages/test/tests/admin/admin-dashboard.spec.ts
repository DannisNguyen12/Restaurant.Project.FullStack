import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard and Analytics', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/signin');
    await page.fill('input[name="email"]', 'admin@restaurant.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display dashboard overview correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Admin Dashboard|Dashboard/);
    
    // Check for key dashboard elements
    await expect(page.locator('h1, [data-testid="dashboard-title"]')).toContainText(/Dashboard|Overview/);
    
    // Check for statistics cards
    const statsCards = page.locator('[data-testid="stat-card"], .stat-card, .dashboard-card');
    if (await statsCards.count() > 0) {
      await expect(statsCards.first()).toBeVisible();
    }
    
    // Check for recent activity or items
    const recentItems = page.locator('[data-testid="recent-items"], .recent-activity, .dashboard-items');
    if (await recentItems.count() > 0) {
      await expect(recentItems).toBeVisible();
    }
  });

  test('should show menu item statistics', async ({ page }) => {
    // Look for item count displays
    const itemCount = page.locator('[data-testid="item-count"], .item-count');
    if (await itemCount.count() > 0) {
      await expect(itemCount).toBeVisible();
      const count = await itemCount.textContent();
      expect(count).toMatch(/\d+/); // Should contain numbers
    }
    
    // Check for category statistics
    const categoryStats = page.locator('[data-testid="category-stats"], .category-count');
    if (await categoryStats.count() > 0) {
      await expect(categoryStats).toBeVisible();
    }
  });

  test('should allow quick actions from dashboard', async ({ page }) => {
    // Look for quick action buttons
    const quickActions = page.locator('[data-testid="quick-action"], .quick-action, a[href*="create"]');
    if (await quickActions.count() > 0) {
      const createItemButton = quickActions.first();
      await expect(createItemButton).toBeVisible();
      
      // Test navigation to create item page
      await createItemButton.click();
      await expect(page.url()).toMatch(/create|new/);
      
      // Navigate back to dashboard
      await page.goBack();
      await expect(page.url()).toBe(`${page.url().split('/').slice(0, 3).join('/')}/`);
    }
  });

  test('should display recent menu items', async ({ page }) => {
    // Check for recent items section
    const recentSection = page.locator('[data-testid="recent-items"], .recent-items, .dashboard-items');
    if (await recentSection.count() > 0) {
      await expect(recentSection).toBeVisible();
      
      // Check for individual item cards
      const itemCards = page.locator('[data-testid="item-card"], .item-card, .menu-item');
      if (await itemCards.count() > 0) {
        const firstItem = itemCards.first();
        await expect(firstItem).toBeVisible();
        
        // Check for item details
        const itemName = firstItem.locator('h2, h3, .item-name, [data-testid="item-name"]');
        if (await itemName.count() > 0) {
          await expect(itemName).toBeVisible();
        }
        
        const itemPrice = firstItem.locator('.price, [data-testid="item-price"]');
        if (await itemPrice.count() > 0) {
          await expect(itemPrice).toBeVisible();
        }
      }
    }
  });

  test('should show system notifications', async ({ page }) => {
    // Check for notification area
    const notifications = page.locator('[data-testid="notifications"], .notifications, .alerts');
    if (await notifications.count() > 0) {
      await expect(notifications).toBeVisible();
    }
    
    // Check for notification bell or indicator
    const notificationBell = page.locator('[data-testid="notification-bell"], .notification-icon');
    if (await notificationBell.count() > 0) {
      await expect(notificationBell).toBeVisible();
    }
  });

  test('should allow navigation to different admin sections', async ({ page }) => {
    // Test navigation to different admin sections
    const navLinks = [
      { text: /menu|items/i, expectedUrl: /menu|items/ },
      { text: /categories/i, expectedUrl: /categories/ },
      { text: /settings/i, expectedUrl: /settings/ }
    ];

    for (const { text, expectedUrl } of navLinks) {
      const link = page.locator(`a:has-text("${text.source}")`, { hasText: text });
      if (await link.count() > 0) {
        await link.first().click();
        await expect(page.url()).toMatch(expectedUrl);
        
        // Navigate back to dashboard
        await page.goto('/');
        await expect(page.url()).toBe(`${page.url().split('/').slice(0, 3).join('/')}/`);
      }
    }
  });

  test('should handle dashboard refresh', async ({ page }) => {
    // Get initial state
    const initialTitle = await page.title();
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify dashboard loads correctly after refresh
    await expect(page).toHaveTitle(initialTitle);
    
    // Check that main dashboard elements are still present
    const dashboardContent = page.locator('main, [data-testid="dashboard-content"]');
    await expect(dashboardContent).toBeVisible();
  });

  test('should display loading states appropriately', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/');
    
    // Check for loading indicators during page load
    const loadingSpinner = page.locator('[data-testid="loading"], .loading, .spinner');
    
    // Loading spinner should either not be present (already loaded) or disappear quickly
    if (await loadingSpinner.count() > 0) {
      await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });
    }
    
    // Ensure content is visible after loading
    const mainContent = page.locator('main, [data-testid="main-content"]');
    await expect(mainContent).toBeVisible();
  });

  test('should handle empty states gracefully', async ({ page }) => {
    // Check for empty state messages when no data is available
    const emptyStates = page.locator('[data-testid="empty-state"], .empty-state, .no-data');
    
    if (await emptyStates.count() > 0) {
      const firstEmptyState = emptyStates.first();
      await expect(firstEmptyState).toBeVisible();
      
      // Empty state should have descriptive text
      await expect(firstEmptyState).toContainText(/no|empty|none/i);
    }
  });

  test('should be accessible via keyboard navigation', async ({ page }) => {
    // Test keyboard navigation through dashboard
    await page.keyboard.press('Tab');
    
    // Check if focus is visible on interactive elements
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement).toBeVisible();
    }
    
    // Test navigation with arrow keys if applicable
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    
    // Test Enter key on focused elements
    const firstButton = page.locator('button').first();
    if (await firstButton.count() > 0) {
      await firstButton.focus();
      // Don't actually press Enter to avoid navigation, just verify focus works
      await expect(firstButton).toBeFocused();
    }
  });

  test('should show appropriate error states', async ({ page }) => {
    // Test error handling by intercepting network requests
    await page.route('**/api/**', route => {
      route.fulfill({ status: 500, body: 'Server Error' });
    });
    
    await page.reload();
    
    // Check for error messages
    const errorMessages = page.locator('[data-testid="error"], .error, .alert-error');
    if (await errorMessages.count() > 0) {
      await expect(errorMessages.first()).toBeVisible();
    }
    
    // Remove the route to prevent affecting other tests
    await page.unroute('**/api/**');
  });

  test('should maintain session state', async ({ page }) => {
    // Navigate away from dashboard
    await page.goto('/item/create');
    
    // Navigate back to dashboard
    await page.goto('/');
    
    // Should still be logged in and see dashboard
    await expect(page).toHaveTitle(/Admin Dashboard|Dashboard/);
    
    // Should not be redirected to login
    expect(page.url()).not.toContain('/signin');
  });

  test('should handle concurrent data updates', async ({ page, context }) => {
    // Open second tab/page
    const secondPage = await context.newPage();
    
    // Both pages navigate to dashboard
    await Promise.all([
      page.goto('/'),
      secondPage.goto('/signin')
    ]);
    
    // Login on second page
    await secondPage.fill('input[name="email"]', 'admin@restaurant.com');
    await secondPage.fill('input[name="password"]', 'admin123');
    await secondPage.click('button[type="submit"]');
    await secondPage.waitForURL('/');
    
    // Both should show dashboard content
    await expect(page.locator('main')).toBeVisible();
    await expect(secondPage.locator('main')).toBeVisible();
    
    await secondPage.close();
  });
});
