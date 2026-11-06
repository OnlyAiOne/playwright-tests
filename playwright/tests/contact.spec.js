const path = require('path');
const { test, expect } = require('@playwright/test');

const { BASE_URL } = require('../env');
const { contactPage } = require('../pages');

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
    await page.goto(BASE_URL + contactPage.path, { waitUntil: 'domcontentloaded' });
  });

  test('OWA-31: loads the contact page', async ({ page }) => {
    const contact = contactPage(page);
    await expect(page).toHaveTitle(/Contact/);
    await expect(contact.heading).toBeVisible();
    await expect(contact.sendButton).toBeVisible();
  });

  test('OWA-31: fills the contact form with sample data (not submitted)', async ({ page }) => {
    const contact = contactPage(page);

    await contact.nameInput.fill(sampleData.name);
    await contact.emailInput.fill(sampleData.email);
    await contact.phoneInput.fill(sampleData.phone);
    await contact.subjectInput.fill(sampleData.subject);
    await contact.messageInput.fill(sampleData.message);
    await contact.fileInput.setInputFiles(sampleData.file);

    await expect(contact.nameInput).toHaveValue(sampleData.name);
    await expect(contact.emailInput).toHaveValue(sampleData.email);
    await expect(contact.phoneInput).toHaveValue(sampleData.phone);
    await expect(contact.subjectInput).toHaveValue(sampleData.subject);
    await expect(contact.messageInput).toHaveValue(sampleData.message);
    await expect(contact.fileInput).toHaveValue(/sample-resume\.txt$/);

    // The browser considers the filled form valid and ready to send
    expect(await contact.form.evaluate((f) => f.checkValidity())).toBe(true);
  });

  test('OWA-32: marks the form invalid when required fields are empty', async ({ page }) => {
    const contact = contactPage(page);

    expect(await contact.form.evaluate((f) => f.checkValidity())).toBe(false);
    for (const field of [contact.nameInput, contact.emailInput, contact.phoneInput]) {
      await expect(field).toHaveAttribute('required', '');
    }
  });

  test('OWA-32: rejects an invalid email address', async ({ page }) => {
    const email = contactPage(page).emailInput;

    await email.fill('not-an-email');
    expect(await email.evaluate((el) => el.validity.typeMismatch)).toBe(true);

    await email.fill(sampleData.email);
    expect(await email.evaluate((el) => el.validity.valid)).toBe(true);
  });
});
