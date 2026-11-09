# Автотесты Playwright для «Кедр-lite»

Файл тестов: `tests/kedr\_lite.spec.js`. Запуск: `npx playwright test`.
`Math.random` в тестах зафиксирован (`0.99`), поэтому сбои провайдеров и «потеря ответа» не влияют на результат: тесты детерминированы.

## Результат прогона

|№|Тест|Результат|
|-|-|-|
|1|штатный платёж 500 ₽ проходит|✅ passed|
|2|БАГ: 100000 ₽ не должен показывать «Оплата прошла»|❌ failed (ожидаемо)|
|3|БАГ: 20000 ₽ через резервного списывает 20000, а не 999|❌ failed (ожидаемо)|
|4|БАГ: ввод «abc» не должен приводить к успешной оплате|❌ failed (ожидаемо)|
|5|БАГ: двойной клик «Оплатить» списывает сумму один раз|❌ failed (ожидаемо)|

1 passed, 4 failed.

## Какой баг ловит каждый красный тест

* **№2 — сумма выше лимита всех провайдеров.** Для 100000 ₽ приложение пишет в журнал «нет доступного провайдера», но в статусе показывает «✅ Оплата прошла». Ожидание: ошибка, «Всего списано» = 0. Факт: статус «✅ Оплата прошла».
* **№3 — резервный провайдер списывает 999 ₽.** Платёж 20000 ₽ отклоняется основным (лимит 10000) и уходит на резервного, который списывает фиксированные 999 ₽, а пользователю показывают успех. Ожидание: «Всего списано» = 20 000. Факт: 999.
* **№4 — нечисловой ввод.** Для «abc» (`Number('abc') = NaN`) нет валидации, статус «✅ Оплата прошла: NaN ₽». Ожидание: отказ.
* **№5 — двойной клик.** Нет защиты от повторной отправки: два клика запускают два независимых платежа с разными ключами идемпотентности. Ожидание: «Всего списано» = 500. Факт: 1000.

(Здесь можно добавить ссылки на ваши баг-репорты из практики 9.)

## Вывод консоли

npx playwright test



Running 5 tests using 1 worker



&#x20; ✓  1 tests\\kedr\_lite.spec.ts:26:5 › штатный платёж 500 ₽ проходит (2.4s)

&#x20; ✘  2 tests\\kedr\_lite.spec.ts:35:5 › БАГ: 100000 ₽ (выше лимита всех провайдеров) не должен показывать «Оплата прошла» (5.4s)

&#x20; ✘  3 tests\\kedr\_lite.spec.ts:44:5 › БАГ: платёж 20000 ₽ через резервного провайдера списывает ровно 20000, а не 999 (10.3s)

&#x20; ✘  4 tests\\kedr\_lite.spec.ts:53:5 › БАГ: ввод «abc» не должен приводить к успешной оплате (6.7s)

&#x20; ✘  5 tests\\kedr\_lite.spec.ts:62:5 › БАГ: двойное нажатие «Оплатить» списывает сумму один раз (0ms)





&#x20; 1) tests\\kedr\_lite.spec.ts:35:5 › БАГ: 100000 ₽ (выше лимита всех провайдеров) не должен показывать «Оплата прошла» 



&#x20;   Error: expect(locator).not.toContainText(expected) failed



&#x20;   Locator: locator('#status')

&#x20;   Expected substring: not "Оплата прошла"

&#x20;   Received string: "✅ Оплата прошла"

&#x20;   Timeout: 5000ms



&#x20;   Call log:

&#x20;     - Expect "not toContainText" locator('#status') with timeout 5000ms

&#x20;     - waiting for locator('#status')

&#x20;       13 × locator resolved to <span id="status" class="status ok">✅ Оплата прошла</span>

&#x20;          - unexpected value "✅ Оплата прошла"





&#x20;     37 |   await waitForResult(page);

&#x20;     38 |

&#x20;   > 39 |   await expect(page.locator('#status')).not.toContainText('Оплата прошла');

&#x20;        |                                             ^

&#x20;     40 |   await expect(page.locator('#total')).toHaveText('0');

&#x20;     41 | });

&#x20;     42 |

&#x20;       at C:\\Users\\alepa\\Desktop\\tests\\tests\\kedr\_lite.spec.ts:39:45



