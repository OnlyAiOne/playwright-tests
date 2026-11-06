# Business Demonstration Guide

How to demonstrate the OnlyPPS test automation to the business team in about 12 minutes, using a test that already exists. Last reviewed 6 November 2026.

See also: [Automation Architecture Document](architecture.md) · [Automation Execution Guide](execution-guide.md)

Presentation material:

- Business demonstration deck: "OnlyPPS Automation Demo" (15 slides, with speaker notes)
- Business architecture deck: "OnlyPPS Business Architecture" (15 slides, with Implemented / Recommended labels)

## 1. Demonstration preparation

**The day before**

- [ ] Confirm the latest pipeline run passed: GitHub → **Actions** → **Playwright Tests**.
- [ ] Open story `OWA-31` in Jira and check its "Automated test results" comment shows the latest run.
- [ ] Run the suite once locally (`npm run pw:test`) so the browsers and packages are ready.
- [ ] Share the two decks with the audience from their **Share** menus.

**30 minutes before**

- [ ] Sign in to **GitHub** (needed to download the report) and **Jira** in the browser you will present from.
- [ ] Open these tabs:
  - Jira: https://ccbchennai.atlassian.net/browse/OWA-31
  - Jira: https://ccbchennai.atlassian.net/browse/OWA-35
  - GitHub Actions: https://github.com/OnlyAiOne/playwright-tests/actions
- [ ] Open PyCharm on the repository with `playwright/tests/contact.spec.js` showing and the terminal open.
- [ ] Run the demo command once (section 3) to warm up the site. The live site can be slow on the first load.
- [ ] Have a downloaded `playwright-report` from the latest run ready, in case the network is slow.

## 2. Jira story selection

Pick a story that is already automated, safe to run on the live site, easy to see, and meaningful to the business.

| Story | What it shows | Use it for |
|---|---|---|
| **OWA-31** Contact form accepts a complete enquiry | A visitor fills the contact form; 3 criteria, 2 tests. The form is never sent. | **Main scenario.** Visual and business-relevant |
| **OWA-35** Industries and Resources pages | 12 tests, including the known defect: the Industries page title is copied from Accounting Services | **Second scenario:** a real defect found |
| OWA-34 Services | All 14 service pages load with the right titles | Alternative: coverage at scale |
| OWA-29 Main navigation menu | Menu links lead to the right pages | Alternative: short and simple |

Do not demonstrate a workflow that is not automated. To check a story's current result before the demo, open it in Jira and read its results comment.

## 3. CI/CD execution

**Step 1: the requirement.** Open OWA-31 in Jira and read criterion 2 aloud.

**Step 2: the test.** In PyCharm, show `contact.spec.js` and the test `OWA-31: fills the contact form with sample data (not submitted)`.

**Step 3: run it live.** In the PyCharm terminal:

```bash
npx playwright test -g "OWA-31" --headed
```

Chrome opens, fills the form, attaches a file and closes. Expect **2 passed** in about 7 seconds. This local run does not post to Jira.

**Step 4: the pipeline.** Show the latest run in GitHub Actions and open its steps.

To show a pipeline run happening live (optional, takes a few minutes): **Actions** → **Playwright Tests** → **Run workflow** → `main`. Start it at the beginning of the demo so it has finished by step 6.

## 4. Result review

In the run you opened:

1. Expand **Run Playwright tests** to show every test with its result and time.
2. Expand **Post results to Jira** to show lines such as `OWA-31: comment updated`.
3. Under **Artifacts**, open `playwright-report` (or your pre-downloaded copy) and type `OWA-31` in its search box.
4. Open one test to show its steps. For OWA-35, open the Industries title test to show the expected and received title.

## 5. Jira validation

Back in Jira, refresh OWA-31 and check:

- [ ] The "Automated test results" comment shows the run's **time and commit**, matching the run you showed.
- [ ] It lists **2 of 2 passed**, with each test's time.
- [ ] The **story status is unchanged**: automation adds results, people move stories.
- [ ] Its **Full report and logs** link opens the same run.

Then open OWA-35: the comment says **PASSED with 1 known defect** and its failure details give the expected and received title. No screenshot is attached, because the failure is expected; screenshots are attached only when a test fails unexpectedly.

## 6. Business explanation

### The message in one sentence

Every change to onlypps.com is checked by 34 automated browser tests in about a minute, and the result is written on the Jira story it proves.

### Talking points

| Topic | Say |
|---|---|
| The problem | Checking 23 live pages by hand after every change is slow, so it gets skipped and mistakes reach visitors. |
| How it works | Each acceptance criterion becomes a test named after its story; every change runs all tests in a real browser; results return to Jira. |
| Proof it works | 8 pipeline runs, all passed; a real defect found on the live site. |
| Safety | Tests only read the site. The contact form is never actually sent. |
| Control | Automation never changes a story's status; the team decides when work is done. |
| Honesty | Some items are recommendations: review of every change, longer history, more browsers. See the architecture deck's gaps and roadmap. |

### Plain-language terms

| Term | Meaning |
|---|---|
| Playwright | The tool that drives a real browser like a visitor |
| Test | An automatic check of one acceptance criterion |
| GitHub | Where the test code is stored, with its full history |
| Pipeline / GitHub Actions | The service that runs all tests whenever the code changes |
| Report | The page that lists every check, with screenshots of failures |
| Known defect | A real problem on the site that is recorded and tracked, not hidden |

### Likely questions

| Question | Answer |
|---|---|
| Does it send real enquiries? | No. The form is filled but the send request is blocked. |
| How often does it run? | On every change to the tests in GitHub, and on demand. A nightly run is recommended. |
| Can it test a new page? | Yes: write a story with acceptance criteria in OWA, and it becomes a test. |
| How long are results kept? | The latest result is on the Jira story permanently; full reports are kept 30 days. |
| What if the site is slow? | A failing test is retried twice before it is reported. |
| Who sees the results? | Anyone with access to the OWA space in Jira. |
