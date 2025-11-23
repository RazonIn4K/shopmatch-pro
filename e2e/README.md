# E2E Scraping & Testing

This directory contains Playwright scripts for the AI Photo Restoration project.

## Scripts

### 1. Group Discovery (`group-discovery.spec.ts`)

Searches Facebook for new groups related to "Photo Restoration" and logs their URLs.

```bash
npx playwright test e2e/group-discovery.spec.ts
```

### 2. Restoration Bot Dry Run (`restoration-bot.spec.ts`)

Visits target groups, identifies posts with images, and verifies it can find the comment box. Does **NOT** post anything.

```bash
npx playwright test e2e/restoration-bot.spec.ts
```

## Authentication

These scripts require you to be logged into Facebook.

1.  Run with `--ui` flag to login manually:
    ```bash
    npx playwright test e2e/restoration-bot.spec.ts --ui
    ```
2.  Or configure `playwright.config.ts` to use a saved storage state.
