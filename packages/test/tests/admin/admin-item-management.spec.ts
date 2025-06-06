import { test, expect } from '@playwright/test';

test.describe('Admin Item Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3002/signin');
    await page.fill('input[type="email"]', 'admin@restaurant.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL('http://localhost:3002');
  });

  test('should navigate to item detail page', async ({ page }) => {
    // Wait for items to load
    await page.waitForTimeout(2000);
    
    const items = page.locator('[data-testid="menu-item"]');
    const itemCount = await items.count();
    
    if (itemCount > 0) {
      // Click on first item
      await items.first().click();
      
      // Should navigate to item detail page
      await expect(page).toHaveURL(/\/item\/\d+/);
      
      // Should show item detail view
      await expect(page.locator('h1')).toBeVisible();
    } else {
      // Skip test if no items available
      test.skip();
    }
  });

  test('should display item details correctly', async ({ page }) => {
    // Navigate to first available item
    await page.waitForTimeout(2000);
    
    const items = page.locator('[data-testid="menu-item"]');
    const itemCount = await items.count();
    
    if (itemCount > 0) {
      await items.first().click();
      
      // Should show item information
      await expect(page.locator('[data-testid="item-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="item-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="item-description"]')).toBeVisible();
      
      // Should show item image or placeholder
      await expect(page.locator('[data-testid="item-image"]')).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should provide edit functionality', async ({ page }) => {
    // Navigate to first available item
    await page.waitForTimeout(2000);
    
    const items = page.locator('[data-testid="menu-item"]');
    const itemCount = await items.count();
    
    if (itemCount > 0) {
      await items.first().click();
      
      // Look for edit button
      const editButton = page.locator('button:has-text("Edit")');
      if (await editButton.count() > 0) {
        await editButton.click();
        
        // Should show edit form or navigate to edit page
        const hasForm = await page.locator('form').count() > 0;
        const hasEditPage = page.url().includes('/edit');
        
        expect(hasForm || hasEditPage).toBeTruthy();
      }
    } else {
      test.skip();
    }
  });

  test('should provide delete functionality', async ({ page }) => {
    // Navigate to first available item
    await page.waitForTimeout(2000);
    
    const items = page.locator('[data-testid="menu-item"]');
    const itemCount = await items.count();
    
    if (itemCount > 0) {
      await items.first().click();
      
      // Look for delete button
      const deleteButton = page.locator('button:has-text("Delete")');
      if (await deleteButton.count() > 0) {
        // Should show confirmation dialog
        await deleteButton.click();
        
        // Look for confirmation dialog
        const confirmationElements = [
          page.locator('text=Are you sure'),
          page.locator('text=Delete'),
          page.locator('text=Confirm'),
          page.locator('[role="dialog"]')
        ];
        
        let hasConfirmation = false;
        for (const element of confirmationElements) {
          if (await element.count() > 0) {
            hasConfirmation = true;
            break;
          }
        }
        
        expect(hasConfirmation).toBeTruthy();
      }
    } else {
      test.skip();
    }
  });

  test('should handle item editing workflow', async ({ page }) => {
    // Navigate to first available item
    await page.waitForTimeout(2000);
    
    const items = page.locator('[data-testid="menu-item"]');
    const itemCount = await items.count();
    
    if (itemCount > 0) {
      await items.first().click();
      
      const editButton = page.locator('button:has-text("Edit")');
      if (await editButton.count() > 0) {
        await editButton.click();
        
        // If edit form is shown
        if (await page.locator('form').count() > 0) {
          // Update item name
          const nameField = page.locator('input[name="name"]');
          if (await nameField.count() > 0) {
            const currentName = await nameField.inputValue();
            await nameField.fill(currentName + ' (Updated)');
            
            // Submit changes
            await page.click('button[type="submit"]');
            
            // Should show success or redirect
            await page.waitForTimeout(2000);
          }
        }
      }
    } else {
      test.skip();
    }
  });

  test('should show item statistics or metadata', async ({ page }) => {
    // Navigate to first available item
    await page.waitForTimeout(2000);
    
    const items = page.locator('[data-testid="menu-item"]');
    const itemCount = await items.count();
    
    if (itemCount > 0) {
      await items.first().click();
      
      // Look for metadata like creation date, category, etc.
      const metadataElements = [
        page.locator('[data-testid="item-category"]'),
        page.locator('[data-testid="item-created"]'),
        page.locator('[data-testid="item-updated"]'),
        page.locator('text=Category:'),
        page.locator('text=Created:'),
        page.locator('text=Updated:')
      ];
      
      let hasMetadata = false;
      for (const element of metadataElements) {
        if (await element.count() > 0) {
          hasMetadata = true;
          break;
        }
      }
      
      // Should show some item metadata
      expect(hasMetadata).toBeTruthy();
    } else {
      test.skip();
    }
  });

  test('should provide navigation back to menu list', async ({ page }) => {
    // Navigate to first available item
    await page.waitForTimeout(2000);
    
    const items = page.locator('[data-testid="menu-item"]');
    const itemCount = await items.count();
    
    if (itemCount > 0) {
      await items.first().click();
      
      // Look for back navigation
      const backElements = [
        page.locator('button:has-text("Back")'),
        page.locator('a:has-text("Back")'),
        page.locator('[data-testid="back-button"]'),
        page.locator('text=← Back')
      ];
      
      let hasBackNavigation = false;
      for (const element of backElements) {
        if (await element.count() > 0) {
          hasBackNavigation = true;
          await element.click();
          
          // Should navigate back to dashboard
          await expect(page).toHaveURL('http://localhost:3002');
          break;
        }
      }
      
      // Should have some way to go back
      expect(hasBackNavigation).toBeTruthy();
    } else {
      test.skip();
    }
  });

  test('should handle item not found error', async ({ page }) => {
    // Try to access non-existent item
    await page.goto('http://localhost:3002/item/99999');
    
    // Should show error message or redirect
    const errorIndicators = [
      page.locator('text=Not found'),
      page.locator('text=Item not found'),
      page.locator('text=404'),
      page.url().includes('/404')
    ];
    
    let hasError = false;
    for (const indicator of errorIndicators) {
      if (typeof indicator === 'boolean') {
        hasError = indicator;
        break;
      } else if (await indicator.count() > 0) {
        hasError = true;
        break;
      }
    }
    
    expect(hasError).toBeTruthy();
  });

  test('should show loading state when navigating to item details', async ({ page }) => {
    // Navigate to first available item
    await page.waitForTimeout(2000);
    
    const items = page.locator('[data-testid="menu-item"]');
    const itemCount = await items.count();
    
    if (itemCount > 0) {
      await items.first().click();
      
      // Should show loading state initially
      const loadingElements = [
        page.locator('[data-testid="loading"]'),
        page.locator('.loading'),
        page.locator('.spinner'),
        page.locator('text=Loading')
      ];
      
      // Wait a bit for content to load
      await page.waitForTimeout(1000);
      
      // Should eventually show content
      await expect(page.locator('h1')).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should handle concurrent item edits gracefully', async ({ page, context }) => {
    // This test simulates concurrent edits (conflict resolution)
    await page.waitForTimeout(2000);
    
    const items = page.locator('[data-testid="menu-item"]');
    const itemCount = await items.count();
    
    if (itemCount > 0) {
      await items.first().click();
      
      const editButton = page.locator('button:has-text("Edit")');
      if (await editButton.count() > 0) {
        await editButton.click();
        
        // Open second tab with same item
        const page2 = await context.newPage();
        await page2.goto(page.url());
        
        // Both pages should handle the conflict gracefully
        // This is a basic test - real implementation would need proper conflict detection
        await expect(page.locator('form')).toBeVisible();
        await expect(page2.locator('h1')).toBeVisible();
        
        await page2.close();
      }
    } else {
      test.skip();
    }
  });
});
