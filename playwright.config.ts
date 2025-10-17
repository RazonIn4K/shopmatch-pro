import { defineConfig, devices } from '@playwright/test'

const ensureEnv = (key: string, fallback: string) => {
  if (!process.env[key]) {
    process.env[key] = fallback
  }
}

ensureEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'test-firebase-api-key')
ensureEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'test-app.firebaseapp.com')
ensureEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'test-project')
ensureEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'test-project.appspot.com')
ensureEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', '1234567890')
ensureEnv('NEXT_PUBLIC_FIREBASE_APP_ID', '1:1234567890:web:abcdef123456')
ensureEnv('NEXT_PUBLIC_AUTH_TEST_MODE', 'mock')

/**
 * Playwright Configuration for ShopMatch Pro
 *
 * E2E testing setup with accessibility testing integration.
 * Runs tests against local development server on http://localhost:3000
 *
 * @see https://playwright.dev/docs/test-configuration
 */
const htmlReporter: ['html', { open: 'never'; host: string }] = ['html', { open: 'never', host: '127.0.0.1' }]

export default defineConfig({
  // Test directory structure
  testDir: './e2e',
  
  // Maximum time one test can run for
  timeout: 30 * 1000,
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI (more stable)
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: process.env.CI
    ? [htmlReporter, ['github']]
    : [htmlReporter, ['list']],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to test on Firefox
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // Uncomment to test on WebKit
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Mobile viewports
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Run your local dev server before starting the tests
  // Note: For E2E tests to work correctly, you must:
  // 1. Copy test environment: cp .env.test.local .env.local
  // 2. Clear Next.js cache: rm -rf .next
  // 3. Start dev server: npm run dev
  // 4. Run tests: npm run test:e2e
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true, // Use manually started server
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
