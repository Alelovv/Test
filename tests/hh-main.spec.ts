import { test, expect } from '@playwright/test';
import { MainPage } from '../pages/MainPage';


test.describe('vladivostok.hh.ru — главная страница', () => {
  let mainPage: MainPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    await mainPage.open();
  });

  test('1. Кнопка/ссылка «Войти» в шапке', async () => {
    await expect(mainPage.loginButton).toBeVisible();
  });

  test('2. Кнопка/ссылка «Создать резюме» в шапке', async () => {
    await expect(mainPage.createResumeButton).toBeVisible();
  });

  test('3. Ссылка «Сервисы» в шапке', async () => {
    await expect(mainPage.servicesLink).toBeVisible();
    await expect(mainPage.servicesLink).toHaveAttribute('href', /\/services/);
  });

  test('4. Поле поиска «Профессия, должность, компания»', async () => {
    await expect(mainPage.searchInput).toBeVisible();
    await expect(mainPage.searchInput).toBeEditable();
  });

  test('5. Заголовок «Поиск работы»', async () => {
    await expect(mainPage.searchHeading).toBeVisible();
  });

  test('6. Ссылка «Работа в компаниях Дальнего Востока»', async () => {
    await expect(mainPage.companiesLink).toBeVisible();
    await expect(mainPage.companiesLink).toHaveAttribute('href', /\/employers_company/);
  });

  test('7. Заголовок раздела «Популярное»', async () => {
    await expect(mainPage.popularHeading).toBeVisible();
  });

  test('8. Ссылка «Работа по профессиям во Владивостоке»', async () => {
    await expect(mainPage.professionsLink).toBeVisible();
    await expect(mainPage.professionsLink).toHaveAttribute('href', /\/catalog\/vacancies/);
  });

  test('9. Ссылка «Размещение вакансий» в футере', async () => {
    await mainPage.footerPostVacancyLink.scrollIntoViewIfNeeded();
    await expect(mainPage.footerPostVacancyLink).toBeVisible();
    await expect(mainPage.footerPostVacancyLink).toHaveAttribute('href', /\/employer/);
  });

    test('10. Копирайт «ООО «Хэдхантер»» в футере', async () => {
    await mainPage.scrollToBottom();
    await expect(mainPage.copyright).toBeVisible();
  });

  test('11. Ввод текста в поле поиска', async () => {
    const query = 'Тестировщик';
    await mainPage.searchInput.fill(query);
    await expect(mainPage.searchInput).toHaveValue(query);
  });
});
