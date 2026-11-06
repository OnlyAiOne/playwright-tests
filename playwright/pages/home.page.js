// Locators for the home page: https://onlypps.com/

const path = '';

module.exports = (page) => ({
  welcomeBanner: page.getByText('Welcome to Only Peopleplus Solution LLP'),
  servicesHeading: page.getByRole('heading', { name: 'End-to-End HR, Payroll & Compliance Solutions' }),

  // The service tabs and the heading each one shows
  serviceTab: (name) => page.getByRole('button', { name }),
  heading: (name) => page.getByRole('heading', { name }),

  // The enquiry form on the home page (checked, never submitted)
  enquiry: {
    name: page.locator('input[name="name"]'),
    email: page.locator('input[name="email"]'),
    phone: page.locator('input[name="contact_number"]'),
    subject: page.locator('input[name="subject"]'),
  },
});

module.exports.path = path;
