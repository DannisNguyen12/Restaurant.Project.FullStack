import { test as base, Page } from '@playwright/test';

// Define custom fixture types
type CustomFixtures = {
  adminPage: Page;
  customerPage: Page;
};

// Extend the basic Playwright test to include authentication
export const test = base.extend<CustomFixtures>({
  // This is a fixture that logs in as an admin before the test
  adminPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill credentials (using the admin user from our seed)
    await page.getByLabel('Email address').fill('admin@example.com');
    await page.getByLabel('Password').fill('123');
    
    // Submit form
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    // Wait for navigation to complete
    await page.waitForURL('/');
    
    // Pass the authenticated page to the test
    await use(page);
  },
  
  // This is a fixture that logs in as a customer before the test
  customerPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill credentials (using a customer user from our seed)
    await page.getByLabel('Email address').fill('alice@example.com');
    await page.getByLabel('Password').fill('123');
    
    // Submit form
    await page.getByRole('button', { name: /Sign in/i }).click();
    
    // Wait for navigation to complete
    await page.waitForURL('/');
    
    // Pass the authenticated page to the test
    await use(page);
  },
});

export { expect } from '@playwright/test';
