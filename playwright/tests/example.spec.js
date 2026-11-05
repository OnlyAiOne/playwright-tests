const { test, expect } = require('@playwright/test');

test.describe('Example Suite', () => {
  test('has title', async ({ page }) => {
    await page.goto('https://example.cypress.io');
    await expect(page).toHaveTitle(/Cypress/);
  });

  test('navigates to the commands page', async ({ page }) => {
    await page.goto('https://example.cypress.io');
    await page.getByRole('link', { name: 'type' }).first().click();
    await expect(page).toHaveURL(/commands\/actions/);
  });
});
