import { test, expect } from '@playwright/test';

test.describe('Профиль пользователя', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="text"]', 'testuser');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Войти")');
    await expect(page).toHaveURL('**/dashboard', { timeout: 10000 });
  });

  test('просмотр профиля', async ({ page }) => {
    await page.click('text=Профиль');
    
    await expect(page).toHaveURL('**/profile');
    await expect(page.locator('text=testuser')).toBeVisible();
  });

  test('обновление имени пользователя', async ({ page }) => {
    await page.click('text=Профиль');
    
    const editButton = page.locator('button:has-text("Редактировать")');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      const usernameInput = page.locator('input[name="username"]');
      await usernameInput.clear();
      await usernameInput.fill('updateduser');
      
      await page.click('button:has-text("Сохранить")');
      
      await expect(page.locator('text=/обновлен/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('обновление email', async ({ page }) => {
    await page.click('text=Профиль');
    
    const editButton = page.locator('button:has-text("Редактировать")');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      const emailInput = page.locator('input[name="email"]');
      await emailInput.clear();
      await emailInput.fill('newemail@example.com');
      
      await page.click('button:has-text("Сохранить")');
      
      await expect(page.locator('text=/обновлен/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('отображение статистики пользователя', async ({ page }) => {
    await page.click('text=Профиль');
    
    await expect(page.locator('text=/статистика/i')).toBeVisible();
    await expect(page.locator('text=/анализ/i')).toBeVisible();
  });
});
