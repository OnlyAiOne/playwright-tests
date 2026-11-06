const { test, expect } = require('@playwright/test');

const { BASE_URL } = require('../env');
const { industriesPage, resourcesPage, siteHeader } = require('../pages');

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
  ['Blog', resourcesPage.paths.blog, 'Latest Insights & Trends in HR & Staffing', /Blog/],
  ['HR Guides', resourcesPage.paths.hrGuides, 'Essential HR & Staffing Insights for Businesses', /HR Guides/],
  ['HR Compliance Checklist', resourcesPage.paths.hrCompliance, 'HR Compliance Checklist for Businesses in Chennai', /HR Compliance Checklist/],
  ['FAQ', resourcesPage.paths.faq, 'HR Consultancy & Staffing FAQs in Chennai', /FAQ/],
];

test.describe('Only Peopleplus Solution - Industries', () => {
  // The site can be slow to finish loading all its images and scripts
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + industriesPage.path, { waitUntil: 'domcontentloaded' });
  });

  test('OWA-35: shows the Industries banner and headings', async ({ page }) => {
    const industriesView = industriesPage(page);
    for (const name of ['Industries', 'Expert HR Solutions for Every Industry', 'Industries We Serve']) {
      await expect(industriesView.heading(name)).toBeVisible();
    }
  });

  test('OWA-35: lists all the industries served', async ({ page }) => {
    const industriesView = industriesPage(page);
    for (const name of industries) {
      await expect(industriesView.industry(name)).toBeAttached();
    }
  });

  test('OWA-35: has a page title that names Industries', async ({ page }) => {
    // Known defect: the title is copied from the Accounting Services page.
    // Remove this line once the site is fixed; the test then has to pass.
    test.fail();
    await expect(page).toHaveTitle(/Industr/);
  });

  test('OWA-35: every Industries menu item links to the Industries page', async ({ page }) => {
    const header = siteHeader(page);
    // These links sit in a closed dropdown, so check their targets rather than their visibility
    for (const name of ['IT & Software', 'Manufacturing', 'Healthcare', 'Retail', 'Startups']) {
      await expect(header.dropdownItem(name)).toHaveAttribute('href', 'industry.html');
    }
  });
});

test.describe('Only Peopleplus Solution - Resources', () => {
  test.describe.configure({ timeout: 60000 });

  test('OWA-35: Resources menu lists all resource pages', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const header = siteHeader(page);
    await header.resourcesMenu.click();
    for (const [name, href] of resources) {
      await expect(header.dropdownItem(name)).toBeVisible();
      await expect(header.dropdownItem(name)).toHaveAttribute('href', href);
    }
  });

  for (const [name, href, heading, title] of resources) {
    test(`OWA-35: ${name} page loads with its heading and title`, async ({ page }) => {
      const response = await page.goto(BASE_URL + href, { waitUntil: 'domcontentloaded' });
      expect(response.status()).toBe(200);
      await expect(page).toHaveTitle(title);
      await expect(resourcesPage(page).heading(heading)).toBeVisible();
    });
  }

  test('OWA-35: Blog shows at least one article', async ({ page }) => {
    await page.goto(BASE_URL + resourcesPage.paths.blog, { waitUntil: 'domcontentloaded' });
    await expect(resourcesPage(page).blogArticle('Top Recruitment Trends to Watch in 2026')).toBeVisible();
  });

  test('OWA-35: HR Compliance Checklist links to the Contact page', async ({ page }) => {
    await page.goto(BASE_URL + resourcesPage.paths.hrCompliance, { waitUntil: 'domcontentloaded' });
    const button = resourcesPage(page).complianceContactButton;
    // The button fades in (hidden until scrolled into view)
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('href', 'contact.php');
  });

  test('OWA-35: FAQ answers start collapsed and open on click', async ({ page }) => {
    await page.goto(BASE_URL + resourcesPage.paths.faq, { waitUntil: 'domcontentloaded' });
    const faq = resourcesPage(page);
    await expect(faq.faqItems).toHaveCount(5);

    const first = faq.faqItems.first();
    const answer = faq.faqAnswer(first);
    await expect(answer).toBeHidden();
    // The questions fade in (hidden until scrolled into view)
    const question = faq.faqQuestion(first);
    await question.scrollIntoViewIfNeeded();
    await expect(question).toBeVisible();
    await question.click();
    await expect(answer).toBeVisible();
  });
});
