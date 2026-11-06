// Locators for the contact page: https://onlypps.com/contact.php

const path = 'contact.php';

module.exports = (page) => {
  const form = page.locator('#contactForm');

  return {
    heading: page.getByRole('heading', { name: 'If You Have Any Query, Please Contact Us' }),
    sendButton: page.getByRole('button', { name: 'Send Message' }),

    form,
    nameInput: form.getByPlaceholder('Your Name'),
    emailInput: form.getByPlaceholder('Your Email'),
    phoneInput: form.getByPlaceholder('Your Phone Number'),
    subjectInput: form.getByPlaceholder('Subject'),
    messageInput: form.getByPlaceholder('Your Message'),
    fileInput: form.locator('input[type="file"]'),
  };
};

module.exports.path = path;
