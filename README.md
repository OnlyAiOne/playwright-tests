# Test Automation: Playwright + Cypress

End-to-end tests using **Playwright**, alongside an existing **Cypress** practice suite. There are two Playwright suites, one Playwright project each:

| Project | Site | Tests | Jira epic |
|---|---|---|---|
| `onlypps` | [onlypps.com](https://onlypps.com/) | `playwright/tests/` | `OWA-27` |
| `ultimateqa` | [ultimateqa.com/automation](https://ultimateqa.com/automation) practice pages | `playwright/ultimateqa/tests/` | `OWA-37` |

Two Python suites cover [automationexercise.com](https://automationexercise.com), each with its own README and setup:

| Suite | Stack | Folder |
|---|---|---|
| API | Pytest + Requests | [api-tests/](api-tests/README.md) |
| Web + API | Robot Framework (SeleniumLibrary + RequestsLibrary) | [robot-tests/](robot-tests/README.md) |

Documentation:

- [Automation Architecture Document](docs/architecture.md): objective, scope, architecture diagrams, components, integrations, result storage, security, limitations and roadmap
- [Automation Execution Guide](docs/execution-guide.md): running tests locally and in CI, configuration, Jira integration, reports and failure investigation
- [Business Demonstration Guide](docs/demo-guide.md): preparing and running the business demonstration

## Setup

```bash
npm install
npx playwright install chromium
```

## Run Playwright tests

| Command | What it does |
|---|---|
| `npm run pw:test` | Run all tests, both suites (no visible browser) |
| `npm run pw:onlypps` | Run only the onlypps.com suite |
| `npm run pw:uqa` | Run only the UltimateQA suite |
| `npm run pw:headed` | Run with the browser visible |
| `npm run pw:ui` | Open the interactive test runner |
| `npm run pw:report` | Open the last HTML report |
| `npm run pw:codegen` | Record clicks and generate test code |

## Project layout

```
playwright.config.js        Playwright settings (projects: onlypps, ultimateqa)
playwright/tests/           onlypps.com specs (home, contact, about, services, industries and resources)
playwright/pages/           onlypps.com locators, one file per page
playwright/fixtures/        Test data files
playwright/ultimateqa/      UltimateQA suite, self-contained:
  env.js                      site addresses (UQA_BASE_URL)
  pages/                      locators, one file per practice page
  tests/                      specs, one per practice page
  safety.js                   blocks every POST so no form is ever sent
  page-ready.js               opens a page and waits for its delayed scripts
cypress/                    Cypress tests
.github/workflows/          GitHub Actions: runs Playwright tests on every push
Jenkinsfile                 Jenkins pipeline for the same tests
docs/                       Architecture document, execution guide, demonstration guide
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
- The UltimateQA suite blocks every POST to ultimateqa.com, never answers CAPTCHAs and never signs in. Its sign-in tests are tagged `@external` and can be skipped with `--grep-invert @external`.
- On GitHub, each workflow run uploads the HTML report as a downloadable `playwright-report` artifact.
