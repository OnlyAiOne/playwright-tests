# Automation Execution Guide

How to run the OnlyPPS tests, read their results, and investigate failures. Last reviewed 6 November 2026.

See also: [Automation Architecture Document](architecture.md) · [Business Demonstration Guide](demo-guide.md)

## 1. Before you start

- **Node.js 20** and **Git** installed.
- **PyCharm** (any edition). Professional can run npm scripts from the editor; Community runs them from its terminal.
- A clone of https://github.com/OnlyAiOne/playwright-tests. Open the **repository root** in PyCharm (the folder that holds `package.json`), not the inner `cypress` folder.

## 2. Local execution in PyCharm

### One-time setup

Open the PyCharm terminal (**Alt+F12**) in the repository root and run:

```bash
npm ci
```

```bash
npx playwright install chromium
```

`package.json` also contains Cypress, which downloads a large binary during install. To skip it, run this before `npm ci` (PowerShell):

```bash
$env:CYPRESS_INSTALL_BINARY=0
```

### Commands

| Command | What it does |
|---|---|
| `npm run pw:test` | Run all 34 tests, browser hidden |
| `npm run pw:headed` | Run all tests with the browser visible |
| `npm run pw:ui` | Open Playwright's interactive runner (pick tests, watch, re-run) |
| `npm run pw:report` | Open the HTML report of the last local run |
| `npm run pw:codegen` | Record clicks in a browser and generate test code |
| `npm run jira:report` | Preview the Jira comments for the last run (dry run unless Jira credentials are set) |

Useful variations:

| Goal | Command |
|---|---|
| One story's tests | `npx playwright test -g "OWA-31"` |
| One file | `npx playwright test playwright/tests/contact.spec.js` |
| One story, browser visible | `npx playwright test -g "OWA-31" --headed` |
| Step through a test | `npx playwright test -g "OWA-31" --debug` |
| List tests without running | `npx playwright test --list` |

In **PyCharm Professional** you can also open `package.json` and click the run icon beside a `pw:*` script, after setting the Node interpreter in **Settings → Languages & Frameworks → Node.js**.

Local runs do not retry failures and do not post to Jira.

## 3. GitHub workflow execution

The workflow is **Playwright Tests** (`.github/workflows/playwright.yml`).

**It starts automatically** on every push to `main` and on every pull request to `main`.

**To start it by hand:** GitHub → **Actions** → **Playwright Tests** → **Run workflow** → branch `main` → **Run workflow**.

Its steps, in order:

1. Check out the code
2. Set up Node.js 20 and run `npm ci` (Cypress binary skipped)
3. `npx playwright install --with-deps chromium`
4. `npx playwright test` (all tests, `CI=true`, so failures are retried up to twice)
5. **Post results to Jira** (pushes and manual runs only, not pull requests)
6. **Upload HTML report** as the `playwright-report` artifact, kept 30 days, even if tests failed

The job stops after 30 minutes. A full run normally takes a few minutes, of which the tests take about one.

**Jenkins** runs the same tests on the laptop: job `playwright-tests` at http://localhost:8080/job/playwright-tests/. It checks GitHub every 5 minutes and also runs weekdays at 9 AM. It does not post to Jira.

## 4. Environment configuration

### Environment variables

| Variable | Used by | Where it is set | Meaning |
|---|---|---|---|
| `CI` | Playwright config | Set by GitHub Actions and the Jenkinsfile | `true` turns on 2 retries |
| `CYPRESS_INSTALL_BINARY` | npm install | Workflow and Jenkinsfile: `0` | Skips the Cypress download |
| `JIRA_BASE_URL` | Jira reporter | Workflow: `https://ccbchennai.atlassian.net` | Jira site |
| `JIRA_EMAIL` | Jira reporter | GitHub secret | Account that posts the results |
| `JIRA_API_TOKEN` | Jira reporter | GitHub secret | That account's API token |
| `RUN_URL` | Jira reporter | Workflow: link to the current run | Shown in the Jira comment |
| `JIRA_PROJECT_KEY` | Jira reporter | Not set (default `OWA`) | Story key prefix to look for |
| `RESULTS_FILE` | Jira reporter | Not set (default `playwright/results.json`) | Results to read |
| `DRY_RUN` | Jira reporter | Not set | `true` prints the comments without sending |

### Settings in `playwright.config.js`

| Setting | Value |
|---|---|
| Test folder | `playwright/tests` |
| Parallel | Yes, across and within files. The number of workers is not set, so Playwright uses half the CPU cores |
| Retries | 2 in CI, 0 locally |
| Screenshot | Only when a test fails |
| Trace | On the first retry (so only in CI) |
| Reporters | HTML `playwright/report/`, JUnit `playwright/junit/results.xml`, JSON `playwright/results.json`, console list |
| Output folder | `playwright/test-results/` |
| Browser | Chromium (Desktop Chrome). Firefox and WebKit are written in but commented out |

Each spec file sets a 60-second limit per test, because the live site can be slow. The site address `https://onlypps.com/` is written in each spec file; there is no `baseURL` or test environment setting.

## 5. Jira integration

