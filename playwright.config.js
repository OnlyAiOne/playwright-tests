// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { BASE_URL } = require('./playwright/env');

module.exports = defineConfig({
  testDir: './playwright/tests',
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
    baseURL: BASE_URL, // see playwright/env.js
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Uncomment after running: npx playwright install firefox webkit
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
