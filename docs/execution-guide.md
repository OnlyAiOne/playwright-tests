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
| `npm run pw:test` | Run both suites, browser hidden |
| `npm run pw:onlypps` | Run only the onlypps.com suite (`playwright/tests/`) |
| `npm run pw:uqa` | Run only the UltimateQA suite (`playwright/ultimateqa/tests/`, 36 tests) |
| `npm run pw:headed` | Run all tests with the browser visible |
| `npm run pw:ui` | Open Playwright's interactive runner (pick tests, watch, re-run) |
| `npm run pw:report` | Open the HTML report of the last local run |
| `npm run pw:codegen` | Record clicks in a browser and generate test code |
| `npm run jira:report` | Preview the Jira comments for the last run (dry run unless Jira credentials are set) |
| `npm run jira:check` | Check that every story's Jira results comment shows the latest pipeline run on `main` (needs Jira credentials) |

Useful variations:

| Goal | Command |
|---|---|
| One story's tests | `npx playwright test -g "OWA-31"` |
| One file | `npx playwright test playwright/tests/contact.spec.js` |
| One suite | `npx playwright test --project=ultimateqa` |
| Skip the third-party sign-in page | `npx playwright test --grep-invert @external` |
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
| `BASE_URL` | `playwright/env.js` | Not set (default: production, `https://onlypps.com/`) | Site the tests run against; set it to test another environment |
| `UQA_BASE_URL` | `playwright/ultimateqa/env.js` | Not set (default: `https://ultimateqa.com/`) | Site the UltimateQA suite runs against |
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
| Projects | `onlypps`: folder `playwright/tests`, base URL `BASE_URL` from `playwright/env.js` (production `https://onlypps.com/` unless overridden). `ultimateqa`: folder `playwright/ultimateqa/tests`, base URL `UQA_BASE_URL` from `playwright/ultimateqa/env.js` |
| Parallel | Yes, across and within files. The number of workers is not set, so Playwright uses half the CPU cores |
| Retries | 2 in CI, 0 locally |
| Screenshot | Only when a test fails |
| Trace | On the first retry (so only in CI) |
| Reporters | HTML `playwright/report/`, JUnit `playwright/junit/results.xml`, JSON `playwright/results.json`, console list |
| Output folder | `playwright/test-results/` |
| Browser | Chromium (Desktop Chrome). Firefox and WebKit are written in but commented out |

Each spec file sets a 60-second limit per test, because the live site can be slow.

### Site address (base URL)

The production address is defined once, in `playwright/env.js`:

```javascript
const PROD_BASE_URL = 'https://onlypps.com/';
const BASE_URL = (process.env.BASE_URL || PROD_BASE_URL).replace(/\/*$/, '/');
```

`playwright.config.js` uses it as `baseURL`, and every spec imports it with `const { BASE_URL } = require('../env');` and builds page addresses as `BASE_URL + 'contact.php'`. Never write the site address in a test.

To run the same tests against another site, set `BASE_URL` for that terminal only (PowerShell):

```powershell
$env:BASE_URL="https://staging.example.com/"; npm run pw:test
```

Close the terminal, or run `Remove-Item Env:BASE_URL`, to go back to production. CI does not set `BASE_URL`, so the pipeline always tests production.

### UltimateQA suite

The UltimateQA suite under `playwright/ultimateqa/` covers the practice pages linked from https://ultimateqa.com/automation: 8 spec files, 36 tests, stories `OWA-38` to `OWA-45` under epic `OWA-37`. It follows the same rules as the onlypps suite (locators in `pages/`, notes header in each spec, story key at the start of each title), with three additions:

- **`safety.js`** blocks every POST to ultimateqa.com. The pages hold live contact and login forms, so nothing is ever sent. Specs that touch a form call `blockFormPosts(page)` in `beforeEach`.
- **`page-ready.js`** opens a page with `openPage(page, url)`. The site holds back about 30 scripts until the visitor first moves the mouse, and swallows clicks until they load. `openPage` moves the mouse once and waits for them, so clicks on radio buttons, checkboxes and buttons work every time. Use it for any page the test clicks on.
- The courses sign-in page (`login.spec.js`) is on a separate host, `courses.ultimateqa.com`, and is tagged `@external`. It only checks the form and never signs in.

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

**Checking that Jira shows the latest run:** `npm run jira:check` (`scripts/check-jira-sync.js`) finds the latest completed pipeline run on `main` that posts to Jira, reads each story's results comment, and compares the comment's commit and run link with that run. It needs the same Jira email and token as the pipeline, set for that terminal only:

```powershell
$env:JIRA_EMAIL="<your Jira email>"; $env:JIRA_API_TOKEN="<your token>"; npm run jira:check
```

```
Latest run on main: #12 · success · commit 683575a
Story    In sync  Commit   Comment updated                Result in Jira
OWA-31   yes      683575a  2026-11-06T21:38:47.925+0530   PASSED: 2 of 2 tests
OWA-35   NO       6ba1dad  2026-11-06T18:56:54.917+0530   PASSED with 1 known defect
```

| Result | Meaning | Exit code |
|---|---|---|
| `All N stories show run #…` | Every story is up to date | 0 |
| `NO` on a story | Its comment shows an older run: open that run's "Post results to Jira" step | 1 |
| `no results comment` | The pipeline has never posted to that story (a new story, or a renamed key) | 1 |
| `ERROR … 401 / 403` | Wrong or expired token, or no permission in OWA | 1 |
| `Set JIRA_EMAIL and JIRA_API_TOKEN first` | Credentials not set in this terminal | 2 |

Story keys are read from the test titles in `playwright/tests/`, so a new story is checked as soon as its test exists. The script only reads; it never changes Jira.

## 6. Test execution

**Adding a test for a new story:**

1. The story exists in OWA with numbered acceptance criteria.
2. Add the test to the spec file for that area of the site, or a new `*.spec.js` in `playwright/tests/`.
3. Add any new locators to that page's file in `playwright/pages/` (a new page gets a new file there, listed in `playwright/pages/index.js`).
4. Start its title with the key: `test('OWA-40: …', …)`.
5. Run it locally with `npx playwright test -g "OWA-40" --headed` until it passes.
6. Commit and push. The next pipeline run posts its result to OWA-40.

**Reusable locators (`playwright/pages/`)**

Test scripts never write selectors. Every locator lives in a page file and the tests use it by name:

```javascript
const { contactPage } = require('../pages');

await page.goto(BASE_URL + contactPage.path);
const contact = contactPage(page);
await contact.nameInput.fill('Test User');
await expect(contact.sendButton).toBeVisible();
```

| File | Locators for |
|---|---|
| `site-header.js` | Main menu links, Services / Resources / Industries dropdowns, phone menu button, header email and phone |
| `page-basics.js` | Anything on every page: `html`, meta description, images, links, a heading by name |
| `home.page.js` | Welcome banner, services heading, service tabs, enquiry form fields |
| `contact.page.js` | Heading, Send button, the contact form and its six fields |
| `about.page.js` | Headings, stat labels and values, fade-in sections |
| `services.page.js` | Services headings and service links; `payrollOutsourcing` for that service page |
| `industries.page.js` | Headings and industry cards |
| `resources.page.js` | Blog, HR Guides, HR Compliance Checklist and FAQ; their addresses in `paths` |

When the site changes a label or layout, fix the locator once in its page file; every test that uses it follows.

**Conventions in the existing tests:**

- Find elements as a visitor does: `getByRole`, `getByText`, `getByPlaceholder`, written in the page files.
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
