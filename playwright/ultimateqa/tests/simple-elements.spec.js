// ---------------------------------------------------------------------------
// Simple HTML elements tests
//
// Purpose:    Operates each basic control on the practice page: buttons and links found by
//             id, class name, name and link text, radio buttons, checkboxes, a dropdown,
//             two tables and a small form.
// Stories:    OWA-39 Simple HTML elements can be operated (10 tests)
// Pages:      https://ultimateqa.com/simple-html-elements-for-automation/
// Locators:   playwright/ultimateqa/pages/simple-elements.page.js
// Test data:  sampleData below (fictional)
// Run:        npx playwright test --project=ultimateqa simple-elements
// Safety:     beforeEach blocks every POST to ultimateqa.com (../safety.js), so the
//             "Email Me!" form never sends anything. Do not remove that call.
// Notes:      The "Click Me!" button (id button1) submits to the home page; the element
//             with id "idExample" is the one that opens the button-success page.
//             The home page then redirects to home.ultimateqa.com, so that test checks
//             the request the button sends rather than the final address.
//             Pages are opened with openPage (../page-ready.js), which waits for the
//             site's delayed scripts; without it clicks are swallowed at random.
// ---------------------------------------------------------------------------

const { test, expect } = require('@playwright/test');

const { BASE_URL } = require('../env');
const { simpleElementsPage } = require('../pages');
const { blockFormPosts } = require('../safety');
const { openPage } = require('../page-ready');

const sampleData = {
  name: 'Test User',
  email: 'test.user@example.com',
};

// Header row and first data row of both tables
const tableHeader = ['Title', 'Work', 'Salary'];
const firstRow = ['Software Development Engineer in Test', 'Automation', '$150,000+'];

test.describe('UltimateQA - Simple HTML elements', () => {
  // The site can be slow to finish loading all its images and scripts
  test.describe.configure({ timeout: 60000 });

  test.beforeEach(async ({ page }) => {
    await blockFormPosts(page);
    await openPage(page, BASE_URL + simpleElementsPage.path);
  });

  test('OWA-39: loads with its sections', async ({ page }) => {
    const elements = simpleElementsPage(page);
    await expect(page).toHaveTitle(/Simple HTML Elements/);
    for (const name of ['Simple Controls', 'Advanced Controls', 'Common Scenarios']) {
      await expect(elements.sectionHeading(name), name).toBeVisible();
    }
  });

  test('OWA-39: opens the button-success page from the element found by id', async ({ page }) => {
    await simpleElementsPage(page).buttonById.click();
    await expect(page).toHaveURL(/\/button-success/);
  });

  test('OWA-39: opens the button-success page from buttons found by class name and name', async ({ page }) => {
    // Two page loads in one test
    test.setTimeout(90000);
    const elements = simpleElementsPage(page);

    await elements.buttonByClassName.click();
    await expect(page).toHaveURL(/\/button-success/);

    await openPage(page, BASE_URL + simpleElementsPage.path);
    await elements.buttonByName.click();
    await expect(page).toHaveURL(/\/button-success/);
  });

  test('OWA-39: the "Click Me!" button submits to the home page', async ({ page }) => {
    // The redirect that follows can be slow, so check the request the button sends
    const homeRequest = page.waitForRequest(/^https:\/\/ultimateqa\.com\/\?/);
    await simpleElementsPage(page).clickMeButton.click();
    expect((await homeRequest).method()).toBe('GET');
  });

  test('OWA-39: opens the link-success page from a link found by its text', async ({ page }) => {
    await simpleElementsPage(page).linkByText.click();
    await expect(page).toHaveURL(/\/link-success/);
  });

  test('OWA-39: opens the link-success page from the clickable icon', async ({ page }) => {
    await simpleElementsPage(page).clickableIcon.click();
    await expect(page).toHaveURL(/\/link-success/);
  });

  test('OWA-39: selects one radio button at a time', async ({ page }) => {
    const elements = simpleElementsPage(page);
    const values = ['male', 'female', 'other'];

    for (const value of values) {
      await elements.radio(value).check();
      for (const other of values) {
        if (other === value) await expect(elements.radio(other)).toBeChecked();
        else await expect(elements.radio(other)).not.toBeChecked();
      }
    }
  });

  test('OWA-39: checks and unchecks the checkboxes', async ({ page }) => {
    const elements = simpleElementsPage(page);

    for (const value of ['Bike', 'Car']) {
      await elements.checkbox(value).check();
      await expect(elements.checkbox(value)).toBeChecked();
    }
    for (const value of ['Bike', 'Car']) {
      await elements.checkbox(value).uncheck();
      await expect(elements.checkbox(value)).not.toBeChecked();
    }
  });

  test('OWA-39: chooses each dropdown option', async ({ page }) => {
    const dropdown = simpleElementsPage(page).dropdown;

    for (const value of ['volvo', 'saab', 'opel', 'audi']) {
      await dropdown.selectOption(value);
      await expect(dropdown).toHaveValue(value);
    }
  });

  test('OWA-39: reads the tables with and without an id', async ({ page }) => {
    const elements = simpleElementsPage(page);

    for (const table of [elements.tableWithId, elements.tableWithoutId]) {
      const rows = table.locator('tr');
      await expect(rows).toHaveCount(4); // header + 3 data rows
      await expect(rows.nth(0).locator('th')).toHaveText(tableHeader);
      await expect(rows.nth(1).locator('td')).toHaveText(firstRow);
    }
  });

  test('OWA-39: fills the name and email form (not sent)', async ({ page }) => {
    const elements = simpleElementsPage(page);

    await elements.nameInput.fill(sampleData.name);
    await elements.emailInput.fill(sampleData.email);

    await expect(elements.nameInput).toHaveValue(sampleData.name);
    await expect(elements.emailInput).toHaveValue(sampleData.email);
  });
});
