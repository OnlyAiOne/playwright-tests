// Locators for the Services page (https://onlypps.com/service.html)
// and the Payroll Outsourcing service page.

const path = 'service.html';

module.exports = (page) => ({
  heading: (name) => page.getByRole('heading', { name, exact: true }),

  // A link to one service page, matched by its address and text
  serviceLink: (name, href) => page.locator(`a[href="${href}"]`, { hasText: name }).first(),
});

module.exports.path = path;

// https://onlypps.com/payroll-outsourcing.html
module.exports.payrollOutsourcing = (page) => ({
  heading: page.getByRole('heading', { name: 'Professional Payroll Outsourcing Services in Chennai' }),
  // Fades in when scrolled into view
  contactButton: page.locator('a', { hasText: 'Get Payroll Outsourcing Assistance' }),
});

module.exports.payrollOutsourcing.path = 'payroll-outsourcing.html';
