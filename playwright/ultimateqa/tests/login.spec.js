// ---------------------------------------------------------------------------
// Courses sign-in page tests
//
// Purpose:    Checks the courses sign-in form and its password-recovery and sign-up
//             links. Form checks only.
// Stories:    OWA-45 Courses login page form (3 tests)
// Pages:      https://courses.ultimateqa.com/users/sign_in (COURSES_URL)
// Locators:   playwright/ultimateqa/pages/login.page.js
// Test data:  sampleData below (fictional, not a real account)
// Run:        npx playwright test --project=ultimateqa login
//             npx playwright test --project=ultimateqa --grep-invert @external   (skip it)
// Safety:     The tests never press "Sign in", and the POST block (../safety.js) is on as
//             a second guard. No real credentials are used. Do not remove either.
// Notes:      Tagged @external: the courses site is a separate third-party host and may
//             block automated browsers, so CI can skip it with --grep-invert @external.
// ---------------------------------------------------------------------------

const { test, expect } = require('@playwright/test');

const { COURSES_URL } = require('../env');
const { loginPage } = require('../pages');
const { blockFormPosts } = require('../safety');

const sampleData = {
  email: 'test.user@example.com',
  password: 'not-a-real-password',
};

test.describe('UltimateQA - Courses sign-in page', { tag: '@external' }, () => {
  // The site can be slow to finish loading all its images and scripts
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await blockFormPosts(page);
    await page.goto(COURSES_URL + loginPage.path, { waitUntil: 'domcontentloaded' });
  });

  test('OWA-45: loads the sign-in page', async ({ page }) => {
    await expect(page).toHaveTitle(/Sign In/);
    await expect(loginPage(page).heading).toBeVisible();
  });

  test('OWA-45: shows the sign-in form and keeps typed values (not signed in)', async ({ page }) => {
    const login = loginPage(page);

    await expect(login.emailInput).toBeVisible();
    await expect(login.passwordInput).toHaveAttribute('type', 'password');
    await expect(login.rememberMe).toBeAttached();
    await expect(login.signInButton).toBeVisible();

    await login.emailInput.fill(sampleData.email);
    await login.passwordInput.fill(sampleData.password);
    await expect(login.emailInput).toHaveValue(sampleData.email);
    await expect(login.passwordInput).toHaveValue(sampleData.password);
  });

  test('OWA-45: links to password recovery and sign-up', async ({ page }) => {
    const login = loginPage(page);
    await expect(login.forgotPasswordLink).toHaveAttribute('href', /\/users\/password\/new/);
    await expect(login.createAccountLink).toHaveAttribute('href', /\/users\/sign_up/);
  });
});
