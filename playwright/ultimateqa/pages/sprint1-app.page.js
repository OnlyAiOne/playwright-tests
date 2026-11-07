// Locators for the Sprint 1 sample application:
// https://ultimateqa.com/sample-application-lifecycle-sprint-1/

const path = 'sample-application-lifecycle-sprint-1/';

module.exports = (page) => ({
  heading: page.getByRole('heading', { name: 'Sample Application Lifecycle – Sprint 1' }),
  firstNameInput: page.locator('input[name="firstname"]'),
  submitButton: page.locator('#submitForm'),
  nextSprintLink: page.getByRole('link', { name: 'Go to the next sprint' }),
});

module.exports.path = path;
