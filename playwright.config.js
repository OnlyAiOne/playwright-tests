// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { BASE_URL } = require('./playwright/env');
const { BASE_URL: UQA_BASE_URL } = require('./playwright/ultimateqa/env');

// Two suites, one Playwright project each. Run one with --project, for example:
//   npx playwright test --project=onlypps
//   npx playwright test --project=ultimateqa
// Without --project, both suites run.
module.exports = defineConfig({
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { outputFolder: 'playwright/report', open: 'never' }],
    ['junit', { outputFile: 'playwright/junit/results.xml' }], // read by Jenkins
    ['json', { outputFile: 'playwright/results.json' }], // read by scripts/jira-report.js
    ['list'],
  ],
  outputDir: 'playwright/test-results',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      // https://onlypps.com/ (see playwright/env.js)
      name: 'onlypps',
      testDir: './playwright/tests',
      use: { ...devices['Desktop Chrome'], baseURL: BASE_URL },
    },
    {
      // https://ultimateqa.com/automation practice pages (see playwright/ultimateqa/env.js)
      name: 'ultimateqa',
      testDir: './playwright/ultimateqa/tests',
      use: { ...devices['Desktop Chrome'], baseURL: UQA_BASE_URL },
    },
    // Uncomment after running: npx playwright install firefox webkit
    // then copy a project above with devices['Desktop Firefox'] or devices['Desktop Safari'].
  ],
});
