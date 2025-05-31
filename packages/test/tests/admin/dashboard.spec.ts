import { test, expect } from '@playwright/test';
import type { Page, Locator, expect as playwrightExpect } from '@playwright/test';

// Utility function for admin login
interface Credentials {
    email: string;
    password: string;
}

/**
 * Logs in as admin user
 */
async function loginAsAdmin(page: Page, credentials: Credentials = { 
    email: 'admin@example.com', 
    password: '123' 
}): Promise<void> {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(credentials.email);
    await page.getByLabel('Password').fill(credentials.password);
    await page.getByRole('button', { name: /Sign in/i }).click();
    await expect(page).toHaveURL('/');
}

test.describe('Admin Dashboard', () => {
  // Before each test, make sure we're logged in
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should load items from the database', async ({ page }) => {
    // Go to the admin dashboard
    await page.goto('/');
    
    // Wait for the item cards to be visible (this verifies that data is fetched correctly)
    await page.waitForSelector('div[data-testid="item-card"]', { timeout: 10000 });
    
    // Check if at least one item card is present
    const itemCards = await page.$$('div[data-testid="item-card"]');
    expect(itemCards.length).toBeGreaterThan(0);
    
    // Check if the item names are displayed
    const firstItemTitle = await itemCards[0].$('a[href^="/detail/"]');
    expect(await firstItemTitle?.innerText()).toBeTruthy();
    
    // Check if the "Create New Item" button is present
    const createButton = await page.getByRole('link', { name: '+ Create New Item' });
    expect(createButton).toBeVisible();
  });

  test('admin login should work', async ({ page }) => {
    // Start from a fresh page
    await page.context().clearCookies();
    await page.goto('/');
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login');
    
    // Fill in login credentials
    await page.getByLabel('Email address').fill('admin@example.com');
    await page.getByLabel('Password').fill('123');
    
    // Click sign in button
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    // Check if redirected to dashboard
    await expect(page).toHaveURL('/');
    
    // Verify we can see the create button (indicates successful login)
    const createButton = await page.getByRole('link', { name: '+ Create New Item' });
    expect(createButton).toBeVisible();
  });
});
