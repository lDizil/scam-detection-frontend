/// <reference types="node" />
import { test, expect } from '@playwright/test';

test.describe('Анализ контента', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="text"]', 'testuser');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Войти")');
    await expect(page).toHaveURL('**/dashboard', { timeout: 10000 });
  });

  test('анализ текста на мошенничество', async ({ page }) => {
    await page.click('text=Анализ контента');
    
    const textArea = page.locator('textarea');
    await textArea.fill('Отправьте нам ваши данные карты для получения приза!');
    
    await page.click('button:has-text("Анализировать")');
    
    await expect(page.locator('text=/результат/i')).toBeVisible({ timeout: 10000 });
  });

  test('загрузка изображения для анализа', async ({ page }) => {
    await page.click('text=Анализ контента');
    
    const fileInput = page.locator('input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data'),
    });
    
    await expect(page.locator('text=/загружен/i')).toBeVisible({ timeout: 5000 });
  });

  test('просмотр истории анализов', async ({ page }) => {
    await page.click('text=История');
    
    await expect(page.locator('text=/история анализ/i')).toBeVisible();
  });

  test('фильтрация результатов по типу', async ({ page }) => {
    await page.click('text=История');
    
    const filterButton = page.locator('button:has-text("Фильтр")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.click('text=Мошенничество');
      
      await expect(page.locator('text=/применен/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('пагинация в истории', async ({ page }) => {
    await page.click('text=История');
    
    const nextButton = page.locator('button:has-text("Следующая")');
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      await nextButton.click();
      
      await expect(page).toHaveURL(/page=2/);
    }
  });
});
