// Locators for the Industries page: https://onlypps.com/industry.html

const path = 'industry.html';

module.exports = (page) => ({
  heading: (name) => page.getByRole('heading', { name, exact: true }),

  // One industry card; the carousel repeats cards, so the first match is used
  industry: (name) => page.getByRole('heading', { name, exact: true }).first(),
});

module.exports.path = path;
