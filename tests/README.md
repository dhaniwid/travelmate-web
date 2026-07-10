# Playwright UX Audit

Automated screenshot + console-error capture across all major TravelMate pages.

## Setup

1. Copy the env template and fill in your credentials:
   ```bash
   cp .env.test.example .env.test
   ```

2. Edit `.env.test`:
   ```
   PLAYWRIGHT_TEST_EMAIL=your-clerk-test-user@email.com
   PLAYWRIGHT_TEST_PASSWORD=your-password
   PLAYWRIGHT_AUDIT_TRIP_ID=f058520c-0642-4ce5-ace5-d65a294805c6
   ```
   Use a dedicated Clerk test account — not your personal login.

3. Install Playwright browsers (first time only):
   ```bash
   npx playwright install chromium
   ```

## Running the audit

```bash
# Both desktop + mobile
npm run audit

# Desktop only
npm run audit:desktop

# Mobile only
npm run audit:mobile

# Open HTML report
npm run audit:report
```

## Output

| Path | Contents |
|------|----------|
| `test-results/screenshots/desktop/` | Full-page screenshots, desktop viewport |
| `test-results/screenshots/mobile/` | Full-page screenshots, iPhone 14 viewport |
| `test-results/console-errors.json` | All `console.error` and `pageerror` events |
| `playwright-report/` | Playwright HTML report |

## Pages covered

- `/` — Landing
- `/explore/solo` — Explore solo flow
- `/dashboard` — Dashboard (auth required)
- `/profile` — Profile (auth required)
- `/trips/:id?tab=overview` — Trip overview tab
- `/trips/:id?tab=itinerary` — Itinerary tab
- `/trips/:id?tab=map` — Map tab
- `/trips/:id?tab=logistics` — Logistics tab
- `/trips/:id?tab=essentials` — Essentials tab
- `/trips/:id?tab=sumi` — Sumi chat tab

## Auth flow

`global-setup.ts` logs in via Clerk at `/sign-in`, waits for redirect to `/dashboard`, then saves cookies + localStorage to `playwright/.auth/user.json`. The desktop and mobile projects reuse this saved state — login runs once per audit run, not per test.

## Core journey tests

```bash
npm test
```

Runs `tests/core-journeys.spec.ts` against Chromium (no auth required).
