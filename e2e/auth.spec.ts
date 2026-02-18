import { test, expect } from '@playwright/test';

test.describe('Аутентификация', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('успешная регистрация нового пользователя', async ({ page }) => {
    await page.click('text=Начать работу');
    
    await page.waitForURL('**/auth');
    
    await page.click('text=Регистрация');
    
    const timestamp = Date.now();
    await page.fill('input[name="username"]', `testuser${timestamp}`);
    await page.fill('input[name="email"]', `test${timestamp}@example.com`);
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[placeholder*="Повторите"]', 'password123');
    
    await page.click('button:has-text("Зарегистрироваться")');
    
    await expect(page).toHaveURL('**/dashboard', { timeout: 10000 });
    
    await expect(page.locator('text=Добро пожаловать')).toBeVisible({ timeout: 5000 });
  });

  test('успешный вход существующего пользователя', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('input[type="text"]', 'testuser');
    await page.fill('input[type="password"]', 'password123');
    
    await page.click('button:has-text("Войти")');
    
    await expect(page).toHaveURL('**/dashboard', { timeout: 10000 });
  });

  test('ошибка при неверном пароле', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('input[type="text"]', 'testuser');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    await page.click('button:has-text("Войти")');
    
    await expect(page.locator('text=/неверн/i')).toBeVisible({ timeout: 5000 });
  });

  test('валидация пустых полей при входе', async ({ page }) => {
    await page.goto('/auth');
    
    await page.click('button:has-text("Войти")');
    
    await expect(page.locator('text=/заполните/i')).toBeVisible({ timeout: 5000 });
  });

  test('валидация несовпадающих паролей при регистрации', async ({ page }) => {
    await page.goto('/auth');
    
    await page.click('text=Регистрация');
    
    await page.fill('input[name="username"]', 'newuser');
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[placeholder*="Повторите"]', 'password456');
    
    await page.click('button:has-text("Зарегистрироваться")');
    
    await expect(page.locator('text=/пароли не совпадают/i')).toBeVisible({ timeout: 5000 });
  });

  test('переключение между вкладками входа и регистрации', async ({ page }) => {
    await page.goto('/auth');
    
    await expect(page.locator('button:has-text("Войти")')).toBeVisible();
    
    await page.click('text=Регистрация');
    
    await expect(page.locator('button:has-text("Зарегистрироваться")')).toBeVisible();
    
    await page.click('text=Вход');
    
    await expect(page.locator('button:has-text("Войти")')).toBeVisible();
  });
});