**How results find their story.** Every test title starts with its story key, for example `OWA-31: fills the contact form with sample data (not submitted)`. After the tests, `scripts/jira-report.js` reads `playwright/results.json`, finds the first `OWA-<number>` in each title, and groups the results by story.

**What it writes, per story:**

- One comment headed "Automated test results", with the overall result, a table of each test with its result and time, failure details (the expected and received values), the commit, and a link to the run. It ends with "Posted by the OnlyPPS automation pipeline".
- On the next run it **updates that same comment** instead of adding another (it finds it by that closing line).
- For each test that really failed, its screenshot is **attached** to the story.
- It **never changes the story's status**.

A test whose title has no `OWA-` key is reported as a warning in the log and not posted. Jira errors are warnings: they never fail the build.

**One-time setup** (done on 6 Nov 2026):

1. Create a token at https://id.atlassian.com/manage-profile/security/api-tokens with **Create API token** (not "with scopes"), signed in as the account that should post. Note its expiry date.
2. In GitHub → **Settings → Secrets and variables → Actions**, add `JIRA_EMAIL` and `JIRA_API_TOKEN`.
3. The account needs Browse projects, Add comments and Create attachments in OWA.

**Preview locally**, after any local run:

```bash
npm run jira:report
```

This prints each story's comment and sends nothing. To post from your own computer (rarely needed), set the three variables first in PowerShell, in that terminal only:

```bash
$env:JIRA_BASE_URL="https://ccbchennai.atlassian.net"; $env:JIRA_EMAIL="<your Jira email>"; $env:JIRA_API_TOKEN="<your token>"; npm run jira:report
```

**Reading the "Post results to Jira" step log:**

| Log line | Meaning |
|---|---|
| `34 tests, 8 stories: OWA-28, …` | Results were read and grouped |
| `OWA-31: comment added` / `comment updated` | Posted successfully |
| `… screenshot(s) attached` | Failure evidence uploaded |
| `Jira credentials not set: dry run` | A secret is missing or misnamed |
| `returned 401` | Email and token do not match, or the token expired |
| `returned 403` | The account lacks permission in OWA |
| `returned 404` | The story key does not exist |

## 6. Test execution

**Adding a test for a new story:**

1. The story exists in OWA with numbered acceptance criteria.
2. Add the test to the spec file for that area of the site, or a new `*.spec.js` in `playwright/tests/`.
3. Start its title with the key: `test('OWA-40: …', …)`.
4. Run it locally with `npx playwright test -g "OWA-40" --headed` until it passes.
5. Commit and push. The next pipeline run posts its result to OWA-40.

**Conventions in the existing tests:**

- Find elements as a visitor does: `getByRole`, `getByText`, `getByPlaceholder`.
- Many sections fade in when scrolled to; scroll them into view (`scrollIntoViewIfNeeded()`) before checking them.
- Never submit a real form. `contact.spec.js` blocks POST requests to `contact.php`.
- A known site defect stays as a test marked `test.fail()` with a comment, so it is recorded but does not turn builds red. When the site is fixed, that test reports an unexpected pass: delete the `test.fail()` line.

## 7. Report access

| Where | How |
|---|---|
| Local | `npm run pw:report` opens the last local run's report |
| GitHub Actions | Actions → the run → **Artifacts** → `playwright-report` (sign in to GitHub). Unzip and open `index.html`. Kept 30 days |
| Jira | Open the story; the results comment shows the latest run and links to it |
| Jenkins | http://localhost:8080/job/playwright-tests/ → a build → **Test Result** or **Playwright Report** (on the laptop only) |

In the HTML report, type a story key such as `OWA-34` in the search box to see only that story's tests.

## 8. Failure investigation

1. **Start from the story.** The Jira comment names the failed test and gives the expected and received values.
2. **Open the run** from the comment's link. In the **Run Playwright tests** step, find the test and its error.
3. **Download `playwright-report`** and open the failed test. It shows the error, the code line, the screenshot and, if the test was retried, a **trace**: a step-by-step recording you can replay. A saved trace can also be opened with `npx playwright show-trace <path to trace.zip>`.
4. **Reproduce locally:** `npx playwright test -g "OWA-34" --headed`, or `--debug` to step through it.
5. **Decide:** if the site is wrong, raise a Jira Bug and link it to the story; if the site changed on purpose, update the test.

| Symptom | Likely cause | What to do |
|---|---|---|
| `net::ERR_TIMED_OUT` or a page-load timeout | The live site was slow | Re-run; CI already retries twice. Persistent: check the site |
| `element is not visible` on a button or heading | Content fades in on scroll | Scroll it into view before the check |
| `element(s) not found` | The page text or layout changed | Compare with the live page; update the test or raise a Bug |
| "Expected to fail, but passed" | A known defect was fixed | Remove the `test.fail()` line |
| Passes locally, fails in CI | Timing on a slower machine | Look at the trace from the retry |
| Jira not updated | See the log table in section 5 | Fix the secret or permission |

Related documents: [Automation Architecture Document](architecture.md) · [Business Demonstration Guide](demo-guide.md)
