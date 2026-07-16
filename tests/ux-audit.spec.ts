/**
 * UX Audit Script — MT-104
 * Captures screenshots + console errors for all major pages.
 * Run: npm run audit
 */

import { test, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Known trip ID for audit — update if this trip is deleted
const AUDIT_TRIP_ID = process.env.PLAYWRIGHT_AUDIT_TRIP_ID || 'f058520c-0642-4ce5-ace5-d65a294805c6';

// Accumulate console errors across all tests and write at the end
const consoleErrors: Array<{ page: string; project: string; errors: string[] }> = [];

const RESULTS_DIR = path.join(process.cwd(), 'test-results');
const ERRORS_FILE = path.join(RESULTS_DIR, 'console-errors.json');

function screenshotDir(project: string): string {
    const dir = path.join(RESULTS_DIR, 'screenshots', project);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

async function captureAuditPage(
    page: Page,
    url: string,
    name: string,
    project: string,
    waitFor?: string | number,
) {
    const errors: string[] = [];

    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
    });
    page.on('pageerror', err => {
        errors.push(`[pageerror] ${err.message}`);
    });

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    if (typeof waitFor === 'number') {
        await page.waitForTimeout(waitFor);
    } else if (typeof waitFor === 'string') {
        await page.waitForSelector(waitFor, { timeout: 10000 }).catch(() => {});
    }

    const dir = screenshotDir(project);
    await page.screenshot({
        path: path.join(dir, `${name}.png`),
        fullPage: true,
    });

    if (errors.length > 0) {
        consoleErrors.push({ page: name, project, errors });
    }
}

test.beforeAll(() => {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
});

test.afterAll(() => {
    fs.writeFileSync(ERRORS_FILE, JSON.stringify(consoleErrors, null, 2));
    const totalErrors = consoleErrors.reduce((acc, e) => acc + e.errors.length, 0);
    if (totalErrors > 0) {
        console.log(`\n⚠️  ${totalErrors} console error(s) captured → ${ERRORS_FILE}`);
    } else {
        console.log('\n✅ No console errors detected.');
    }
});

// ─── Public pages ──────────────────────────────────────────────────────────────

test('landing page', async ({ page }, testInfo) => {
    await captureAuditPage(page, '/', 'landing', testInfo.project.name, 1500);
});

test('explore — solo', async ({ page }, testInfo) => {
    await captureAuditPage(page, '/explore/solo', 'explore-solo', testInfo.project.name, 2000);
});

// ─── Authenticated pages ───────────────────────────────────────────────────────

test('dashboard', async ({ page }, testInfo) => {
    await captureAuditPage(page, '/dashboard', 'dashboard', testInfo.project.name, 2000);
});

test('profile', async ({ page }, testInfo) => {
    await captureAuditPage(page, '/profile', 'profile', testInfo.project.name, 1500);
});

// ─── Trip tabs ─────────────────────────────────────────────────────────────────

const TRIP_TABS = [
    { tab: 'overview',   name: 'trip-overview',   selector: '[data-tab="overview"], h2' },
    { tab: 'itinerary',  name: 'trip-itinerary',  selector: null },
    { tab: 'map',        name: 'trip-map',         selector: null },
    { tab: 'logistics',  name: 'trip-logistics',   selector: null },
    { tab: 'essentials', name: 'trip-essentials',  selector: null },
    { tab: 'sumi',       name: 'trip-sumi',        selector: null },
];

for (const { tab, name, selector } of TRIP_TABS) {
    test(`trip — ${tab}`, async ({ page }, testInfo) => {
        const url = `/trips/${AUDIT_TRIP_ID}?tab=${tab}`;
        await captureAuditPage(page, url, name, testInfo.project.name, selector ?? 2500);
    });
}
