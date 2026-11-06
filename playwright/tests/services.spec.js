// ---------------------------------------------------------------------------
// Services tests
//
// Purpose:    Checks the Services page, its links to all 14 service pages, that each
//             service page loads with a matching title, the Payroll Outsourcing contact
//             button, and "View All Services" in the menu.
// Stories:    OWA-34 Service (5 tests)
// Pages:      https://onlypps.com/service.html, the 14 service pages listed in `services`
// Locators:   playwright/pages/services.page.js, playwright/pages/site-header.js
// Run:        npx playwright test playwright/tests/services.spec.js
// Notes:      The 14 service pages are fetched with the request API (no browser), which
//             keeps that test fast. Add a new service to the `services` list.
//             "View All Services" is inside the Services menu, which opens on hover.
// ---------------------------------------------------------------------------

const { test, expect } = require('@playwright/test');

const { BASE_URL } = require('../env');
const { servicesPage, siteHeader } = require('../pages');

const payrollPage = servicesPage.payrollOutsourcing;

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
    await page.goto(BASE_URL + servicesPage.path, { waitUntil: 'domcontentloaded' });
    const servicesView = servicesPage(page);
    await expect(page).toHaveTitle(/Service/);
    for (const name of [
      'Services',
      'End-to-End HR, Payroll & Compliance Solutions',
      'Payroll & Statutory Compliance Services',
    ]) {
      await expect(servicesView.heading(name)).toBeVisible();
    }
  });

  test('OWA-34: links to all 14 services', async ({ page }) => {
    await page.goto(BASE_URL + servicesPage.path, { waitUntil: 'domcontentloaded' });
    const servicesView = servicesPage(page);
    for (const [name, href] of services) {
      await expect(servicesView.serviceLink(name, href)).toBeAttached();
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
    await page.goto(BASE_URL + payrollPage.path, { waitUntil: 'domcontentloaded' });
    const payroll = payrollPage(page);
    await expect(payroll.heading).toBeVisible();
    // The button fades in (hidden until scrolled into view)
    await payroll.contactButton.scrollIntoViewIfNeeded();
    await expect(payroll.contactButton).toBeVisible();
    await expect(payroll.contactButton).toHaveAttribute('href', 'contact.php');
  });

  test('OWA-34: View All Services in the Services menu opens the Services page', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const header = siteHeader(page);
    // The link sits in the Services mega menu, which opens on hover
    await header.servicesMenu.hover();
    await expect(header.viewAllServicesLink).toBeVisible();
    await header.viewAllServicesLink.click();
    await expect(page).toHaveURL(/service\.html/);
  });
});
