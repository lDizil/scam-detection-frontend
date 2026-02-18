import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate as user', async ({ page }) => {
  await page.goto('/auth');
  await page.fill('input[type="text"]', 'testuser');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Войти")');
  
  await page.waitForURL('**/dashboard');
  
  await page.context().storageState({ path: authFile });
});
