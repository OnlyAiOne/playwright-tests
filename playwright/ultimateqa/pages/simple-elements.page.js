// Locators for the simple HTML elements page:
// https://ultimateqa.com/simple-html-elements-for-automation/

const path = 'simple-html-elements-for-automation/';

module.exports = (page) => {
  const content = page.locator('article');
  const emailForm = page.locator('#et_pb_contact_form_0');

  return {
    sectionHeading: (name) => content.getByRole('heading', { name, exact: true }),

    // Buttons and links found by different strategies (id, class name, name, link text)
    clickMeButton: page.getByRole('button', { name: 'Click Me!' }), // id="button1", sends to the home page
    buttonById: page.locator('#idExample'),
    buttonByClassName: page.locator('button.buttonClass'),
    buttonByName: page.locator('button[name="button1"]'),
    linkByText: content.getByRole('link', { name: 'Click me using this link text!' }),
    clickableIcon: content.getByRole('link', { name: 'Clickable Icon' }),

    radio: (value) => content.locator(`input[type="radio"][name="gender"][value="${value}"]`),
    checkbox: (value) => content.locator(`input[type="checkbox"][name="vehicle"][value="${value}"]`),
    dropdown: content.locator('select').first(),

    // Two tables with the same rows; only the first has an id
    tableWithId: page.locator('#htmlTableId'),
    tableWithoutId: content.locator('table:not([id])').first(),

    emailForm,
    nameInput: emailForm.getByPlaceholder('Name'),
    emailInput: emailForm.getByPlaceholder('Email Address'),
  };
};

module.exports.path = path;
