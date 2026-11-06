const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://onlypps.com/';
const SERVICES_URL = BASE_URL + 'service.html';

// Link text, page, and a word the page title must contain
const services = [
  ['Payroll Outsourcing', 'payroll-outsourcing.html', /Payroll Outsourcing/],
  ['Statutory Compliance', 'statutory-compliance.html', /Statutory Compliance/],
  ['TDS Compliance', 'TDS-compliance.html', /TDS Compliance/],
  ['Payroll Lodgement', 'payroll-lodgement.html', /Payroll Lodgement/],
  ['Salary Restructuring', 'salary-restructuring.html', /Salary Restructuring/],
  ['Accounting Services', 'accounting-services.html', /Accounting Services/],
  ['HR Audit', 'HR-audit.html', /HR Audit/],
  ['HR Policy Design', 'HR-policy.html', /HR Policy/],
  ['Organization Climate Survey', 'organization-climate-survey.html', /Organization Climate Survey/],
  ['Employee Engagement Survey', 'employee-engagement-survey.html', /Employee Engagement Survey/],
  ['Performance Management System', 'performance-management.html', /Performance Management/],
  ['Compensation Benchmarking', 'compensation-benchmarking.html', /Compensation Benchmarking/],
  ['Competency Mapping', 'competency-mapping.html', /Competency Mapping/],
  ['POSH Training', 'posh-training.html', /POSH Training/],
];

test.describe('Only Peopleplus Solution - Services', () => {
  // The site can be slow to finish loading all its images and scripts
  test.describe.configure({ timeout: 60000 });

  test('OWA-34: loads the Services page with its headings', async ({ page }) => {
    await page.goto(SERVICES_URL, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Service/);
    for (const name of [
      'Services',
      'End-to-End HR, Payroll & Compliance Solutions',
      'Payroll & Statutory Compliance Services',
    ]) {
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    }
  });

  test('OWA-34: links to all 14 services', async ({ page }) => {
    await page.goto(SERVICES_URL, { waitUntil: 'domcontentloaded' });
    for (const [name, href] of services) {
      await expect(page.locator(`a[href="${href}"]`, { hasText: name }).first()).toBeAttached();
    }
  });

  test('OWA-34: every service page loads with a matching title', async ({ request }) => {
    for (const [, href, title] of services) {
      const response = await request.get(BASE_URL + href);
      expect(response.status(), href).toBe(200);
      const pageTitle = (await response.text()).match(/<title>([^<]*)<\/title>/i)?.[1] ?? '';
      expect(pageTitle, href).toMatch(title);
    }
  });

  test('OWA-34: Payroll Outsourcing page links to the Contact page', async ({ page }) => {
    await page.goto(BASE_URL + 'payroll-outsourcing.html', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('heading', { name: 'Professional Payroll Outsourcing Services in Chennai' })
    ).toBeVisible();
    // The button fades in (hidden until scrolled into view)
    const button = page.locator('a', { hasText: 'Get Payroll Outsourcing Assistance' });
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('href', 'contact.php');
  });

  test('OWA-34: View All Services in the Services menu opens the Services page', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    // The link sits in the Services mega menu, which opens on hover
    await page.locator('a.nav-link', { hasText: 'Services' }).first().hover();
    const link = page.locator('a', { hasText: 'View All Services' }).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/service\.html/);
  });
});
