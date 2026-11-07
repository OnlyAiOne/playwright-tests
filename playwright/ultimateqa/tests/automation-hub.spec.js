// ---------------------------------------------------------------------------
// Automation hub tests
//
// Purpose:    Checks the practice hub page and that every practice link opens its page.
// Stories:    OWA-38 Automation hub page lists all practice pages (3 tests)
// Pages:      https://ultimateqa.com/automation
// Locators:   playwright/ultimateqa/pages/automation.page.js
// Run:        npx playwright test --project=ultimateqa automation-hub
// Notes:      "Login automation" opens courses.ultimateqa.com, a different host.
// ---------------------------------------------------------------------------

const { test, expect } = require('@playwright/test');

const { BASE_URL } = require('../env');
const { automationPage } = require('../pages');
const { openPage } = require('../page-ready');

test.describe('UltimateQA - Automation hub', () => {
  // The site can be slow to finish loading all its images and scripts
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await openPage(page, BASE_URL + automationPage.path);
  });

  test('OWA-38: loads with the correct title and heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Automation Practice/);
    await expect(automationPage(page).heading).toBeVisible();
  });

  test('OWA-38: lists all 7 practice pages', async ({ page }) => {
    const hub = automationPage(page);
    for (const { name } of automationPage.practiceLinks) {
      await expect(hub.practiceLink(name), name).toBeVisible();
    }
  });

  test('OWA-38: each practice link opens its page', async ({ page }) => {
    // Seven page loads in one test
    test.setTimeout(180000);
    const hub = automationPage(page);

    for (const { name, url } of automationPage.practiceLinks) {
      await test.step(name, async () => {
        await openPage(page, BASE_URL + automationPage.path);
        await hub.practiceLink(name).click();
        await expect(page).toHaveURL(url);
      });
    }
  });
});
