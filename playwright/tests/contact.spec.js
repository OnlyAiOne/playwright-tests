const path = require('path');
const { test, expect } = require('@playwright/test');

const { BASE_URL } = require('../env');

const CONTACT_URL = BASE_URL + 'contact.php';

const sampleData = {
  name: 'Test User',
  email: 'test.user@example.com',
  phone: '9876543210',
  subject: 'Payroll outsourcing enquiry',
  message: 'Hello, this is a sample message from an automated Playwright test.',
  file: path.join(__dirname, '..', 'fixtures', 'sample-resume.txt'),
};

test.describe('Only Peopleplus Solution - Contact page', () => {
  // The site can be slow to finish loading all its images and scripts
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    // Safety net: never let the form actually send an enquiry to the real site
    await page.route('**/contact.php', (route) =>
      route.request().method() === 'POST' ? route.abort() : route.continue()
    );
    await page.goto(CONTACT_URL, { waitUntil: 'domcontentloaded' });
  });

  test('OWA-31: loads the contact page', async ({ page }) => {
    await expect(page).toHaveTitle(/Contact/);
    await expect(
      page.getByRole('heading', { name: 'If You Have Any Query, Please Contact Us' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeVisible();
  });

  test('OWA-31: fills the contact form with sample data (not submitted)', async ({ page }) => {
    const form = page.locator('#contactForm');

    await form.getByPlaceholder('Your Name').fill(sampleData.name);
    await form.getByPlaceholder('Your Email').fill(sampleData.email);
    await form.getByPlaceholder('Your Phone Number').fill(sampleData.phone);
    await form.getByPlaceholder('Subject').fill(sampleData.subject);
    await form.getByPlaceholder('Your Message').fill(sampleData.message);
    await form.locator('input[type="file"]').setInputFiles(sampleData.file);

    await expect(form.getByPlaceholder('Your Name')).toHaveValue(sampleData.name);
    await expect(form.getByPlaceholder('Your Email')).toHaveValue(sampleData.email);
    await expect(form.getByPlaceholder('Your Phone Number')).toHaveValue(sampleData.phone);
    await expect(form.getByPlaceholder('Subject')).toHaveValue(sampleData.subject);
    await expect(form.getByPlaceholder('Your Message')).toHaveValue(sampleData.message);
    await expect(form.locator('input[type="file"]')).toHaveValue(/sample-resume\.txt$/);

    // The browser considers the filled form valid and ready to send
    expect(await form.evaluate((f) => f.checkValidity())).toBe(true);
  });

  test('OWA-32: marks the form invalid when required fields are empty', async ({ page }) => {
    const form = page.locator('#contactForm');

    expect(await form.evaluate((f) => f.checkValidity())).toBe(false);
    for (const placeholder of ['Your Name', 'Your Email', 'Your Phone Number']) {
      await expect(form.getByPlaceholder(placeholder)).toHaveAttribute('required', '');
    }
  });

  test('OWA-32: rejects an invalid email address', async ({ page }) => {
    const email = page.locator('#contactForm').getByPlaceholder('Your Email');

    await email.fill('not-an-email');
    expect(await email.evaluate((el) => el.validity.typeMismatch)).toBe(true);

    await email.fill(sampleData.email);
    expect(await email.evaluate((el) => el.validity.valid)).toBe(true);
  });
});
