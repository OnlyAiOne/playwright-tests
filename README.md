# Test Automation: Playwright + Cypress

End-to-end tests for [onlypps.com](https://onlypps.com/) using **Playwright**, alongside an existing **Cypress** practice suite.

## Setup

```bash
npm install
npx playwright install chromium
```

## Run Playwright tests

| Command | What it does |
|---|---|
| `npm run pw:test` | Run all tests (no visible browser) |
| `npm run pw:headed` | Run with the browser visible |
| `npm run pw:ui` | Open the interactive test runner |
| `npm run pw:report` | Open the last HTML report |
| `npm run pw:codegen` | Record clicks and generate test code |

## Project layout

```
playwright.config.js        Playwright settings
playwright/tests/           Test specs (home page, contact page, sample)
playwright/fixtures/        Test data files
cypress/                    Cypress tests
.github/workflows/          GitHub Actions: runs Playwright tests on every push
```

## Notes

- The contact form tests fill the form with sample data but **never submit it**, so no real enquiries are sent.
- On GitHub, each workflow run uploads the HTML report as a downloadable `playwright-report` artifact.
