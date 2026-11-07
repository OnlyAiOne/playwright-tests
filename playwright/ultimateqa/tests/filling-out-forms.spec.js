// ---------------------------------------------------------------------------
// Filling out forms tests
//
// Purpose:    Fills both practice forms and checks the required-field error on an empty
//             submit.
// Stories:    OWA-40 Fill-out-forms page validates and accepts input (4 tests)
// Pages:      https://ultimateqa.com/filling-out-forms/
// Locators:   playwright/ultimateqa/pages/filling-out-forms.page.js
// Test data:  sampleData below (fictional)
// Run:        npx playwright test --project=ultimateqa filling-out-forms
// Safety:     beforeEach blocks every POST to ultimateqa.com (../safety.js), so no form is
//             ever sent. Do not remove that call. The CAPTCHA is only checked for being
//             present; tests never answer it.
// ---------------------------------------------------------------------------

const { test, expect } = require('@playwright/test');

const { BASE_URL } = require('../env');
const { fillingOutFormsPage } = require('../pages');
const { blockFormPosts } = require('../safety');
const { openPage } = require('../page-ready');

const sampleData = {
  name: 'Test User',
  message: 'Hello, this is a sample message from an automated Playwright test.',
};

test.describe('UltimateQA - Filling out forms', () => {
  // The site can be slow to finish loading all its images and scripts
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await blockFormPosts(page);
    await openPage(page, BASE_URL + fillingOutFormsPage.path);
  });

  test('OWA-40: shows two forms with Name, Message and Submit', async ({ page }) => {
    const forms = fillingOutFormsPage(page);
    await expect(page).toHaveTitle(/Filling Out Forms/);
    await expect(forms.forms).toHaveCount(2);

    for (const index of [0, 1]) {
      const form = forms.form(index);
      await expect(form.nameInput).toBeVisible();
      await expect(form.messageInput).toBeVisible();
      await expect(form.submitButton).toBeVisible();
    }
  });

  test('OWA-40: fills both forms with sample data (not sent)', async ({ page }) => {
    const forms = fillingOutFormsPage(page);

    for (const index of [0, 1]) {
      const form = forms.form(index);
      await form.nameInput.fill(sampleData.name);
      await form.messageInput.fill(sampleData.message);
      await expect(form.nameInput).toHaveValue(sampleData.name);
      await expect(form.messageInput).toHaveValue(sampleData.message);
    }
  });

  test('OWA-40: shows a required-field error when submitted empty', async ({ page }) => {
    const form = fillingOutFormsPage(page).form(0);

    await form.submitButton.click();

    // Divi checks the fields in the browser and lists the missing ones
    await expect(form.errorMessage).toContainText(/fill in the following fields/i);
    await expect(form.errorMessage).toContainText('Name');
    await expect(form.errorMessage).toContainText('Message');
  });

  test('OWA-40: the second form has a CAPTCHA question', async ({ page }) => {
    await expect(fillingOutFormsPage(page).form(1).captchaInput).toBeVisible();
  });
});
