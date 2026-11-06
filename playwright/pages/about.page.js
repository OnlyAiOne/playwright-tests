// Locators for the About page: https://onlypps.com/about.html

const path = 'about.html';

module.exports = (page) => ({
  heading: (name) => page.getByRole('heading', { name, exact: true }),

  // Stats counters: the label under each number, and the number itself once it has counted up
  statLabel: (label) => page.getByText(label, { exact: true }),
  statValue: (value) => page.getByRole('heading', { name: value, exact: true }),

  // Lower sections fade in when scrolled into view, so they are found by their h1 text
  section: (title) => page.locator('h1', { hasText: title }),
});

module.exports.path = path;
