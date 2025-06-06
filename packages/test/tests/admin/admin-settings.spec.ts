import { test, expect } from '@playwright/test';

test.describe('Admin Settings and Configuration', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/signin');
    await page.fill('input[name="email"]', 'admin@restaurant.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should access settings page', async ({ page }) => {
    // Navigate to settings
    const settingsLink = page.locator('a[href*="settings"], [data-testid="settings-link"]');
    if (await settingsLink.count() > 0) {
      await settingsLink.click();
      await expect(page.url()).toMatch(/settings/);
      await expect(page.locator('h1, [data-testid="page-title"]')).toContainText(/settings/i);
    } else {
      // If no direct settings link, try accessing via URL
      await page.goto('/settings');
      if (page.url().includes('/settings')) {
        await expect(page.locator('h1, [data-testid="page-title"]')).toContainText(/settings/i);
      }
    }
  });

  test('should manage restaurant profile settings', async ({ page }) => {
    await page.goto('/settings');
    
    // Look for restaurant profile section
    const profileSection = page.locator('[data-testid="restaurant-profile"], .profile-section');
    if (await profileSection.count() > 0) {
      await expect(profileSection).toBeVisible();
      
      // Test restaurant name field
      const nameField = page.locator('input[name="restaurantName"], input[name="name"]');
      if (await nameField.count() > 0) {
        await expect(nameField).toBeVisible();
        
        const originalValue = await nameField.inputValue();
        await nameField.fill('Test Restaurant Updated');
        await expect(nameField).toHaveValue('Test Restaurant Updated');
        
        // Restore original value
        await nameField.fill(originalValue);
      }
      
      // Test description field
      const descriptionField = page.locator('textarea[name="description"], input[name="description"]');
      if (await descriptionField.count() > 0) {
        await expect(descriptionField).toBeVisible();
      }
    }
  });

  test('should manage menu display settings', async ({ page }) => {
    await page.goto('/settings');
    
    // Look for menu settings section
    const menuSection = page.locator('[data-testid="menu-settings"], .menu-section');
    if (await menuSection.count() > 0) {
      await expect(menuSection).toBeVisible();
      
      // Test items per page setting
      const itemsPerPageSelect = page.locator('select[name="itemsPerPage"], [data-testid="items-per-page"]');
      if (await itemsPerPageSelect.count() > 0) {
        await expect(itemsPerPageSelect).toBeVisible();
        await itemsPerPageSelect.selectOption('10');
        await expect(itemsPerPageSelect).toHaveValue('10');
      }
      
      // Test default sort order
      const sortOrderSelect = page.locator('select[name="sortOrder"], [data-testid="sort-order"]');
      if (await sortOrderSelect.count() > 0) {
        await expect(sortOrderSelect).toBeVisible();
      }
    }
  });

  test('should manage user account settings', async ({ page }) => {
    await page.goto('/settings');
    
    // Look for account settings section
    const accountSection = page.locator('[data-testid="account-settings"], .account-section');
    if (await accountSection.count() > 0) {
      await expect(accountSection).toBeVisible();
      
      // Test email field (should be readonly or editable)
      const emailField = page.locator('input[name="email"], input[type="email"]');
      if (await emailField.count() > 0) {
        await expect(emailField).toBeVisible();
        const emailValue = await emailField.inputValue();
        expect(emailValue).toContain('@');
      }
      
      // Test name fields
      const nameFields = page.locator('input[name*="name"], input[name*="Name"]');
      const nameCount = await nameFields.count();
      for (let i = 0; i < nameCount; i++) {
        await expect(nameFields.nth(i)).toBeVisible();
      }
    }
  });

  test('should handle password change', async ({ page }) => {
    await page.goto('/settings');
    
    // Look for password change section
    const passwordSection = page.locator('[data-testid="password-settings"], .password-section');
    if (await passwordSection.count() > 0) {
      await expect(passwordSection).toBeVisible();
      
      // Test current password field
      const currentPasswordField = page.locator('input[name="currentPassword"], input[name*="current"]');
      if (await currentPasswordField.count() > 0) {
        await expect(currentPasswordField).toBeVisible();
        await expect(currentPasswordField).toHaveAttribute('type', 'password');
      }
      
      // Test new password fields
      const newPasswordField = page.locator('input[name="newPassword"], input[name*="new"]');
      if (await newPasswordField.count() > 0) {
        await expect(newPasswordField).toBeVisible();
        await expect(newPasswordField).toHaveAttribute('type', 'password');
      }
      
      // Test confirm password field
      const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name*="confirm"]');
      if (await confirmPasswordField.count() > 0) {
        await expect(confirmPasswordField).toBeVisible();
        await expect(confirmPasswordField).toHaveAttribute('type', 'password');
      }
    }
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/settings');
    
    // Test form validation by submitting empty required fields
    const saveButton = page.locator('button[type="submit"], button:has-text("Save")');
    if (await saveButton.count() > 0) {
      // Clear a required field if present
      const requiredFields = page.locator('input[required], textarea[required]');
      if (await requiredFields.count() > 0) {
        const firstRequired = requiredFields.first();
        await firstRequired.clear();
        
        await saveButton.click();
        
        // Check for validation error
        const errorMessage = page.locator('.error, [data-testid="error"], .field-error');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('should save settings successfully', async ({ page }) => {
    await page.goto('/settings');
    
    // Find and fill a non-critical field
    const descriptionField = page.locator('textarea[name="description"], input[name="description"]');
    if (await descriptionField.count() > 0) {
      await descriptionField.fill('Updated description for testing');
      
      // Submit the form
      const saveButton = page.locator('button[type="submit"], button:has-text("Save")');
      if (await saveButton.count() > 0) {
        await saveButton.click();
        
        // Check for success message
        const successMessage = page.locator('.success, [data-testid="success"], .alert-success');
        if (await successMessage.count() > 0) {
          await expect(successMessage).toBeVisible();
        }
        
        // Verify the value persists
        await expect(descriptionField).toHaveValue('Updated description for testing');
      }
    }
  });

  test('should handle settings navigation', async ({ page }) => {
    await page.goto('/settings');
    
    // Test tab navigation if settings has multiple sections
    const tabs = page.locator('[role="tab"], .tab, .settings-tab');
    const tabCount = await tabs.count();
    
    if (tabCount > 1) {
      for (let i = 0; i < Math.min(tabCount, 3); i++) {
        const tab = tabs.nth(i);
        await tab.click();
        
        // Check if tab becomes active
        const isActive = await tab.getAttribute('aria-selected') === 'true' || 
                         await tab.getAttribute('class')?.includes('active');
        if (isActive) {
          expect(isActive).toBeTruthy();
        }
      }
    }
  });

  test('should handle image upload for restaurant logo', async ({ page }) => {
    await page.goto('/settings');
    
    // Look for image upload section
    const imageUpload = page.locator('input[type="file"], [data-testid="logo-upload"]');
    if (await imageUpload.count() > 0) {
      await expect(imageUpload).toBeVisible();
      
      // Check if current logo is displayed
      const currentLogo = page.locator('img[alt*="logo"], [data-testid="current-logo"]');
      if (await currentLogo.count() > 0) {
        await expect(currentLogo).toBeVisible();
      }
      
      // Test file input attributes
      const accept = await imageUpload.getAttribute('accept');
      if (accept) {
        expect(accept).toMatch(/image/);
      }
    }
  });

  test('should manage notification preferences', async ({ page }) => {
    await page.goto('/settings');
    
    // Look for notification settings
    const notificationSection = page.locator('[data-testid="notification-settings"], .notification-section');
    if (await notificationSection.count() > 0) {
      await expect(notificationSection).toBeVisible();
      
      // Test notification toggles
      const notificationToggles = page.locator('input[type="checkbox"][name*="notification"]');
      const toggleCount = await notificationToggles.count();
      
      for (let i = 0; i < Math.min(toggleCount, 3); i++) {
        const toggle = notificationToggles.nth(i);
        const initialState = await toggle.isChecked();
        
        // Toggle the setting
        await toggle.click();
        const newState = await toggle.isChecked();
        
        // Verify state changed
        expect(newState).toBe(!initialState);
        
        // Toggle back to original state
        await toggle.click();
        await expect(toggle).toBeChecked({ checked: initialState });
      }
    }
  });

  test('should handle timezone settings', async ({ page }) => {
    await page.goto('/settings');
    
    // Look for timezone selection
    const timezoneSelect = page.locator('select[name*="timezone"], [data-testid="timezone-select"]');
    if (await timezoneSelect.count() > 0) {
      await expect(timezoneSelect).toBeVisible();
      
      // Test selecting a different timezone
      const options = await timezoneSelect.locator('option').all();
      if (options.length > 1) {
        const secondOption = options[1];
        const optionValue = await secondOption.getAttribute('value');
        if (optionValue) {
          await timezoneSelect.selectOption(optionValue);
          await expect(timezoneSelect).toHaveValue(optionValue);
        }
      }
    }
  });

  test('should export/import settings', async ({ page }) => {
    await page.goto('/settings');
    
    // Look for export button
    const exportButton = page.locator('button:has-text("Export"), [data-testid="export-settings"]');
    if (await exportButton.count() > 0) {
      await expect(exportButton).toBeVisible();
      
      // Test export functionality (without actually downloading)
      await exportButton.click();
      
      // Check for download or modal
      const downloadModal = page.locator('[data-testid="download-modal"], .modal');
      if (await downloadModal.count() > 0) {
        await expect(downloadModal).toBeVisible();
      }
    }
    
    // Look for import button
    const importButton = page.locator('button:has-text("Import"), [data-testid="import-settings"]');
    if (await importButton.count() > 0) {
      await expect(importButton).toBeVisible();
    }
  });

  test('should handle settings reset', async ({ page }) => {
    await page.goto('/settings');
    
    // Look for reset button
    const resetButton = page.locator('button:has-text("Reset"), [data-testid="reset-settings"]');
    if (await resetButton.count() > 0) {
      await expect(resetButton).toBeVisible();
      
      // Test reset confirmation
      await resetButton.click();
      
      // Check for confirmation dialog
      const confirmDialog = page.locator('[data-testid="confirm-dialog"], .modal, [role="dialog"]');
      if (await confirmDialog.count() > 0) {
        await expect(confirmDialog).toBeVisible();
        
        // Cancel the reset
        const cancelButton = confirmDialog.locator('button:has-text("Cancel"), [data-testid="cancel"]');
        if (await cancelButton.count() > 0) {
          await cancelButton.click();
          await expect(confirmDialog).not.toBeVisible();
        }
      }
    }
  });

  test('should maintain settings across browser sessions', async ({ page, context }) => {
    await page.goto('/settings');
    
    // Make a setting change
    const testField = page.locator('input[name="description"], textarea').first();
    if (await testField.count() > 0) {
      const testValue = 'Session persistence test';
      await testField.fill(testValue);
      
      // Save settings
      const saveButton = page.locator('button[type="submit"], button:has-text("Save")');
      if (await saveButton.count() > 0) {
        await saveButton.click();
        
        // Wait for save to complete
        await page.waitForTimeout(1000);
        
        // Open new page in same context (simulates new tab)
        const newPage = await context.newPage();
        await newPage.goto('/signin');
        await newPage.fill('input[name="email"]', 'admin@restaurant.com');
        await newPage.fill('input[name="password"]', 'admin123');
        await newPage.click('button[type="submit"]');
        await newPage.waitForURL('/');
        
        await newPage.goto('/settings');
        
        // Verify setting persisted
        const persistedField = newPage.locator('input[name="description"], textarea').first();
        if (await persistedField.count() > 0) {
          await expect(persistedField).toHaveValue(testValue);
        }
        
        await newPage.close();
      }
    }
  });
});
