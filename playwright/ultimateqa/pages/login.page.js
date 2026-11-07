// Locators for the courses sign-in page: https://courses.ultimateqa.com/users/sign_in
// This page is on COURSES_URL (see ../env.js), not on BASE_URL.

const path = 'users/sign_in';

module.exports = (page) => ({
  heading: page.getByRole('heading', { name: 'Welcome!' }),
  emailInput: page.locator('input[name="user[email]"]'),
  passwordInput: page.locator('input[name="user[password]"]'),
  rememberMe: page.locator('input[type="checkbox"][name="user[remember_me]"]'),
  signInButton: page.getByRole('button', { name: 'Sign in' }),
  forgotPasswordLink: page.getByRole('link', { name: 'Forgot password?' }),
  createAccountLink: page.getByRole('link', { name: 'Create an account' }),
});

module.exports.path = path;
