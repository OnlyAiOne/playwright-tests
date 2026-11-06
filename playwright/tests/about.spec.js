// ---------------------------------------------------------------------------
// About page tests
//
// Purpose:    Checks the About page title, headings, animated stats counters,
//             lower sections and the way back to the home page.
// Stories:    OWA-33 About (5 tests)
// Pages:      https://onlypps.com/about.html
// Locators:   playwright/pages/about.page.js, playwright/pages/site-header.js
// Run:        npx playwright test playwright/tests/about.spec.js
// Notes:      Stats start at 0 and count up only when scrolled into view, so the test
//             scrolls first and waits up to 15 seconds for the final values.
//             Lower sections fade in on scroll; each is scrolled into view before checking.
// ---------------------------------------------------------------------------

const { test, expect } = require('@playwright/test');

const { BASE_URL } = require('../env');
const { aboutPage, siteHeader } = require('../pages');

const stats = [
  ['1000', 'Employees Managed'],
  ['150', 'Client Companies'],
  ['8', 'Industries Served'],
  ['100', 'Compliance Support'],
];

test.describe('Only Peopleplus Solution - About page', () => {
  // The site can be slow to finish loading all its images and scripts
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + aboutPage.path, { waitUntil: 'domcontentloaded' });
  });

  test('OWA-33: loads with the About Us title', async ({ page }) => {
    await expect(page).toHaveTitle(/^About Us/);
  });

  test('OWA-33: shows the banner and main headings', async ({ page }) => {
    const about = aboutPage(page);
    for (const name of [
      'About Us',
      'Trusted HR Consultancy & Workforce Solutions in Chennai',
      'Professional HR, Payroll & Recruitment Services in Chennai',
    ]) {
      await expect(about.heading(name)).toBeVisible();
    }
  });

  test('OWA-33: counts the stats up to their final values', async ({ page }) => {
    const about = aboutPage(page);
    // The counters start at 0 and animate once they scroll into view
    await about.statLabel(stats[0][1]).scrollIntoViewIfNeeded();
    for (const [value, label] of stats) {
      await expect(about.statLabel(label)).toBeVisible();
      await expect(about.statValue(value)).toBeVisible({ timeout: 15000 });
    }
  });

  test('OWA-33: shows the industries, expertise and contact sections', async ({ page }) => {
    const about = aboutPage(page);
    for (const name of [
      'Industries Using Our HR Consultancy & Payroll Outsourcing Services',
      'Expert HR Consultancy & Payroll Outsourcing in Chennai',
      'Get in Touch With Our Payroll & Compliance Experts',
    ]) {
      // Sections fade in (hidden until scrolled into view)
      const section = about.section(name);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();
    }
  });

  test('OWA-33: returns to the home page from the menu', async ({ page }) => {
    await siteHeader(page).menuLink('Home', { exact: true }).click();
    await expect(page).toHaveURL(/index\.html|onlypps\.com\/?$/);
  });
});
