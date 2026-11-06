const { test, expect } = require('@playwright/test');

const { BASE_URL } = require('../env');
const { homePage, siteHeader } = require('../pages');

test.describe('Only Peopleplus Solution - Home page', () => {
  // The site can be slow to finish loading all its images and scripts
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + homePage.path, { waitUntil: 'domcontentloaded' });
  });

  test('OWA-28: loads with the correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Only Peopleplus Solution LLP/);
  });

  test('OWA-28: shows the welcome banner and services heading', async ({ page }) => {
    const home = homePage(page);
    await expect(home.welcomeBanner).toBeVisible();
    await expect(home.servicesHeading).toBeVisible();
  });

  test('OWA-29: shows the main navigation menu', async ({ page }) => {
    const header = siteHeader(page);
    for (const item of ['Home', 'About', 'Services', 'Industries', 'Resources', 'Contact']) {
      await expect(header.menuLink(item)).toBeVisible();
    }
  });

  test('OWA-29: navigates to the About page', async ({ page }) => {
    await siteHeader(page).menuLink('About', { exact: true }).click();
    await expect(page).toHaveURL(/about\.html/);
  });

  test('OWA-29: navigates to the Contact page', async ({ page }) => {
    await siteHeader(page).menuLink('Contact', { exact: true }).click();
    await expect(page).toHaveURL(/contact\.php/);
  });

  test('OWA-28: shows the contact details', async ({ page }) => {
    const header = siteHeader(page);
    await expect(header.contactEmail).toBeVisible();
    await expect(header.contactPhone).toBeVisible();
  });

  test('OWA-30: switches between service tabs', async ({ page }) => {
    const home = homePage(page);
    await home.serviceTab('Accounting Services').click();
    await expect(home.heading('Accounting Services')).toBeVisible();

    await home.serviceTab('Payroll & Compliance').click();
    await expect(home.heading('Payroll & Statutory Compliance Services')).toBeVisible();
  });

  test('OWA-28: has an enquiry form with all fields (not submitted)', async ({ page }) => {
    const { enquiry } = homePage(page);
    await expect(enquiry.name).toBeAttached();
    await expect(enquiry.email).toBeAttached();
    await expect(enquiry.phone).toBeAttached();
    await expect(enquiry.subject).toBeAttached();
  });
});
