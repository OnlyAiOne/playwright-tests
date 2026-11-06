const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://onlypps.com/';

test.describe('Only Peopleplus Solution - Home page', () => {
  // The site can be slow to finish loading all its images and scripts
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  });

  test('OWA-28: loads with the correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Only Peopleplus Solution LLP/);
  });

  test('OWA-28: shows the welcome banner and services heading', async ({ page }) => {
    await expect(page.getByText('Welcome to Only Peopleplus Solution LLP')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'End-to-End HR, Payroll & Compliance Solutions' })
    ).toBeVisible();
  });

  test('OWA-29: shows the main navigation menu', async ({ page }) => {
    for (const item of ['Home', 'About', 'Services', 'Industries', 'Resources', 'Contact']) {
      await expect(page.getByRole('link', { name: item }).first()).toBeVisible();
    }
  });

  test('OWA-29: navigates to the About page', async ({ page }) => {
    await page.getByRole('link', { name: 'About', exact: true }).first().click();
    await expect(page).toHaveURL(/about\.html/);
  });

  test('OWA-29: navigates to the Contact page', async ({ page }) => {
    await page.getByRole('link', { name: 'Contact', exact: true }).first().click();
    await expect(page).toHaveURL(/contact\.php/);
  });

  test('OWA-28: shows the contact details', async ({ page }) => {
    // The top bar copy is hidden on some screen sizes, so check the visible one
    const email = page.locator('a[href="mailto:admin@onlypeopleplus.com"]').filter({ visible: true });
    const phone = page.locator('a[href="tel:+919176376488"]').filter({ visible: true });
    await expect(email.first()).toBeVisible();
    await expect(phone.first()).toBeVisible();
  });

  test('OWA-30: switches between service tabs', async ({ page }) => {
    await page.getByRole('button', { name: 'Accounting Services' }).click();
    await expect(page.getByRole('heading', { name: 'Accounting Services' })).toBeVisible();

    await page.getByRole('button', { name: 'Payroll & Compliance' }).click();
    await expect(
      page.getByRole('heading', { name: 'Payroll & Statutory Compliance Services' })
    ).toBeVisible();
  });

  test('OWA-28: has an enquiry form with all fields (not submitted)', async ({ page }) => {
    await expect(page.locator('input[name="name"]')).toBeAttached();
    await expect(page.locator('input[name="email"]')).toBeAttached();
    await expect(page.locator('input[name="contact_number"]')).toBeAttached();
    await expect(page.locator('input[name="subject"]')).toBeAttached();
  });
});
