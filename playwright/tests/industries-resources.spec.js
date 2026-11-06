const { test, expect } = require('@playwright/test');

const { BASE_URL } = require('../env');

const industries = [
  'IT & ITES',
  'BPO & Customer Support',
  'Manufacturing & Operations',
  'Retail & FMCG',
  'Banking & Finance',
  'Healthcare',
  'Construction & Infrastructure',
  'Education & Training',
  'Renewable Energy',
];

// Menu text, page, heading on the page, and a word the page title must contain
const resources = [
  ['Blog', 'blog.html', 'Latest Insights & Trends in HR & Staffing', /Blog/],
  ['HR Guides', 'HR-guide.html', 'Essential HR & Staffing Insights for Businesses', /HR Guides/],
  ['HR Compliance Checklist', 'hr-compliance.html', 'HR Compliance Checklist for Businesses in Chennai', /HR Compliance Checklist/],
  ['FAQ', 'faq.html', 'HR Consultancy & Staffing FAQs in Chennai', /FAQ/],
];

test.describe('Only Peopleplus Solution - Industries', () => {
  // The site can be slow to finish loading all its images and scripts
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + 'industry.html', { waitUntil: 'domcontentloaded' });
  });

  test('OWA-35: shows the Industries banner and headings', async ({ page }) => {
    for (const name of ['Industries', 'Expert HR Solutions for Every Industry', 'Industries We Serve']) {
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    }
  });

  test('OWA-35: lists all the industries served', async ({ page }) => {
    for (const name of industries) {
      await expect(page.getByRole('heading', { name, exact: true }).first()).toBeAttached();
    }
  });

  test('OWA-35: has a page title that names Industries', async ({ page }) => {
    // Known defect: the title is copied from the Accounting Services page.
    // Remove this line once the site is fixed; the test then has to pass.
    test.fail();
    await expect(page).toHaveTitle(/Industr/);
  });

  test('OWA-35: every Industries menu item links to the Industries page', async ({ page }) => {
    // These links sit in a closed dropdown, so check their targets rather than their visibility
    for (const name of ['IT & Software', 'Manufacturing', 'Healthcare', 'Retail', 'Startups']) {
      const link = page.locator('a.dropdown-item').filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) });
      await expect(link.first()).toHaveAttribute('href', 'industry.html');
    }
  });
});

test.describe('Only Peopleplus Solution - Resources', () => {
  test.describe.configure({ timeout: 60000 });

  test('OWA-35: Resources menu lists all resource pages', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.locator('a.dropdown-toggle', { hasText: 'Resources' }).first().click();
    for (const [name, href] of resources) {
      const link = page.locator('a.dropdown-item').filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) }).first();
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', href);
    }
  });

  for (const [name, href, heading, title] of resources) {
    test(`OWA-35: ${name} page loads with its heading and title`, async ({ page }) => {
      const response = await page.goto(BASE_URL + href, { waitUntil: 'domcontentloaded' });
      expect(response.status()).toBe(200);
      await expect(page).toHaveTitle(title);
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    });
  }

  test('OWA-35: Blog shows at least one article', async ({ page }) => {
    await page.goto(BASE_URL + 'blog.html', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Top Recruitment Trends to Watch in 2026' })).toBeVisible();
  });

  test('OWA-35: HR Compliance Checklist links to the Contact page', async ({ page }) => {
    await page.goto(BASE_URL + 'hr-compliance.html', { waitUntil: 'domcontentloaded' });
    // The button fades in (hidden until scrolled into view)
    const button = page.locator('a', { hasText: 'Get HR Compliance Consultation' });
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('href', 'contact.php');
  });

  test('OWA-35: FAQ answers start collapsed and open on click', async ({ page }) => {
    await page.goto(BASE_URL + 'faq.html', { waitUntil: 'domcontentloaded' });
    const items = page.locator('.accordion-item');
    await expect(items).toHaveCount(5);

    const first = items.first();
    const answer = first.locator('.accordion-collapse');
    await expect(answer).toBeHidden();
    // The questions fade in (hidden until scrolled into view)
    const question = first.locator('.accordion-button');
    await question.scrollIntoViewIfNeeded();
    await expect(question).toBeVisible();
    await question.click();
    await expect(answer).toBeVisible();
  });
});
