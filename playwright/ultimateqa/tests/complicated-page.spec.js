// ---------------------------------------------------------------------------
// Complicated page tests
//
// Purpose:    Checks a busy page full of repeated elements: a block of identical buttons,
//             social media links, several contact forms and login widgets.
// Stories:    OWA-42 Complicated page sections render and work (6 tests)
// Pages:      https://ultimateqa.com/complicated-page
// Locators:   playwright/ultimateqa/pages/complicated.page.js
// Test data:  sampleData below (fictional)
// Run:        npx playwright test --project=ultimateqa complicated-page
// Safety:     beforeEach blocks every POST to ultimateqa.com (../safety.js), so no contact
//             form or login is ever sent. Do not remove that call. CAPTCHAs are only
//             checked for being present; tests never answer them.
// Notes:      The login widgets' field ids change on every page load; the locators match
//             them by type and placeholder instead.
// ---------------------------------------------------------------------------

const { test, expect } = require('@playwright/test');

const { BASE_URL } = require('../env');
const { complicatedPage } = require('../pages');
const { blockFormPosts } = require('../safety');

const sampleData = {
  name: 'Test User',
  email: 'test.user@example.com',
  message: 'Hello, this is a sample message from an automated Playwright test.',
};

test.describe('UltimateQA - Complicated page', () => {
  // The site can be slow to finish loading all its images and scripts
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await blockFormPosts(page);
    // Nothing here is clicked, so the page's delayed scripts are not needed (see ../page-ready.js)
    await page.goto(BASE_URL + complicatedPage.path, { waitUntil: 'domcontentloaded' });
  });

  test('OWA-42: loads with its three sections', async ({ page }) => {
    const complicated = complicatedPage(page);
    await expect(page).toHaveTitle(/Complicated Page/);
    for (const name of ['Section of Buttons', 'Section of Social Media Follows', 'Section of Random Stuff']) {
      await expect(complicated.sectionHeading(name), name).toBeVisible();
    }
  });

  test('OWA-42: shows 12 buttons in the section of buttons', async ({ page }) => {
    await expect(complicatedPage(page).plainButtons).toHaveCount(12);
  });

  test('OWA-42: every social media group links to Twitter and Facebook', async ({ page }) => {
    const complicated = complicatedPage(page);
    const twitterCount = await complicated.twitterLinks.count();

    expect(twitterCount).toBeGreaterThan(0);
    await expect(complicated.facebookLinks).toHaveCount(twitterCount);

    for (const links of [complicated.twitterLinks, complicated.facebookLinks]) {
      for (const link of await links.all()) {
        await expect(link).toHaveAttribute('href', /\S/);
      }
    }
  });

  test('OWA-42: fills each contact form with sample data (not sent)', async ({ page }) => {
    const complicated = complicatedPage(page);
    const count = await complicated.contactForms.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index++) {
      const form = complicated.contactForm(index);
      await form.nameInput.fill(sampleData.name);
      await form.emailInput.fill(sampleData.email);
      await form.messageInput.fill(sampleData.message);

      await expect(form.nameInput).toHaveValue(sampleData.name);
      await expect(form.emailInput).toHaveValue(sampleData.email);
      await expect(form.messageInput).toHaveValue(sampleData.message);
      await expect(form.submitButton).toBeVisible();
    }
  });

  test('OWA-42: each login widget has username, password and Login', async ({ page }) => {
    const loginForms = complicatedPage(page).loginForms;
    expect(await loginForms.count()).toBeGreaterThan(0);

    for (const form of await loginForms.all()) {
      await expect(form.getByPlaceholder('Username')).toBeVisible();
      await expect(form.locator('input[type="password"]')).toBeVisible();
      await expect(form.getByRole('button', { name: 'Login' })).toBeVisible();
    }
  });

  test('OWA-42: each contact form has a CAPTCHA question', async ({ page }) => {
    const complicated = complicatedPage(page);
    const count = await complicated.contactForms.count();

    for (let index = 0; index < count; index++) {
      await expect(complicated.contactForm(index).captchaInput).toBeVisible();
    }
  });
});
