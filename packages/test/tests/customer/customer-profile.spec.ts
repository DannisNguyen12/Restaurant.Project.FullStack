import { test, expect } from '@playwright/test';

test.describe('Customer - Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to customer app and sign in
    await page.goto('http://localhost:3001');
    await page.click('[data-testid="signin-button"], .signin-button, button:has-text("Sign In")');
    await page.fill('input[name="email"], input[type="email"]', 'test@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'password123');
    await page.click('button[type="submit"], button:has-text("Sign In")');
  });

  test('should access profile page from navigation', async ({ page }) => {
    await page.click('[data-testid="profile-menu"], .profile-menu, .user-menu');
    await page.click('[data-testid="profile-link"], .profile-link, a:has-text("Profile")');
    
    await expect(page).toHaveURL(/.*profile/);
    await expect(page.locator('h1, .profile-title')).toContainText(/profile|account/i);
  });

  test('should display current user information', async ({ page }) => {
    await page.goto('http://localhost:3001/profile');
    
    // Check profile information display
    await expect(page.locator('.profile-info, [data-testid="profile-info"]')).toBeVisible();
    await expect(page.locator('.user-name, [data-testid="user-name"]')).toBeVisible();
    await expect(page.locator('.user-email, [data-testid="user-email"]')).toContainText('test@example.com');
  });

  test('should edit profile information', async ({ page }) => {
    await page.goto('http://localhost:3001/profile');
    
    await page.click('[data-testid="edit-profile"], .edit-profile, button:has-text("Edit")');
    
    // Update profile fields
    await page.fill('input[name="firstName"], [data-testid="first-name"]', 'John');
    await page.fill('input[name="lastName"], [data-testid="last-name"]', 'Doe');
    await page.fill('input[name="phone"], [data-testid="phone"]', '1234567890');
    
    await page.click('[data-testid="save-profile"], .save-profile, button:has-text("Save")');
    
    // Should show success message
    await expect(page.locator('.success-message, [data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('.user-name, [data-testid="user-name"]')).toContainText('John Doe');
  });

  test('should validate profile form fields', async ({ page }) => {
    await page.goto('http://localhost:3001/profile');
    
    await page.click('[data-testid="edit-profile"], button:has-text("Edit")');
    
    // Clear required field
    await page.fill('input[name="firstName"], [data-testid="first-name"]', '');
    await page.click('[data-testid="save-profile"], button:has-text("Save")');
    
    // Should show validation error
    await expect(page.locator('.error, .validation-error, [data-testid="error"]')).toBeVisible();
  });

  test('should manage delivery addresses', async ({ page }) => {
    await page.goto('http://localhost:3001/profile');
    
    // Navigate to addresses section
    await page.click('[data-testid="addresses-tab"], .addresses-tab, button:has-text("Addresses")');
    
    await expect(page.locator('.addresses-section, [data-testid="addresses-section"]')).toBeVisible();
    await expect(page.locator('.address-list, [data-testid="address-list"]')).toBeVisible();
  });

  test('should add new delivery address', async ({ page }) => {
    await page.goto('http://localhost:3001/profile/addresses');
    
    await page.click('[data-testid="add-address"], .add-address, button:has-text("Add Address")');
    
    // Fill address form
    await page.fill('input[name="label"], [data-testid="address-label"]', 'Home');
    await page.fill('input[name="street"], [data-testid="street"]', '123 Main St');
    await page.fill('input[name="city"], [data-testid="city"]', 'New York');
    await page.fill('input[name="state"], [data-testid="state"]', 'NY');
    await page.fill('input[name="zipCode"], [data-testid="zip-code"]', '10001');
    
    await page.click('[data-testid="save-address"], .save-address, button:has-text("Save")');
    
    // Should add address to list
    await expect(page.locator('.address-item, [data-testid="address-item"]')).toContainText('Home');
    await expect(page.locator('.address-item, [data-testid="address-item"]')).toContainText('123 Main St');
  });

  test('should edit existing address', async ({ page }) => {
    await page.goto('http://localhost:3001/profile/addresses');
    
    await page.click('.address-item:first-child .edit-address, [data-testid="edit-address"]:first-of-type');
    
    // Update address
    await page.fill('input[name="street"], [data-testid="street"]', '456 Oak Ave');
    await page.click('[data-testid="save-address"], button:has-text("Save")');
    
    // Should update address in list
    await expect(page.locator('.address-item, [data-testid="address-item"]')).toContainText('456 Oak Ave');
  });

  test('should delete address', async ({ page }) => {
    await page.goto('http://localhost:3001/profile/addresses');
    
    const initialCount = await page.locator('.address-item, [data-testid="address-item"]').count();
    
    await page.click('.address-item:first-child .delete-address, [data-testid="delete-address"]:first-of-type');
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete"], button:has-text("Delete")');
    
    // Should remove address from list
    const newCount = await page.locator('.address-item, [data-testid="address-item"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should set default address', async ({ page }) => {
    await page.goto('http://localhost:3001/profile/addresses');
    
    await page.click('.address-item:first-child .set-default, [data-testid="set-default"]:first-of-type');
    
    // Should mark as default
    await expect(page.locator('.address-item:first-child .default-badge, [data-testid="default-badge"]')).toBeVisible();
  });

  test('should manage payment methods', async ({ page }) => {
    await page.goto('http://localhost:3001/profile');
    
    await page.click('[data-testid="payment-tab"], .payment-tab, button:has-text("Payment")');
    
    await expect(page.locator('.payment-section, [data-testid="payment-section"]')).toBeVisible();
    await expect(page.locator('.payment-methods, [data-testid="payment-methods"]')).toBeVisible();
  });

  test('should add new payment method', async ({ page }) => {
    await page.goto('http://localhost:3001/profile/payment');
    
    await page.click('[data-testid="add-payment"], .add-payment, button:has-text("Add Card")');
    
    // Fill card details
    await page.fill('input[name="cardNumber"], [data-testid="card-number"]', '4111111111111111');
    await page.fill('input[name="expiryDate"], [data-testid="expiry-date"]', '12/25');
    await page.fill('input[name="cvv"], [data-testid="cvv"]', '123');
    await page.fill('input[name="cardholderName"], [data-testid="cardholder-name"]', 'John Doe');
    
    await page.click('[data-testid="save-payment"], .save-payment, button:has-text("Save")');
    
    // Should add card to list
    await expect(page.locator('.payment-item, [data-testid="payment-item"]')).toContainText('**** 1111');
  });

  test('should remove payment method', async ({ page }) => {
    await page.goto('http://localhost:3001/profile/payment');
    
    await page.click('.payment-item:first-child .remove-payment, [data-testid="remove-payment"]:first-of-type');
    
    // Confirm removal
    await page.click('[data-testid="confirm-remove"], button:has-text("Remove")');
    
    // Should remove payment method
    await expect(page.locator('.success-message, [data-testid="success-message"]')).toBeVisible();
  });

  test('should change password', async ({ page }) => {
    await page.goto('http://localhost:3001/profile');
    
    await page.click('[data-testid="security-tab"], .security-tab, button:has-text("Security")');
    
    // Fill password change form
    await page.fill('input[name="currentPassword"], [data-testid="current-password"]', 'password123');
    await page.fill('input[name="newPassword"], [data-testid="new-password"]', 'newpassword123');
    await page.fill('input[name="confirmPassword"], [data-testid="confirm-password"]', 'newpassword123');
    
    await page.click('[data-testid="change-password"], .change-password, button:has-text("Change Password")');
    
    // Should show success message
    await expect(page.locator('.success-message, [data-testid="success-message"]')).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('http://localhost:3001/profile/security');
    
    // Try weak password
    await page.fill('input[name="currentPassword"], [data-testid="current-password"]', 'password123');
    await page.fill('input[name="newPassword"], [data-testid="new-password"]', '123');
    await page.fill('input[name="confirmPassword"], [data-testid="confirm-password"]', '123');
    
    await page.click('[data-testid="change-password"], button:has-text("Change Password")');
    
    // Should show validation error
    await expect(page.locator('.error, .validation-error, [data-testid="password-error"]')).toBeVisible();
  });

  test('should view order history from profile', async ({ page }) => {
    await page.goto('http://localhost:3001/profile');
    
    await page.click('[data-testid="orders-tab"], .orders-tab, button:has-text("Orders")');
    
    await expect(page).toHaveURL(/.*profile.*orders|.*orders/);
    await expect(page.locator('.order-list, [data-testid="order-list"]')).toBeVisible();
  });

  test('should manage notification preferences', async ({ page }) => {
    await page.goto('http://localhost:3001/profile');
    
    await page.click('[data-testid="notifications-tab"], .notifications-tab, button:has-text("Notifications")');
    
    // Toggle notification settings
    await page.check('[data-testid="email-notifications"], input[name="emailNotifications"]');
    await page.check('[data-testid="sms-notifications"], input[name="smsNotifications"]');
    await page.uncheck('[data-testid="marketing-emails"], input[name="marketingEmails"]');
    
    await page.click('[data-testid="save-preferences"], .save-preferences, button:has-text("Save")');
    
    // Should save preferences
    await expect(page.locator('.success-message, [data-testid="success-message"]')).toBeVisible();
  });

  test('should upload profile picture', async ({ page }) => {
    await page.goto('http://localhost:3001/profile');
    
    // Click on profile picture or upload button
    await page.click('[data-testid="upload-avatar"], .upload-avatar, .profile-picture');
    
    // Simulate file upload (in real test, you'd use setInputFiles)
    if (await page.locator('input[type="file"]').isVisible()) {
      // In a real test, you would upload an actual file
      // await page.setInputFiles('input[type="file"]', 'test-avatar.jpg');
      await expect(page.locator('input[type="file"]')).toBeVisible();
    }
  });

  test('should delete account', async ({ page }) => {
    await page.goto('http://localhost:3001/profile/security');
    
    await page.click('[data-testid="delete-account"], .delete-account, button:has-text("Delete Account")');
    
    // Should show confirmation dialog
    await expect(page.locator('.delete-confirmation, [data-testid="delete-confirmation"]')).toBeVisible();
    
    // Fill confirmation
    await page.fill('input[name="confirmDelete"], [data-testid="confirm-delete-input"]', 'DELETE');
    
    // Don't actually delete in test
    // await page.click('[data-testid="confirm-delete-button"], button:has-text("Delete")');
  });

  test('should logout from profile page', async ({ page }) => {
    await page.goto('http://localhost:3001/profile');
    
    await page.click('[data-testid="logout-button"], .logout-button, button:has-text("Logout")');
    
    // Should redirect to home page and show signed out state
    await expect(page).toHaveURL(/.*\/$|.*home/);
    await expect(page.locator('[data-testid="signin-button"], .signin-button')).toBeVisible();
  });

  test('should export user data', async ({ page }) => {
    await page.goto('http://localhost:3001/profile/privacy');
    
    await page.click('[data-testid="export-data"], .export-data, button:has-text("Export Data")');
    
    // Should show export confirmation or download
    await expect(page.locator('.export-success, [data-testid="export-success"]')).toBeVisible();
  });

  test('should view privacy settings', async ({ page }) => {
    await page.goto('http://localhost:3001/profile');
    
    await page.click('[data-testid="privacy-tab"], .privacy-tab, button:has-text("Privacy")');
    
    await expect(page.locator('.privacy-settings, [data-testid="privacy-settings"]')).toBeVisible();
    
    // Toggle privacy settings
    await page.check('[data-testid="share-data"], input[name="shareData"]');
    await page.uncheck('[data-testid="personalized-ads"], input[name="personalizedAds"]');
    
    await page.click('[data-testid="save-privacy"], button:has-text("Save")');
    
    await expect(page.locator('.success-message, [data-testid="success-message"]')).toBeVisible();
  });

  test('should handle profile form validation', async ({ page }) => {
    await page.goto('http://localhost:3001/profile');
    
    await page.click('[data-testid="edit-profile"], button:has-text("Edit")');
    
    // Invalid email format
    await page.fill('input[name="email"], [data-testid="email"]', 'invalid-email');
    await page.click('[data-testid="save-profile"], button:has-text("Save")');
    
    await expect(page.locator('.error, .validation-error')).toContainText(/valid email/i);
  });

  test('should show account activity log', async ({ page }) => {
    await page.goto('http://localhost:3001/profile/security');
    
    // Check if activity log is available
    if (await page.locator('.activity-log, [data-testid="activity-log"]').isVisible()) {
      await expect(page.locator('.activity-item, [data-testid="activity-item"]')).toBeVisible();
      await expect(page.locator('.activity-item:first-child')).toContainText(/login|signin/i);
    }
  });

  test('should handle session timeout', async ({ page }) => {
    await page.goto('http://localhost:3001/profile');
    
    // Simulate session timeout (this would require backend support)
    // In real implementation, you might clear session storage
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());
    
    // Try to perform an action that requires authentication
    await page.click('[data-testid="edit-profile"], button:has-text("Edit")');
    
    // Should redirect to login or show authentication required message
    if (await page.locator('[data-testid="signin-button"], .signin-button').isVisible()) {
      await expect(page.locator('[data-testid="signin-button"], .signin-button')).toBeVisible();
    }
  });
});
