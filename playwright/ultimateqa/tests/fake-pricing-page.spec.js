// ---------------------------------------------------------------------------
// Fake pricing page tests
//
// Purpose:    Checks the three pricing plans, the FAQ section and the closing call to
//             action.
// Stories:    OWA-44 Fake pricing page plans and FAQ (3 tests)
// Pages:      https://ultimateqa.com/fake-pricing-page
// Locators:   playwright/ultimateqa/pages/fake-pricing.page.js
// Run:        npx playwright test --project=ultimateqa fake-pricing-page
// Notes:      Purchase buttons are checked for being shown, never clicked.
// ---------------------------------------------------------------------------

const { test, expect } = require('@playwright/test');

const { BASE_URL } = require('../env');
const { pricingPage } = require('../pages');

test.describe('UltimateQA - Fake pricing page', () => {
  // The site can be slow to finish loading all its images and scripts
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + pricingPage.path, { waitUntil: 'domcontentloaded' });
  });

  test('OWA-44: loads with the plans heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Fake pricing page/i);
    await expect(pricingPage(page).heading('Pick a Plan that Works for Your Business Model')).toBeVisible();
  });

  test('OWA-44: shows three plans with prices and Purchase buttons', async ({ page }) => {
    const pricing = pricingPage(page);
    for (const { name, price } of pricingPage.plans) {
      const plan = pricing.plan(name);
      await expect(plan.root, name).toBeVisible();
      await expect(plan.price, name).toHaveText(price);
      await expect(plan.purchaseButton, name).toBeVisible();
    }
  });

  test('OWA-44: shows the FAQ and the closing call to action', async ({ page }) => {
    const pricing = pricingPage(page);
    await expect(pricing.heading('Frequently Asked Questions')).toBeVisible();
    await expect(pricing.heading('Ready To Get Started?')).toBeVisible();
    await expect(pricing.button('Browse Docs')).toBeVisible();
    await expect(pricing.button('Sign Up Today')).toBeVisible();
  });
});
