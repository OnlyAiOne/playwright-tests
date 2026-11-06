const { test, expect } = require('@playwright/test');

const { BASE_URL } = require('../env');

const ABOUT_URL = BASE_URL + 'about.html';

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
    await page.goto(ABOUT_URL, { waitUntil: 'domcontentloaded' });
  });

  test('OWA-33: loads with the About Us title', async ({ page }) => {
    await expect(page).toHaveTitle(/^About Us/);
  });

  test('OWA-33: shows the banner and main headings', async ({ page }) => {
    for (const name of [
      'About Us',
      'Trusted HR Consultancy & Workforce Solutions in Chennai',
      'Professional HR, Payroll & Recruitment Services in Chennai',
    ]) {
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    }
  });

  test('OWA-33: counts the stats up to their final values', async ({ page }) => {
    // The counters start at 0 and animate once they scroll into view
    await page.getByText(stats[0][1], { exact: true }).scrollIntoViewIfNeeded();
    for (const [value, label] of stats) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { name: value, exact: true })).toBeVisible({ timeout: 15000 });
    }
  });

  test('OWA-33: shows the industries, expertise and contact sections', async ({ page }) => {
    for (const name of [
      'Industries Using Our HR Consultancy & Payroll Outsourcing Services',
      'Expert HR Consultancy & Payroll Outsourcing in Chennai',
      'Get in Touch With Our Payroll & Compliance Experts',
    ]) {
      // Sections fade in (hidden until scrolled into view)
      const heading = page.locator('h1', { hasText: name });
      await heading.scrollIntoViewIfNeeded();
      await expect(heading).toBeVisible();
    }
  });

  test('OWA-33: returns to the home page from the menu', async ({ page }) => {
    await page.getByRole('link', { name: 'Home', exact: true }).first().click();
    await expect(page).toHaveURL(/index\.html|onlypps\.com\/?$/);
  });
});
