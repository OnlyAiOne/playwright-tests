// ---------------------------------------------------------------------------
// Sprint 1 sample application tests
//
// Purpose:    Baseline tests for the sample application that changes every "sprint".
// Stories:    OWA-41 Sprint 1 sample app submits a first name (3 tests)
// Pages:      https://ultimateqa.com/sample-application-lifecycle-sprint-1/
// Locators:   playwright/ultimateqa/pages/sprint1-app.page.js
// Test data:  sampleData below (fictional)
// Run:        npx playwright test --project=ultimateqa sprint1-app
// Notes:      The form is a plain GET to the home page with ?firstname=..., so nothing is
//             stored on the site. The home page then redirects to home.ultimateqa.com
//             and drops the query, so the test checks the request the form sends.
// ---------------------------------------------------------------------------

const { test, expect } = require('@playwright/test');

const { BASE_URL } = require('../env');
const { sprint1Page } = require('../pages');
const { openPage } = require('../page-ready');

const sampleData = { firstName: 'Tester' };

test.describe('UltimateQA - Sample application, Sprint 1', () => {
  // The site can be slow to finish loading all its images and scripts
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await openPage(page, BASE_URL + sprint1Page.path);
  });

  test('OWA-41: shows the heading and the first name form', async ({ page }) => {
    const app = sprint1Page(page);
    await expect(page).toHaveTitle(/Sprint 1/);
    await expect(app.heading).toBeVisible();
    await expect(app.firstNameInput).toBeVisible();
    await expect(app.submitButton).toBeVisible();
  });

  test('OWA-41: submits the first name', async ({ page }) => {
    const app = sprint1Page(page);

    await app.firstNameInput.fill(sampleData.firstName);
    const submitted = page.waitForRequest(new RegExp(`[?&]firstname=${sampleData.firstName}\\b`));
    await app.submitButton.click();

    expect((await submitted).method()).toBe('GET');
  });

  test('OWA-41: links to the next sprint', async ({ page }) => {
    await expect(sprint1Page(page).nextSprintLink).toHaveAttribute(
      'href',
      /sample-application-lifecycle-sprint-2/
    );
  });
});
