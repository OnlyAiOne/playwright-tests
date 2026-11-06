# Test Automation: Playwright + Cypress

End-to-end tests for [onlypps.com](https://onlypps.com/) using **Playwright**, alongside an existing **Cypress** practice suite.

See [docs/architecture.md](docs/architecture.md) for how the automation works end to end, from Jira story to test result.

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
playwright/tests/           Test specs (home, contact, about, services, industries and resources)
playwright/fixtures/        Test data files
cypress/                    Cypress tests
.github/workflows/          GitHub Actions: runs Playwright tests on every push
Jenkinsfile                 Jenkins pipeline for the same tests
docs/architecture.md        End-to-end architecture diagram
scripts/jira-report.js      Posts results to the Jira story named in each test
```

## Jira results

After every run on `main`, GitHub Actions runs `scripts/jira-report.js`. It reads `playwright/results.json`, groups tests by the story key at the start of each test name (`OWA-31: ...`), and on each story:

- keeps one results comment up to date: pass/fail per test, durations, failure details and a link to the CI run
- attaches the screenshot of any failed test
- never changes the story's status

Until Jira credentials are added it runs as a dry run and only prints the comments in the job log.

**One-time setup** (by someone with access to both accounts):

1. Create an API token for the Jira account that should post results: https://id.atlassian.com/manage-profile/security/api-tokens
2. In GitHub, open the repository's **Settings → Secrets and variables → Actions** and add two repository secrets:
   - `JIRA_EMAIL`: the email of that Jira account
   - `JIRA_API_TOKEN`: the token from step 1
3. That account needs Browse projects, Add comments and Create attachments in the OWA space.

To preview the comments locally after a test run: `npm run jira:report` (dry run unless `JIRA_EMAIL` and `JIRA_API_TOKEN` are set).

## Notes

- The contact form tests fill the form with sample data but **never submit it**, so no real enquiries are sent.
- On GitHub, each workflow run uploads the HTML report as a downloadable `playwright-report` artifact.
