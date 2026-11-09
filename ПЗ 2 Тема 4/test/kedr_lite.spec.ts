import { test, expect, Page } from '@playwright/test';
import path from 'path';
import { pathToFileURL } from 'url';

const APP_URL: string = pathToFileURL(path.resolve(__dirname, '..', 'kedr_lite.html')).href;

test.beforeEach(async ({ page }) => {
  // Фиксируем Math.random: провайдеры не «падают» и ответ не теряется.
  // Так результат не зависит от случайных сбоев, а тесты детерминированы.
  await page.addInitScript(() => {
    Math.random = () => 0.99;
  });
  await page.goto(APP_URL);
});

async function pay(page: Page, amount: string): Promise<void> {
  await page.locator('#amount').fill(amount);
  await page.locator('#pay').click();
}

async function waitForResult(page: Page): Promise<void> {
  await expect(page.locator('#status')).not.toHaveText(/Обработка|^$/, { timeout: 15_000 });
}

// ЗЕЛЁНЫЙ: штатный сценарий
test('штатный платёж 500 ₽ проходит', async ({ page }) => {
  await pay(page, '500');
  await waitForResult(page);

  await expect(page.locator('#status')).toContainText('✅ Оплата прошла');
  await expect(page.locator('#total')).toHaveText('500');
});

// КРАСНЫЙ 1: сумма больше лимита обоих провайдеров
test('БАГ: 100000 ₽ (выше лимита всех провайдеров) не должен показывать «Оплата прошла»', async ({ page }) => {
  await pay(page, '100000');
  await waitForResult(page);

  await expect(page.locator('#status')).not.toContainText('Оплата прошла');
  await expect(page.locator('#total')).toHaveText('0');
});

// КРАСНЫЙ 2: резервный провайдер списывает фиксированные 999 ₽
test('БАГ: платёж 20000 ₽ через резервного провайдера списывает ровно 20000, а не 999', async ({ page }) => {
  await pay(page, '20000'); // выше лимита основного (10000) -> фолбэк на резервный
  await waitForResult(page);

  await expect(page.locator('#status')).toContainText('Оплата прошла');
  await expect(page.locator('#total')).toHaveText(/^20\s?000$/);
});

// КРАСНЫЙ 3: нечисловой ввод
test('БАГ: ввод «abc» не должен приводить к успешной оплате', async ({ page }) => {
  await pay(page, 'abc');
  await waitForResult(page);

  await expect(page.locator('#status')).not.toContainText('Оплата прошла');
  await expect(page.locator('#status')).not.toContainText('NaN');
});

// КРАСНЫЙ 4: двойной клик
test('БАГ: двойное нажатие «Оплатить» списывает сумму один раз', async ({ page }) => {
  await page.locator('#amount').fill('500');
  await page.locator('#pay').click();
  await page.waitForTimeout(50); // разные ключи идемпотентности
  await page.locator('#pay').click();

  await expect(page.locator('#status')).toContainText('✅ Оплата прошла', { timeout: 15_000 });
  await page.waitForTimeout(3000); // дождаться завершения второго платежа

  await expect(page.locator('#total')).toHaveText('500');
});