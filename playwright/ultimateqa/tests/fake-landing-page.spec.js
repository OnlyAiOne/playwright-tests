// ---------------------------------------------------------------------------
// Fake landing page tests
//
// Purpose:    Checks the landing page's hero heading, course categories, benefits and
//             call-to-action buttons.
// Stories:    OWA-43 Fake landing page content (3 tests)
// Pages:      https://ultimateqa.com/fake-landing-page
// Locators:   playwright/ultimateqa/pages/fake-landing.page.js
// Run:        npx playwright test --project=ultimateqa fake-landing-page
// Notes:      The call-to-action buttons all link to "#", so they are checked for being
//             shown, not clicked.
// ---------------------------------------------------------------------------

const { test, expect } = require('@playwright/test');

const { BASE_URL } = require('../env');
const { landingPage } = require('../pages');

test.describe('UltimateQA - Fake landing page', () => {
  // The site can be slow to finish loading all its images and scripts
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + landingPage.path, { waitUntil: 'domcontentloaded' });
  });

  test('OWA-43: loads with the hero heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Fake landing page/i);
    await expect(landingPage(page).heroHeading).toBeVisible();
  });

  test('OWA-43: shows all course categories', async ({ page }) => {
    const landing = landingPage(page);
    for (const name of landingPage.courseCategories) {
      await expect(landing.heading(name), name).toBeVisible();
    }
  });

  test('OWA-43: shows the benefits and call-to-action buttons', async ({ page }) => {
    const landing = landingPage(page);
    for (const name of landingPage.benefits) {
      await expect(landing.heading(name), name).toBeVisible();
    }
    for (const name of landingPage.callToActions) {
      await expect(landing.button(name), name).toBeVisible();
    }
  });
});
