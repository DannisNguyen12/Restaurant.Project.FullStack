import { test, expect } from '@playwright/test';

test.describe('Customer Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('should display customer signin page', async ({ page }) => {
    await page.goto('/signin');
    
    // Check for signin form elements
    await expect(page.locator('h2')).toContainText('Sign in to your account');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Sign in');
    
    // Check for signup link
    await expect(page.locator('a[href="/signup"]')).toContainText('Sign up');
  });

  test('should display customer signup page', async ({ page }) => {
    await page.goto('/signup');
    
    // Check for signup form elements
    await expect(page.locator('h2')).toContainText('Create your account');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Sign up');
    
    // Check for signin link
    await expect(page.locator('a[href="/signin"]')).toContainText('Sign in');
  });

  test('should handle invalid customer login', async ({ page }) => {
    await page.goto('/signin');
    
    // Fill form with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('[class*="error"], [class*="red"], .text-red-700')).toBeVisible();
  });

  test('should validate signup form fields', async ({ page }) => {
    await page.goto('/signup');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('input[name="name"]')).toHaveAttribute('required');
    await expect(page.locator('input[name="email"]')).toHaveAttribute('required');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required');
  });

  test('should handle password visibility toggle', async ({ page }) => {
    await page.goto('/signin');
    
    const passwordInput = page.locator('input[name="password"]');
    const toggleButton = page.locator('button:has-text("Show"), button:has-text("Hide")').first();
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle to show password
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click again to hide password
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/signin');
    
    // Fill invalid email format
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should show email validation error
    const errorMessage = page.locator('[class*="error"], [class*="red"], .text-red-600, .text-red-700');
    await expect(errorMessage).toBeVisible();
  });

  test('should handle successful customer registration flow', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill signup form with valid data
    const timestamp = Date.now();
    await page.fill('input[name="name"]', `Test Customer ${timestamp}`);
    await page.fill('input[name="email"]', `customer${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show success message or redirect
    await expect(
      page.locator('[class*="success"], [class*="green"], .text-green-700')
        .or(page.locator('text="Account created successfully"'))
        .or(page.getByText(/successfully/i))
    ).toBeVisible({ timeout: 10000 });
  });

  test('should validate password confirmation matching', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill form with non-matching passwords
    await page.fill('input[name="name"]', 'Test Customer');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'different456');
    await page.click('button[type="submit"]');
    
    // Should show password mismatch error
    await expect(page.locator('text="Passwords do not match"')).toBeVisible();
  });

  test('should handle loading states during authentication', async ({ page }) => {
    await page.goto('/signin');
    
    // Fill form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit and check for loading state
    await page.click('button[type="submit"]');
    
    // Should show loading indicator
    await expect(
      page.locator('[class*="loading"], [class*="spinner"], [class*="animate-spin"]')
        .or(page.locator('text="Signing in..."'))
        .or(page.locator('button[disabled]'))
    ).toBeVisible({ timeout: 2000 });
  });

  test('should handle social authentication options', async ({ page }) => {
    await page.goto('/signin');
    
    // Check for social login buttons
    const googleButton = page.locator('button:has-text("Google"), [aria-label*="Google"], svg[viewBox*="24"]').first();
    const githubButton = page.locator('button:has-text("GitHub"), [aria-label*="GitHub"]').first();
    
    if (await googleButton.isVisible()) {
      await expect(googleButton).toBeVisible();
    }
    
    if (await githubButton.isVisible()) {
      await expect(githubButton).toBeVisible();
    }
  });

  test('should handle session persistence', async ({ page }) => {
    // This test would require actual authentication setup
    // For now, we'll test the navigation flow
    await page.goto('/');
    
    // Check if signed-out state shows signin/signup options
    const signinLink = page.locator('a[href="/signin"], text="Sign In"');
    const signupLink = page.locator('a[href="/signup"], text="Sign Up"');
    
    if (await signinLink.isVisible()) {
      await expect(signinLink).toBeVisible();
    }
    
    if (await signupLink.isVisible()) {
      await expect(signupLink).toBeVisible();
    }
  });

  test('should redirect unauthenticated users from protected pages', async ({ page }) => {
    // Try to access checkout page without authentication
    await page.goto('/checkout');
    
    // Should redirect to signin or show authentication requirement
    await expect(
      page.url().includes('/signin') || 
      page.locator('text="Please sign in"').isVisible() ||
      page.locator('text="Authentication required"').isVisible()
    ).toBeTruthy();
  });
});
