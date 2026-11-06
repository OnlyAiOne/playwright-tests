// Reusable locators, one module per page. Tests import from here and never write
// selectors themselves:
//
//   const { homePage, siteHeader } = require('../pages');
//   const home = homePage(page);
//   await expect(home.welcomeBanner).toBeVisible();
//
// Each module is a function that takes the Playwright `page` and returns its locators.
// Page modules also carry their address relative to BASE_URL, e.g. contactPage.path.

module.exports = {
  siteHeader: require('./site-header'),
  pageBasics: require('./page-basics'),
  homePage: require('./home.page'),
  contactPage: require('./contact.page'),
  aboutPage: require('./about.page'),
  servicesPage: require('./services.page'),
  industriesPage: require('./industries.page'),
  resourcesPage: require('./resources.page'),
};
