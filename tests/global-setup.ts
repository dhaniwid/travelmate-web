import { test as setup, expect } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
    const email = process.env.PLAYWRIGHT_TEST_EMAIL;
    const password = process.env.PLAYWRIGHT_TEST_PASSWORD;

    if (!email || !password) {
        throw new Error(
            'PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD must be set in .env.test\n' +
            'See tests/README.md for setup instructions.'
        );
    }

    await page.goto('/sign-in');

    // Clerk renders its own input fields — wait for them
    await page.waitForSelector('input[name="identifier"]', { timeout: 15000 });
    await page.fill('input[name="identifier"]', email);
    await page.click('button[type="submit"]');

    // Password step
    await page.waitForSelector('input[name="password"]', { timeout: 10000 });
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard after successful login
    await page.waitForURL('**/dashboard', { timeout: 20000 });
    await expect(page).toHaveURL(/dashboard/);

    // Save auth state (cookies + localStorage) for reuse across audit tests
    await page.context().storageState({ path: AUTH_FILE });
});
