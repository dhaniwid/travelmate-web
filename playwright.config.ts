import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.test if present (audit credentials)
const envTestPath = path.join(__dirname, '.env.test');
if (fs.existsSync(envTestPath)) {
    const lines = fs.readFileSync(envTestPath, 'utf-8').split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [key, ...rest] = trimmed.split('=');
        if (key && rest.length > 0) {
            process.env[key.trim()] = rest.join('=').trim();
        }
    }
}

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 1,
    reporter: [['html'], ['list']],
    outputDir: 'test-results',
    use: {
        baseURL: 'http://localhost:3001',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'off',
    },
    projects: [
        // Auth setup — runs once before audit projects
        {
            name: 'setup',
            testMatch: /global-setup\.ts/,
        },
        {
            name: 'desktop',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1280, height: 800 },
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
            testMatch: /ux-audit\.spec\.ts/,
        },
        {
            name: 'mobile',
            use: {
                ...devices['iPhone 14'],
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
            testMatch: /ux-audit\.spec\.ts/,
        },
        // Core journey tests — no auth required (mocked)
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /core-journeys\.spec\.ts/,
        },
    ],
});
