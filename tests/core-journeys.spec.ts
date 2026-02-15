import { test, expect } from '@playwright/test';

test.describe('Core User Journeys', () => {

    test.beforeEach(async ({ page }) => {
        // Mock Clerk Authentication
        await page.route('**/api/auth/**', (route) => route.fulfill({ status: 200, body: JSON.stringify({ session: 'mock-session' }) }));

        // Mock Subscription API
        await page.route('**/api/proxy/subscription', (route) => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                subscription: { subscription_tier: 'FREE' },
                quota: { remaining: 1, total: 1 }
            })
        }));
    });

    test('The Happy Path: Trip Generation', async ({ page }) => {
        await page.goto('/');

        // 1. Fill Destination
        const searchInput = page.getByPlaceholder(/where next/i);
        await searchInput.fill('Bali');

        // 2. Click Start Planning
        await page.getByRole('button', { name: /start planning/i }).click();

        // 3. Mock Generation Response
        await page.route('**/api/proxy/generate-async', (route) => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ trip: { id: 'test-trip-123' } })
        }));

        // 4. Submit Form (assuming there's a generate button in the modal)
        await page.getByRole('button', { name: /generate/i }).last().click();

        // 5. Verify Redirection
        await expect(page).toHaveURL(/\/trips\/test-trip-123/);
    });

    test('The Paywall: Quota Exhausted', async ({ page }) => {
        // Mock 0 quota
        await page.route('**/api/proxy/subscription', (route) => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                subscription: { subscription_tier: 'FREE' },
                quota: { remaining: 0, total: 1 }
            })
        }));

        await page.goto('/');

        // Attempt to plan
        await page.getByRole('button', { name: /start planning/i }).click();

        // Verify Toast or Modal error (assuming it shows a toast with "reached your free trip limit")
        await expect(page.getByText(/reached your free trip limit/i)).toBeVisible();

        // Verify redirection to pricing
        await page.waitForURL(/\/pricing/);
    });

    test('Adaptive Navigation: Pro vs Free', async ({ page }) => {
        // 1. Test Free User
        await page.goto('/dashboard');
        await expect(page.getByRole('link', { name: /upgrade/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /sumi/i })).not.toBeVisible();

        // 2. Mock Pro Status
        await page.route('**/api/proxy/subscription', (route) => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                subscription: { subscription_tier: 'PRO' },
                quota: { remaining: 99, total: 99 }
            })
        }));

        await page.reload();

        // 3. Verify Sumi Replace Upgrade
        await expect(page.getByRole('link', { name: /sumi/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /upgrade/i })).not.toBeVisible();
    });
});
