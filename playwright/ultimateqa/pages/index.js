// Reusable locators for the UltimateQA suite, one module per page. Tests import from here
// and never write selectors themselves:
//
//   const { pricingPage } = require('../pages');
//   const pricing = pricingPage(page);
//   await expect(pricing.plan('Basic').price).toHaveText('$80');
//
// Each module is a function that takes the Playwright `page` and returns its locators.
// Page modules also carry their address relative to BASE_URL, e.g. pricingPage.path
// (the login page is relative to COURSES_URL instead).

module.exports = {
  automationPage: require('./automation.page'),
  simpleElementsPage: require('./simple-elements.page'),
  fillingOutFormsPage: require('./filling-out-forms.page'),
  sprint1Page: require('./sprint1-app.page'),
  complicatedPage: require('./complicated.page'),
  landingPage: require('./fake-landing.page'),
  pricingPage: require('./fake-pricing.page'),
  loginPage: require('./login.page'),
};
