import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // 1. Go to Facebook
  await page.goto('https://www.facebook.com/');
  
  // 2. Pause for manual login
  // The user will login manually in the headed browser window.
  // Once logged in, they should resume the script (or we wait for a specific element).
  console.log('Please log in to Facebook in the browser window...');
  
  // Wait for a known element that appears after login (e.g., the main feed or profile icon)
  // We use a long timeout to give the user time to type credentials and 2FA.
  await page.waitForSelector('[role="feed"]', { timeout: 300000 }); // 5 minutes
  
  // 3. Save storage state
  await page.context().storageState({ path: authFile });
  console.log(`Authentication state saved to ${authFile}`);
});
