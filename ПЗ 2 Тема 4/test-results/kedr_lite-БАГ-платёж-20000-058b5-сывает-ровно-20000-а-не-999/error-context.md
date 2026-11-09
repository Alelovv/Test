# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kedr_lite.spec.ts >> БАГ: платёж 20000 ₽ через резервного провайдера списывает ровно 20000, а не 999
- Location: tests\kedr_lite.spec.ts:44:5

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: locator('#total')
Expected pattern: /^20\s?000$/
Received string:  "999"
Timeout: 5000ms

Call log:
  - Expect "toHaveText" locator('#total') with timeout 5000ms
  - waiting for locator('#total')
    14 × locator resolved to <b id="total">999</b>
       - unexpected value "999"

```

```yaml
- text: "999"
```

# Test source

```ts
  1  | import { test, expect, Page } from '@playwright/test';
  2  | import path from 'path';
  3  | import { pathToFileURL } from 'url';
  4  | 
  5  | const APP_URL: string = pathToFileURL(path.resolve(__dirname, '..', 'kedr_lite.html')).href;
  6  | 
  7  | test.beforeEach(async ({ page }) => {
  8  |   // Фиксируем Math.random: провайдеры не «падают» и ответ не теряется.
  9  |   // Так результат не зависит от случайных сбоев, а тесты детерминированы.
  10 |   await page.addInitScript(() => {
  11 |     Math.random = () => 0.99;
  12 |   });
  13 |   await page.goto(APP_URL);
  14 | });
  15 | 
  16 | async function pay(page: Page, amount: string): Promise<void> {
  17 |   await page.locator('#amount').fill(amount);
  18 |   await page.locator('#pay').click();
  19 | }
  20 | 
  21 | async function waitForResult(page: Page): Promise<void> {
  22 |   await expect(page.locator('#status')).not.toHaveText(/Обработка|^$/, { timeout: 15_000 });
  23 | }
  24 | 
  25 | // ЗЕЛЁНЫЙ: штатный сценарий
  26 | test('штатный платёж 500 ₽ проходит', async ({ page }) => {
  27 |   await pay(page, '500');
  28 |   await waitForResult(page);
  29 | 
  30 |   await expect(page.locator('#status')).toContainText('✅ Оплата прошла');
  31 |   await expect(page.locator('#total')).toHaveText('500');
  32 | });
  33 | 
  34 | // КРАСНЫЙ 1: сумма больше лимита обоих провайдеров
  35 | test('БАГ: 100000 ₽ (выше лимита всех провайдеров) не должен показывать «Оплата прошла»', async ({ page }) => {
  36 |   await pay(page, '100000');
  37 |   await waitForResult(page);
  38 | 
  39 |   await expect(page.locator('#status')).not.toContainText('Оплата прошла');
  40 |   await expect(page.locator('#total')).toHaveText('0');
  41 | });
  42 | 
  43 | // КРАСНЫЙ 2: резервный провайдер списывает фиксированные 999 ₽
  44 | test('БАГ: платёж 20000 ₽ через резервного провайдера списывает ровно 20000, а не 999', async ({ page }) => {
  45 |   await pay(page, '20000'); // выше лимита основного (10000) -> фолбэк на резервный
  46 |   await waitForResult(page);
  47 | 
  48 |   await expect(page.locator('#status')).toContainText('Оплата прошла');
> 49 |   await expect(page.locator('#total')).toHaveText(/^20\s?000$/);
     |                                        ^ Error: expect(locator).toHaveText(expected) failed
  50 | });
  51 | 
  52 | // КРАСНЫЙ 3: нечисловой ввод
  53 | test('БАГ: ввод «abc» не должен приводить к успешной оплате', async ({ page }) => {
  54 |   await pay(page, 'abc');
  55 |   await waitForResult(page);
  56 | 
  57 |   await expect(page.locator('#status')).not.toContainText('Оплата прошла');
  58 |   await expect(page.locator('#status')).not.toContainText('NaN');
  59 | });
  60 | 
  61 | // КРАСНЫЙ 4: двойной клик
  62 | test('БАГ: двойное нажатие «Оплатить» списывает сумму один раз', async ({ page }) => {
  63 |   await page.locator('#amount').fill('500');
  64 |   await page.locator('#pay').click();
  65 |   await page.waitForTimeout(50); // разные ключи идемпотентности
  66 |   await page.locator('#pay').click();
  67 | 
  68 |   await expect(page.locator('#status')).toContainText('✅ Оплата прошла', { timeout: 15_000 });
  69 |   await page.waitForTimeout(3000); // дождаться завершения второго платежа
  70 | 
  71 |   await expect(page.locator('#total')).toHaveText('500');
  72 | });
  73 | 
```