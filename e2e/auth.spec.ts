import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('Login page loads and shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');
    
    // Check if the page contains 'Login'
    await expect(page.locator('h1')).toHaveText('Login');
    
    // Submit empty form
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Expect validation errors
    await expect(page.locator('text=Invalid email address')).toBeVisible();
    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
  });

  test('Shows invalid email or password message for wrong credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[id="email"]', 'wrong@example.com');
    await page.fill('input[id="password"]', 'password123');
    
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // It should eventually show the firebase invalid login error
    await expect(page.locator('text=Invalid email or password').or(page.locator('text=Firebase: Error')).first()).toBeVisible({ timeout: 10000 });
  });
});
