import { type Locator, type Page } from '@playwright/test';

/**
 * Page Object главной страницы https://vladivostok.hh.ru/
 * Здесь описаны все элементы страницы и действия с ней.
 * Тесты обращаются к элементам только через этот класс.
 */
export class MainPage {
  readonly page: Page;

  // Баннер cookies
  readonly cookieAcceptButton: Locator;

  // Шапка
  readonly loginButton: Locator;
  readonly createResumeButton: Locator;
  readonly servicesLink: Locator;

  // Блок поиска
  readonly searchHeading: Locator;
  readonly searchInput: Locator;

  // Основное содержимое
  readonly companiesLink: Locator;
  readonly popularHeading: Locator;
  readonly professionsLink: Locator;

  // Футер
  readonly footerPostVacancyLink: Locator;
  readonly copyright: Locator;

  constructor(page: Page) {
    this.page = page;

    this.cookieAcceptButton = page.getByRole('button', { name: 'Понятно' });

    // В шапке «Войти» и «Создать резюме» могут быть и ссылками, и кнопками.
    this.loginButton = page
      .getByRole('link', { name: 'Войти', exact: true })
      .or(page.getByRole('button', { name: 'Войти', exact: true }))
      .first();
    this.createResumeButton = page
      .getByRole('link', { name: 'Создать резюме' })
      .or(page.getByRole('button', { name: 'Создать резюме' }))
      .first();
    this.servicesLink = page.getByRole('link', { name: 'Сервисы', exact: true }).first();

    this.searchHeading = page.getByRole('heading', { name: /Поиск работы/ }).first();
    this.searchInput = page
      .locator('[data-qa="search-input"]')
      .or(page.getByPlaceholder(/Профессия, должность, компания/))
      .first();

    this.companiesLink = page.getByRole('link', {
      name: 'Работа в компаниях Дальнего Востока',
    });
    this.popularHeading = page.getByRole('heading', { name: 'Популярное' });
    this.professionsLink = page.getByRole('link', {
      name: 'Работа по профессиям во Владивостоке',
    });

    this.footerPostVacancyLink = page.getByRole('link', { name: 'Размещение вакансий' }).first();
    this.copyright = page.getByText(/Хэдхантер/).first();
  }

  /** Открывает главную страницу и закрывает баннер cookies, если он есть. */
  async open(): Promise<void> {
    // Счётчики и трекеры тормозят загрузку и для проверок не нужны.
    await this.page.route(
      /(mc\.yandex\.ru|top-fwz1\.mail\.ru|top\.mail\.ru|vk\.com\/rtrg)/,
      (route) => route.abort(),
    );
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.acceptCookies();
  }

  /** Нажимает «Понятно» на баннере cookies; если баннера нет — ничего не делает. */
  async acceptCookies(): Promise<void> {
    await this.cookieAcceptButton.click({ timeout: 3_000 }).catch(() => {});
  }

  /** Прокручивает страницу в самый низ (футер может дорисовываться при скролле). */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }
}
