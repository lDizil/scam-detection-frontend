import { test, expect } from '@playwright/test';

test.describe('Администрирование', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Войти")');
    await expect(page).toHaveURL('**/dashboard', { timeout: 10000 });
  });

  test('доступ к админ панели', async ({ page }) => {
    const adminLink = page.locator('text=Админ панель');
    await expect(adminLink).toBeVisible();
    
    await adminLink.click();
    
    await expect(page.locator('text=/управление пользователями/i')).toBeVisible({ timeout: 5000 });
  });

  test('просмотр списка пользователей', async ({ page }) => {
    await page.click('text=Админ панель');
    
    await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('tbody tr')).toHaveCount(1, { timeout: 5000 });
  });

  test('изменение роли пользователя', async ({ page }) => {
    await page.click('text=Админ панель');
    
    const roleSelect = page.locator('select').first();
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption('moderator');
      
      await expect(page.locator('text=/роль изменена/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('блокировка пользователя', async ({ page }) => {
    await page.click('text=Админ панель');
    
    const blockButton = page.locator('button:has-text("Заблокировать")').first();
    if (await blockButton.isVisible()) {
      await blockButton.click();
      
      await expect(page.locator('text=/заблокирован/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('разблокировка пользователя', async ({ page }) => {
    await page.click('text=Админ панель');
    
    const unblockButton = page.locator('button:has-text("Разблокировать")').first();
    if (await unblockButton.isVisible()) {
      await unblockButton.click();
      
      await expect(page.locator('text=/разблокирован/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('фильтрация пользователей по роли', async ({ page }) => {
    await page.click('text=Админ панель');
    
    const filterSelect = page.locator('select[name="roleFilter"]');
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption('user');
      
      await page.waitForTimeout(1000);
      
      const rows = page.locator('tbody tr');
      await expect(rows).toHaveCount(1, { timeout: 5000 });
    }
  });

  test('поиск пользователя по имени', async ({ page }) => {
    await page.click('text=Админ панель');
    
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      
      await page.waitForTimeout(1000);
      
      const rows = page.locator('tbody tr');
      await expect(rows.first()).toBeVisible();
    }
  });

  test('просмотр статистики системы', async ({ page }) => {
    await page.click('text=Админ панель');
    
    await expect(page.locator('text=/всего пользователей/i')).toBeVisible();
    await expect(page.locator('text=/активных/i')).toBeVisible();
  });
});
