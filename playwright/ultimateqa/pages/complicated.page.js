// Locators for the "big page with many elements": https://ultimateqa.com/complicated-page

const path = 'complicated-page';

module.exports = (page) => {
  const content = page.locator('article');

  return {
    sectionHeading: (name) => content.getByRole('heading', { name, exact: true }),

    // The "Section of Buttons" is 12 Divi buttons that all read "Button"
    plainButtons: content.locator('a.et_pb_button').filter({ hasText: /^\s*Button\s*$/ }),

    twitterLinks: content.locator('.et_pb_social_media_follow a[title="Follow on Twitter"]'),
    facebookLinks: content.locator('.et_pb_social_media_follow a[title="Follow on Facebook"]'),

    contactForms: content.locator('.et_pb_contact_form'),
    contactForm: (index) => {
      const root = page.locator(`#et_pb_contact_form_${index}`);
      return {
        root,
        nameInput: root.locator(`#et_pb_contact_name_${index}`),
        emailInput: root.locator(`#et_pb_contact_email_${index}`),
        messageInput: root.locator(`#et_pb_contact_message_${index}`),
        captchaInput: root.locator('input[name^="et_pb_contact_captcha"]'),
        submitButton: root.getByRole('button', { name: 'Submit' }),
      };
    },

    // Login widgets; their field ids change on every page load, so match by placeholder
    loginForms: content.locator('form').filter({ has: page.locator('input[type="password"]') }),
  };
};

module.exports.path = path;
