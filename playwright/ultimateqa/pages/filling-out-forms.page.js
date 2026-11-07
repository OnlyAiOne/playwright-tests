// Locators for the forms practice page: https://ultimateqa.com/filling-out-forms/

const path = 'filling-out-forms/';

module.exports = (page) => {
  // Both forms are Divi contact forms; the second one adds a math CAPTCHA
  const form = (index) => {
    const root = page.locator(`#et_pb_contact_form_${index}`);
    return {
      root,
      nameInput: root.locator(`#et_pb_contact_name_${index}`),
      messageInput: root.locator(`#et_pb_contact_message_${index}`),
      captchaInput: root.locator('input[name^="et_pb_contact_captcha"]'),
      submitButton: root.getByRole('button', { name: 'Submit' }),
      // Divi lists the missing fields here after a failed submit
      errorMessage: root.locator('.et-pb-contact-message'),
    };
  };

  return { forms: page.locator('.et_pb_contact_form'), form };
};

module.exports.path = path;
