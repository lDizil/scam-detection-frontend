import { test, expect } from '@playwright/test';

test.describe('Навигация и роли', () => {
  test('гостевой доступ - редирект на лендинг', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=ScamGuard')).toBeVisible();
  });

  test('защищенный маршрут - редирект на авторизацию', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page).toHaveURL('**/auth');
  });

  test('навигация после входа', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('input[type="text"]', 'testuser');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Войти")');
    
    await expect(page).toHaveURL('**/dashboard', { timeout: 10000 });
    
    await page.click('text=Профиль');
    await expect(page).toHaveURL('**/profile');
    
    await page.click('text=Панель управления');
    await expect(page).toHaveURL('**/dashboard');
  });

  test('выход из системы', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('input[type="text"]', 'testuser');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Войти")');
    
    await expect(page).toHaveURL('**/dashboard', { timeout: 10000 });
    
    await page.click('button:has-text("Выйти")');
    
    await expect(page).toHaveURL('/');
  });

  test('доступ к админ панели только для администратора', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('input[type="text"]', 'user');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Войти")');
    
    await expect(page).toHaveURL('**/dashboard', { timeout: 10000 });
    
    const adminLink = page.locator('text=Админ панель');
    await expect(adminLink).not.toBeVisible();
  });
});