&#x20;   Error Context: test-results\\kedr\_lite-БАГ-100000-₽-выш-7b412--показывать-«Оплата-прошла»\\error-context.md



&#x20; 2) tests\\kedr\_lite.spec.ts:44:5 › БАГ: платёж 20000 ₽ через резервного провайдера списывает ровно 20000, а не 999 



&#x20;   Error: expect(locator).toHaveText(expected) failed



&#x20;   Locator: locator('#total')

&#x20;   Expected pattern: /^20\\s?000$/

&#x20;   Received string:  "999"

&#x20;   Timeout: 5000ms



&#x20;   Call log:

&#x20;     - Expect "toHaveText" locator('#total') with timeout 5000ms

&#x20;     - waiting for locator('#total')

&#x20;       14 × locator resolved to <b id="total">999</b>

&#x20;          - unexpected value "999"





&#x20;     47 |

&#x20;     48 |   await expect(page.locator('#status')).toContainText('Оплата прошла');

&#x20;   > 49 |   await expect(page.locator('#total')).toHaveText(/^20\\s?000$/);

&#x20;        |                                        ^

&#x20;     50 | });

&#x20;     51 |

&#x20;     52 | // КРАСНЫЙ 3: нечисловой ввод

&#x20;       at C:\\Users\\alepa\\Desktop\\tests\\tests\\kedr\_lite.spec.ts:49:40



&#x20;   Error Context: test-results\\kedr\_lite-БАГ-платёж-20000-058b5-сывает-ровно-20000-а-не-999\\error-context.md



&#x20; 3) tests\\kedr\_lite.spec.ts:53:5 › БАГ: ввод «abc» не должен приводить к успешной оплате ──────────



&#x20;   Error: expect(locator).not.toContainText(expected) failed



&#x20;   Locator: locator('#status')

&#x20;   Expected substring: not "Оплата прошла"

&#x20;   Received string: "✅ Оплата прошла: NaN ₽"

&#x20;   Timeout: 5000ms



&#x20;   Call log:

&#x20;     - Expect "not toContainText" locator('#status') with timeout 5000ms

&#x20;     - waiting for locator('#status')

&#x20;       14 × locator resolved to <span id="status" class="status ok">✅ Оплата прошла: NaN ₽</span>

&#x20;          - unexpected value "✅ Оплата прошла: NaN ₽"





&#x20;     55 |   await waitForResult(page);

&#x20;     56 |

&#x20;   > 57 |   await expect(page.locator('#status')).not.toContainText('Оплата прошла');

&#x20;        |                                             ^

&#x20;     58 |   await expect(page.locator('#status')).not.toContainText('NaN');

&#x20;     59 | });

&#x20;     60 |

&#x20;       at C:\\Users\\alepa\\Desktop\\tests\\tests\\kedr\_lite.spec.ts:57:45



&#x20;   Error Context: test-results\\kedr\_lite-БАГ-ввод-«abc»-н-e4be8-приводить-к-успешной-оплате\\error-context.md



&#x20; 4) tests\\kedr\_lite.spec.ts:62:5 › БАГ: двойное нажатие «Оплатить» списывает сумму один раз ───────



&#x20;   Error: Cannot find module 'C:\\Users\\alepa\\Desktop\\tests\\playwright.config.ts'

&#x20;   Require stack:

&#x20;   - C:\\Users\\alepa\\Desktop\\tests\\node\_modules\\playwright\\lib\\common\\index.js

&#x20;   - C:\\Users\\alepa\\Desktop\\tests\\node\_modules\\playwright\\lib\\worker\\workerProcessEntry.js



&#x20; 4 failed

&#x20;   tests\\kedr\_lite.spec.ts:35:5 › БАГ: 100000 ₽ (выше лимита всех провайдеров) не должен показывать «Оплата прошла» 

&#x20;   tests\\kedr\_lite.spec.ts:44:5 › БАГ: платёж 20000 ₽ через резервного провайдера списывает ровно 20000, а не 999 

&#x20;   tests\\kedr\_lite.spec.ts:53:5 › БАГ: ввод «abc» не должен приводить к успешной оплате ───────────

&#x20;   tests\\kedr\_lite.spec.ts:62:5 › БАГ: двойное нажатие «Оплатить» списывает сумму один раз ────────

&#x20; 1 passed (28.8s)



To open last HTML report run:



&#x20; npx playwright show-report



